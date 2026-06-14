// src/returns-module/product-return.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import {
  Repository,
  ILike,
  Between,
  FindOptionsWhere,
  In,
  DeepPartial,
} from 'typeorm';
import { Return } from './entities/return.entity';
import { ReturnItem } from './entities/return-item.entity';
import { Product } from '../product-module/entities/product.entity';
import { ConstructionSite } from '../construction-site-module/entities/construction-site.entity';
import { Account } from '../accounts-module/entities/account.entity';
import { CreateReturnDto } from './dto/create-return.dto';
import { ListReturnDto } from './dto/list-return.dto';
import {
  SuccessResponse,
  successResponse,
} from '../common/utils/success-response';
import { NotificationsService } from '../notifications-module/notifications.service';
import { NotificationType } from '../notifications-module/enums/notification-type.enum';
import { ConfirmReturnDto } from './dto/confirm-return.dto';
import { PdfGenerationService } from 'src/common/document-generation/document-generation.service';

@Injectable()
export class ProductReturnService {
  constructor(
    @InjectRepository(Return)
    private readonly returnRepository: Repository<Return>,
    @InjectRepository(ReturnItem)
    private readonly returnItemRepository: Repository<ReturnItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ConstructionSite)
    private readonly constructionSiteRepository: Repository<ConstructionSite>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
    private readonly documentService: PdfGenerationService,
  ) {}

  async create(createDto: CreateReturnDto): Promise<SuccessResponse<Return>> {
    // Validate products exist
    if (!createDto.returnItems || createDto.returnItems.length === 0) {
      throw new BadRequestException(
        'Le retour doit contenir au moins un article',
      );
    }

    for (const item of createDto.returnItems) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });
      if (!product) {
        throw new NotFoundException(
          `Produit avec l'ID ${item.productId} introuvable`,
        );
      }
      if (item.returnedStock <= 0) {
        throw new BadRequestException(
          `La quantité retournée pour le produit "${product.name}" doit être supérieure à zéro`,
        );
      }
    }

    // Validate construction site (required)
    const constructionSite = await this.constructionSiteRepository.findOne({
      where: { id: createDto.constructionSiteId },
    });
    if (!constructionSite) {
      throw new NotFoundException(
        `Chantier avec l'ID ${createDto.constructionSiteId} introuvable`,
      );
    }

    // Validate account (required)
    const account = await this.accountRepository.findOne({
      where: { id: createDto.accountId },
    });
    if (!account) {
      throw new NotFoundException(
        `Compte avec l'ID ${createDto.accountId} introuvable`,
      );
    }

    const returnData: DeepPartial<Return> = {
      date: createDto.date,
      observation: createDto.observation,
      confirmed: false,
      constructionSite: { id: createDto.constructionSiteId } as any,
      account: { id: createDto.accountId } as any,
      returnItems: createDto.returnItems.map((item) => ({
        product: { id: item.productId } as any,
        returnedStock: item.returnedStock,
        reason: item.reason,
      })),
    };

    const returnEntity = this.returnRepository.create(returnData);
    const savedReturn = await this.returnRepository.save(returnEntity);

    this.notificationsService
      .create({
        message: `Nouveau retour créé le ${new Date(savedReturn.date).toLocaleDateString()}`,
        type: NotificationType.NEW_RETURN,
      })
      .catch(() => {});

    const returnWithRelations = await this.returnRepository.findOne({
      where: { id: savedReturn.id } as FindOptionsWhere<Return>,
      relations: [
        'returnItems',
        'returnItems.product',
        'constructionSite',
        'account',
      ],
    });

    return successResponse(returnWithRelations!, 'Retour créé avec succès');
  }

  async findFiltered(listDto: ListReturnDto): Promise<
    SuccessResponse<{
      items: Return[];
      total: number;
      page: number;
      pageSize: number;
      lastPage: boolean;
    }>
  > {
    const maxPageSize = this.configService.get<number>('PAGE_SIZE', 20);
    const page = listDto.page ?? 1;
    let pageSize = listDto.pageSize ?? maxPageSize;

    if (pageSize > maxPageSize) {
      pageSize = maxPageSize;
    }

    const where: FindOptionsWhere<Return> = {};

    if (listDto.filters) {
      if (listDto.filters.accountId) {
        where.account = { id: listDto.filters.accountId } as any;
      }

      if (listDto.filters.constructionSiteId) {
        where.constructionSite = {
          id: listDto.filters.constructionSiteId,
        } as any;
      }

      if (listDto.filters.observation) {
        where.observation = ILike(`%${listDto.filters.observation}%`);
      }

      if (listDto.filters.confirmed !== undefined) {
        where.confirmed = listDto.filters.confirmed;
      }

      if (listDto.filters.dateFrom && listDto.filters.dateTo) {
        where.date = Between(
          new Date(listDto.filters.dateFrom),
          new Date(listDto.filters.dateTo),
        );
      } else if (listDto.filters.dateFrom) {
        where.date = Between(
          new Date(listDto.filters.dateFrom),
          new Date('9999-12-31'),
        );
      } else if (listDto.filters.dateTo) {
        where.date = Between(
          new Date('1970-01-01'),
          new Date(listDto.filters.dateTo),
        );
      }

      // Product filter via ReturnItem
      if (listDto.filters.productId) {
        const matchingItems = await this.returnItemRepository.find({
          where: { product: { id: listDto.filters.productId } as any },
          relations: ['return'],
        });
        const matchingIds = [
          ...new Set(matchingItems.map((item) => item.return.id)),
        ];
        if (matchingIds.length === 0) {
          return successResponse(
            { items: [], total: 0, page, pageSize, lastPage: true },
            'Retours récupérés avec succès',
          );
        }
        (where as any).id = In(matchingIds);
      }
    }

    const [items, total] = await this.returnRepository.findAndCount({
      where,
      relations: [
        'returnItems',
        'returnItems.product',
        'constructionSite',
        'account',
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    const lastPage = page * pageSize >= total;

    return successResponse(
      { items, total, page, pageSize, lastPage },
      'Retours récupérés avec succès',
    );
  }

  async remove(id: number): Promise<SuccessResponse<null>> {
    const returnEntity = await this.returnRepository.findOne({
      where: { id } as FindOptionsWhere<Return>,
      relations: ['returnItems'],
    });

    if (!returnEntity) {
      throw new NotFoundException(`Retour avec l'ID ${id} introuvable`);
    }

    if (returnEntity.confirmed) {
      throw new ConflictException(
        'Impossible de supprimer un retour déjà confirmé',
      );
    }

    await this.returnRepository.remove(returnEntity);
    return successResponse(null, 'Retour supprimé avec succès');
  }

  // Inside ProductReturnService class

  async confirm(
    id: number,
    confirmDto: ConfirmReturnDto,
  ): Promise<SuccessResponse<Return>> {
    // 1. Fetch the return with all items and their products
    const returnEntity = await this.returnRepository.findOne({
      where: { id } as FindOptionsWhere<Return>,
      relations: ['returnItems', 'returnItems.product'],
    });

    if (!returnEntity) {
      throw new NotFoundException(`Retour avec l'ID ${id} introuvable`);
    }

    if (returnEntity.confirmed) {
      throw new ConflictException('Ce retour est déjà confirmé');
    }

    if (!returnEntity.returnItems || returnEntity.returnItems.length === 0) {
      throw new BadRequestException(
        'Impossible de confirmer un retour sans articles',
      );
    }

    // 2. Build a map of restock decisions from the DTO
    const restockMap = new Map<number, boolean>();
    for (const item of confirmDto.items) {
      if (restockMap.has(item.productId)) {
        throw new BadRequestException(
          `Produit ID ${item.productId} en double dans la confirmation`,
        );
      }
      restockMap.set(item.productId, item.restock);
    }

    // 3. Validate that each product in the return has a decision
    const missingProductIds = returnEntity.returnItems
      .filter((item) => !restockMap.has(item.product.id))
      .map((item) => item.product.id);

    if (missingProductIds.length > 0) {
      throw new BadRequestException(
        `Décision de restock manquante pour les produits : ${missingProductIds.join(', ')}`,
      );
    }

    // 4. Process stock updates only for restock = true
    for (const returnItem of returnEntity.returnItems) {
      const shouldRestock = restockMap.get(returnItem.product.id);

      if (shouldRestock) {
        const product = await this.productRepository.findOne({
          where: { id: returnItem.product.id },
        });

        if (product) {
          product.stock =
            Number(product.stock) + Number(returnItem.returnedStock);
          await this.productRepository.save(product);
        }
      }
    }

    const generatedDocument =
      await this.documentService.generateBonDeRetourForRetour(returnEntity);

    // 5. Attach transporter information and mark as confirmed
    returnEntity.transporterName = confirmDto.transporterName;
    returnEntity.transporterMatricule = confirmDto.transporterMatricule;
    returnEntity.confirmed = true;
    returnEntity.bonRetour = generatedDocument.filename;

    const confirmedReturn = await this.returnRepository.save(returnEntity);

    // 6. Reload with relations for response
    const fullReturn = await this.returnRepository.findOne({
      where: { id: confirmedReturn.id } as FindOptionsWhere<Return>,
      relations: [
        'returnItems',
        'returnItems.product',
        'constructionSite',
        'account',
      ],
    });

    return successResponse(fullReturn!, 'Retour confirmé avec succès');
  }
}
