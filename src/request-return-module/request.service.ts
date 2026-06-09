// src/requests-module/product-request.service.ts
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
import { ProductRequest } from './entities/request.entity';
import { RequestItem } from './entities/request-items.entity';
import { Product } from '../product-module/entities/product.entity';
import { ConstructionSite } from '../construction-site-module/entities/construction-site.entity';
import { Account } from '../accounts-module/entities/account.entity';
import { CreateProductRequestDto } from './dto/create-product-request.dto';
import { ListProductRequestDto } from './dto/list-product-request.dto';
import {
  SuccessResponse,
  successResponse,
} from '../common/utils/success-response';
import { NotificationsService } from '../notifications-module/notifications.service';
import { NotificationType } from '../notifications-module/enums/notification-type.enum';

@Injectable()
export class RequestService {
  constructor(
    @InjectRepository(ProductRequest)
    private readonly requestRepository: Repository<ProductRequest>,
    @InjectRepository(RequestItem)
    private readonly requestItemRepository: Repository<RequestItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ConstructionSite)
    private readonly constructionSiteRepository: Repository<ConstructionSite>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(
    createDto: CreateProductRequestDto,
  ): Promise<SuccessResponse<ProductRequest>> {
    // Validate products exist
    if (createDto.requestItems && createDto.requestItems.length > 0) {
      for (const item of createDto.requestItems) {
        const product = await this.productRepository.findOne({
          where: { id: item.productId },
        });
        if (!product) {
          throw new NotFoundException(
            `Produit avec l'ID ${item.productId} introuvable`,
          );
        }
        // Ensure requested quantity is positive
        if (Number(item.requestedStock) <= 0) {
          throw new BadRequestException(
            `La quantité demandée pour le produit "${product.name}" doit être supérieure à zéro`,
          );
        }
      }
    } else {
      throw new BadRequestException(
        'La demande doit contenir au moins un article',
      );
    }

    // Validate construction site if provided
    if (createDto.constructionSiteId) {
      const site = await this.constructionSiteRepository.findOne({
        where: { id: createDto.constructionSiteId },
      });
      if (!site) {
        throw new NotFoundException(
          `Chantier avec l'ID ${createDto.constructionSiteId} introuvable`,
        );
      }
    }

    // Validate account if provided
    if (createDto.accountId) {
      const account = await this.accountRepository.findOne({
        where: { id: createDto.accountId },
      });
      if (!account) {
        throw new NotFoundException(
          `Compte avec l'ID ${createDto.accountId} introuvable`,
        );
      }
    }

    const requestData: DeepPartial<ProductRequest> = {
      date: createDto.date,
      observation: createDto.observation,
      confirmed: false,
      constructionSite: createDto.constructionSiteId
        ? ({ id: createDto.constructionSiteId } as any)
        : undefined,
      account: createDto.accountId
        ? ({ id: createDto.accountId } as any)
        : undefined,
      requestItems: createDto.requestItems.map((item) => ({
        product: { id: item.productId } as any,
        requestedStock: item.requestedStock,
      })),
    };

    const requestEntity = this.requestRepository.create(requestData);
    const savedRequest = await this.requestRepository.save(requestEntity);

    this.notificationsService
      .create({
        message: `Nouvelle demande créée le ${new Date(savedRequest.date).toLocaleDateString()}`,
        type: NotificationType.NEW_REQUEST, // Assurez-vous que l'enum contient cette valeur ou utilisez celle appropriée
      })
      .catch(() => {});

    const requestWithRelations = await this.requestRepository.findOne({
      where: { id: savedRequest.id } as FindOptionsWhere<ProductRequest>,
      relations: [
        'requestItems',
        'requestItems.product',
        'constructionSite',
        'account',
      ],
    });

    return successResponse(requestWithRelations!, 'Demande créée avec succès');
  }

  async findFiltered(listDto: ListProductRequestDto): Promise<
    SuccessResponse<{
      items: ProductRequest[];
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

    const where: FindOptionsWhere<ProductRequest> = {};

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

      // Filter by productId (through request items)
      if (listDto.filters.productId) {
        const matchingItems = await this.requestItemRepository.find({
          where: { product: { id: listDto.filters.productId } as any },
          relations: ['request'],
        });

        const matchingRequestIds = [
          ...new Set(matchingItems.map((item) => item.request.id)),
        ];

        if (matchingRequestIds.length === 0) {
          return successResponse(
            { items: [], total: 0, page, pageSize, lastPage: true },
            'Demandes récupérées avec succès',
          );
        }

        (where as any).id = In(matchingRequestIds);
      }
    }

    const [items, total] = await this.requestRepository.findAndCount({
      where,
      relations: [
        'requestItems',
        'requestItems.product',
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
      'Demandes récupérées avec succès',
    );
  }

  async confirm(id: number): Promise<SuccessResponse<ProductRequest>> {
    const requestEntity = await this.requestRepository.findOne({
      where: { id } as FindOptionsWhere<ProductRequest>,
      relations: ['requestItems', 'requestItems.product'],
    });

    if (!requestEntity) {
      throw new NotFoundException(`Demande avec l'ID ${id} introuvable`);
    }

    if (requestEntity.confirmed) {
      throw new ConflictException('Cette demande est déjà confirmée');
    }

    if (
      !requestEntity.requestItems ||
      requestEntity.requestItems.length === 0
    ) {
      throw new BadRequestException(
        'Impossible de confirmer une demande sans articles',
      );
    }

    // Phase 1: Validate stock availability for every item
    for (const item of requestEntity.requestItems) {
      const product = await this.productRepository.findOne({
        where: { id: item.product.id },
      });

      if (!product) {
        throw new NotFoundException(
          `Produit avec l'ID ${item.product.id} introuvable`,
        );
      }

      if (Number(product.stock) < Number(item.requestedStock)) {
        throw new BadRequestException(
          `Stock insuffisant pour le produit "${product.name}". ` +
            `Stock actuel: ${product.stock}, quantité demandée: ${item.requestedStock}`,
        );
      }
    }

    // Phase 2: Deduct stock and update products
    for (const item of requestEntity.requestItems) {
      const product = await this.productRepository.findOne({
        where: { id: item.product.id },
      });

      if (product) {
        product.stock = Number(product.stock) - Number(item.requestedStock);
        await this.productRepository.save(product);

        // Low stock alert
        if (Number(product.stock) < Number(product.minimumStock)) {
          this.notificationsService
            .create({
              message: `Alerte stock : "${product.name}" a atteint ${product.stock} unités (seuil minimum : ${product.minimumStock})`,
              type: NotificationType.STOCK_ALERT,
            })
            .catch(() => {});
        }
      }
    }

    requestEntity.confirmed = true;
    const confirmedRequest = await this.requestRepository.save(requestEntity);

    return successResponse(confirmedRequest, 'Demande confirmée avec succès');
  }

  async remove(id: number): Promise<SuccessResponse<null>> {
    const requestEntity = await this.requestRepository.findOne({
      where: { id } as FindOptionsWhere<ProductRequest>,
      relations: ['requestItems'],
    });

    if (!requestEntity) {
      throw new NotFoundException(`Demande avec l'ID ${id} introuvable`);
    }

    if (requestEntity.confirmed) {
      throw new ConflictException(
        'Impossible de supprimer une demande déjà confirmée',
      );
    }

    await this.requestRepository.remove(requestEntity);
    return successResponse(null, 'Demande supprimée avec succès');
  }
}
