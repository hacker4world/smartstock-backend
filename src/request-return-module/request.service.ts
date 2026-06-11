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
import {
  Export,
  ExportType,
} from 'src/import-export-module/entities/export.entity';
import { ExportItem } from 'src/import-export-module/entities/export-item.entity';
import { TurnProductRequestIntoExportDto } from './dto/turn-product-request-into-export.dto';

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

    @InjectRepository(Export)
    private readonly exportRepository: Repository<Export>,
    @InjectRepository(ExportItem)
    private readonly exportItemRepository: Repository<ExportItem>,
  ) {}

  async create(
    createDto: CreateProductRequestDto,
  ): Promise<SuccessResponse<ProductRequest>> {
    // Validate products exist
    if (!createDto.requestItems || createDto.requestItems.length === 0) {
      throw new BadRequestException(
        'La demande doit contenir au moins un article',
      );
    }

    for (const item of createDto.requestItems) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });
      if (!product) {
        throw new NotFoundException(
          `Produit avec l'ID ${item.productId} introuvable`,
        );
      }
      // Extra safety: already enforced by @IsInt() and @Min(1) in DTO
      if (item.requestedStock <= 0) {
        throw new BadRequestException(
          `La quantité demandée pour le produit "${product.name}" doit être supérieure à zéro`,
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

    const requestData: DeepPartial<ProductRequest> = {
      date: createDto.date,
      observation: createDto.observation,
      confirmed: false,
      constructionSite: { id: createDto.constructionSiteId } as any,
      account: { id: createDto.accountId } as any,
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
        type: NotificationType.NEW_REQUEST,
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

    requestEntity.confirmed = true;
    const confirmedRequest = await this.requestRepository.save(requestEntity);

    return successResponse(confirmedRequest, 'Demande confirmée avec succès');
  }

  async turnIntoExport(
    requestId: number,
    dto: TurnProductRequestIntoExportDto,
  ): Promise<SuccessResponse<Export>> {
    // Fetch the request with its items, products, and construction site
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
      relations: ['requestItems', 'requestItems.product', 'constructionSite'],
    });

    if (!request) {
      throw new NotFoundException(`Demande avec l'ID ${requestId} introuvable`);
    }

    if (!request.confirmed) {
      throw new BadRequestException(
        'Seules les demandes confirmées peuvent être converties en exportation',
      );
    }

    if (!request.requestItems || request.requestItems.length === 0) {
      throw new BadRequestException(
        'La demande ne contient aucun article à exporter',
      );
    }

    // Validate the new account
    const account = await this.accountRepository.findOne({
      where: { id: dto.accountId },
    });
    if (!account) {
      throw new NotFoundException(
        `Compte avec l'ID ${dto.accountId} introuvable`,
      );
    }

    // Validate unit prices: each product in the request must have an entry
    const productIdsInRequest = request.requestItems.map(
      (item) => item.product.id,
    );
    const priceMap = new Map<number, number>();
    for (const up of dto.unitPrices) {
      if (priceMap.has(up.productId)) {
        throw new BadRequestException(
          `Prix unitaire en double pour le produit ID ${up.productId}`,
        );
      }
      priceMap.set(up.productId, up.unitPrice);
    }

    const missingProductIds = productIdsInRequest.filter(
      (id) => !priceMap.has(id),
    );
    if (missingProductIds.length > 0) {
      throw new BadRequestException(
        `Prix unitaire manquant pour les produits : ${missingProductIds.join(', ')}`,
      );
    }

    // Build export entity directly (bypass ExportService to avoid double stock deduction)
    const exportEntity = this.exportRepository.create({
      date: request.date,
      observation: dto.observation ?? request.observation, // override from body if provided
      exportType: ExportType.TO_CONSTRUCTION_SITE,
      confirmed: false, // stock already deducted during request confirmation
      withTransporter: true,
      transporterName: dto.transporterName,
      transporterMatricule: dto.transporterMatricule,
      constructionSite: request.constructionSite,
      account: account,
      exportItems: request.requestItems.map((item) =>
        this.exportItemRepository.create({
          product: item.product,
          exitedStock: item.requestedStock,
          unitPrice: priceMap.get(item.product.id)!,
        }),
      ),
    });

    const savedExport = await this.exportRepository.save(exportEntity);

    // Optional notification
    this.notificationsService
      .create({
        message: `Exportation générée depuis la demande #${requestId}`,
        type: NotificationType.NEW_EXPORT,
      })
      .catch(() => {});

    const fullExport = await this.exportRepository.findOne({
      where: { id: savedExport.id },
      relations: [
        'exportItems',
        'exportItems.product',
        'warehouse',
        'constructionSite',
        'account',
      ],
    });

    return successResponse(
      fullExport!,
      'Demande convertie en exportation avec succès',
    );
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
