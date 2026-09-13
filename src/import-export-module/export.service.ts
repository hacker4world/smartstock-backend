// src/import-export-module/export.service.ts
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
import { Export, ExportType } from './entities/export.entity';
import { ExportItem } from './entities/export-item.entity';
import { Product } from '../product-module/entities/product.entity';
import { Warehouse } from '../configuration-module/entities/warehouse.entity';
import { ConstructionSite } from '../construction-site-module/entities/construction-site.entity';
import { CreateExportDto } from './dto/create-export.dto';
import { UpdateExportDto } from './dto/update-export.dto';
import { ListExportDto } from './dto/list-export.dto';
import {
  SuccessResponse,
  successResponse,
} from '../common/utils/success-response';
import { Account } from 'src/accounts-module/entities/account.entity';
import { NotificationsService } from 'src/notifications-module/notifications.service';
import { NotificationType } from 'src/notifications-module/enums/notification-type.enum';
import { PdfGenerationService } from 'src/common/document-generation/document-generation.service';

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(Export)
    private readonly exportRepository: Repository<Export>,
    @InjectRepository(ExportItem)
    private readonly exportItemRepository: Repository<ExportItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
    @InjectRepository(ConstructionSite)
    private readonly constructionSiteRepository: Repository<ConstructionSite>,
    private readonly configService: ConfigService,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly notificationsService: NotificationsService,
    private readonly documentService: PdfGenerationService,
  ) {}

  async create(
    createExportDto: CreateExportDto,
  ): Promise<SuccessResponse<Export>> {
    // Validate products exist

    if (createExportDto.exportItems && createExportDto.exportItems.length > 0) {
      for (const item of createExportDto.exportItems) {
        const product = await this.productRepository.findOne({
          where: { id: item.productId },
        });
        if (!product) {
          throw new NotFoundException(
            `Produit avec l'ID ${item.productId} introuvable`,
          );
        }

        const currentStock = Number(product.stock);
        const exitedStock = Number(item.exitedStock);

        if (currentStock < exitedStock) {
          throw new BadRequestException(
            `Stock insuffisant pour le produit "${product.name}". ` +
              `Stock actuel: ${currentStock}, quantité demandée: ${exitedStock}`,
          );
        }
      }
    }

    // Validate warehouse if exportType is to-warehouse
    if (createExportDto.exportType === ExportType.TO_WAREHOUSE) {
      if (!createExportDto.warehouseId) {
        throw new BadRequestException(
          'Un entrepôt est requis pour une exportation de type "to-warehouse"',
        );
      }
      const warehouse = await this.warehouseRepository.findOne({
        where: { id: createExportDto.warehouseId },
      });
      if (!warehouse) {
        throw new NotFoundException(
          `Entrepôt avec l'ID ${createExportDto.warehouseId} introuvable`,
        );
      }
    }

    // Validate construction site if exportType is to-construction-site
    if (createExportDto.exportType === ExportType.TO_CONSTRUCTION_SITE) {
      if (!createExportDto.constructionSiteId) {
        throw new BadRequestException(
          'Un chantier est requis pour une exportation de type "to-construction-site"',
        );
      }
      const constructionSite = await this.constructionSiteRepository.findOne({
        where: { id: createExportDto.constructionSiteId },
      });
      if (!constructionSite) {
        throw new NotFoundException(
          `Chantier avec l'ID ${createExportDto.constructionSiteId} introuvable`,
        );
      }
    }

    const account = await this.accountRepository.findOne({
      where: { id: createExportDto.accountId },
    });
    if (!account) {
      throw new NotFoundException(
        `Compte avec l'ID ${createExportDto.accountId} introuvable`,
      );
    }

    // Determine withTransporter and transporter fields
    let withTransporter = false;
    let transporterName: string | undefined = undefined;
    let transporterMatricule: string | undefined = undefined;

    if (
      createExportDto.exportType === ExportType.TO_WAREHOUSE ||
      createExportDto.exportType === ExportType.TO_CONSTRUCTION_SITE
    ) {
      withTransporter = true;
      transporterName = createExportDto.transporterName ?? undefined;
      transporterMatricule = createExportDto.transporterMatricule ?? undefined;
    } else if (createExportDto.exportType === ExportType.EXTERNAL) {
      withTransporter = createExportDto.withTransporter ?? false;
      if (withTransporter) {
        transporterName = createExportDto.transporterName ?? undefined;
        transporterMatricule =
          createExportDto.transporterMatricule ?? undefined;
      }
    }

    // Build the entity data with explicit DeepPartial<Export> type
    // to avoid excess property checking issues
    const exportData: DeepPartial<Export> = {
      date: createExportDto.date, // string — TypeORM converts it, matching ImportService pattern
      observation: createExportDto.observation,
      confirmed: false,
      exportType: createExportDto.exportType,
      warehouse: createExportDto.warehouseId
        ? ({ id: createExportDto.warehouseId } as any)
        : undefined, // ← undefined instead of null
      constructionSite: createExportDto.constructionSiteId
        ? ({ id: createExportDto.constructionSiteId } as any)
        : undefined, // ← undefined instead of null
      entrepriseName: createExportDto.entrepriseName ?? undefined,
      address: createExportDto.address ?? undefined,
      matriculeFiscale: createExportDto.matriculeFiscale ?? undefined,
      clientName: createExportDto.clientName ?? undefined,
      withTransporter,
      transporterName,
      transporterMatricule,
      account: { id: createExportDto.accountId } as any,
      exportItems: createExportDto.exportItems?.map((item) => ({
        product: { id: item.productId } as any,
        exitedStock: item.exitedStock,
        unitPrice: item.unitPrice,
      })),
    };

    const exportEntity = this.exportRepository.create(exportData);
    const savedExport = await this.exportRepository.save(exportEntity);

    this.notificationsService
      .create({
        message: `Nouvelle exportation créée le ${new Date(savedExport.date).toLocaleDateString()}`,
        type: NotificationType.NEW_EXPORT,
      })
      .catch(() => {});

    const exportWithRelations = (await this.exportRepository.findOne({
      where: { id: savedExport.id } as FindOptionsWhere<Export>,
      relations: [
        'exportItems',
        'exportItems.product',
        'warehouse',
        'constructionSite',
        'account',
      ],
    })) as Export;

    return successResponse(
      exportWithRelations,
      'Exportation créée avec succès',
    );
  }

  async findAll(): Promise<SuccessResponse<Export[]>> {
    const exports = await this.exportRepository.find({
      relations: [
        'exportItems',
        'exportItems.product',
        'warehouse',
        'constructionSite',
      ],
      order: { createdAt: 'DESC' },
    });
    return successResponse(exports, 'Exportations récupérées avec succès');
  }

  async findFiltered(listExportDto: ListExportDto): Promise<
    SuccessResponse<{
      items: Export[];
      total: number;
      page: number;
      pageSize: number;
      lastPage: boolean;
    }>
  > {
    const maxPageSize = this.configService.get<number>('PAGE_SIZE', 20);
    const page = listExportDto.page ?? 1;
    let pageSize = listExportDto.pageSize ?? maxPageSize;

    if (pageSize > maxPageSize) {
      pageSize = maxPageSize;
    }

    const where: FindOptionsWhere<Export> = {};

    if (listExportDto.filters) {
      if (listExportDto.filters.accountId) {
        where.account = { id: listExportDto.filters.accountId } as any;
      }

      if (listExportDto.filters.observation) {
        where.observation = ILike(`%${listExportDto.filters.observation}%`);
      }

      if (listExportDto.filters.exportType) {
        where.exportType = listExportDto.filters.exportType;
      }

      if (listExportDto.filters.warehouseId) {
        where.warehouse = {
          id: listExportDto.filters.warehouseId,
        } as any;
      }

      if (listExportDto.filters.constructionSiteId) {
        where.constructionSite = {
          id: listExportDto.filters.constructionSiteId,
        } as any;
      }

      if (listExportDto.filters.confirmed !== undefined) {
        where.confirmed = listExportDto.filters.confirmed;
      }

      if (listExportDto.filters.dateFrom && listExportDto.filters.dateTo) {
        where.date = Between(
          new Date(listExportDto.filters.dateFrom),
          new Date(listExportDto.filters.dateTo),
        );
      } else if (listExportDto.filters.dateFrom) {
        where.date = Between(
          new Date(listExportDto.filters.dateFrom),
          new Date('9999-12-31'),
        );
      } else if (listExportDto.filters.dateTo) {
        where.date = Between(
          new Date('1970-01-01'),
          new Date(listExportDto.filters.dateTo),
        );
      }

      // --- Item-level filters ---
      const exportItemWhere: FindOptionsWhere<ExportItem> = {};

      if (listExportDto.filters.productId) {
        exportItemWhere.product = {
          id: listExportDto.filters.productId,
        } as any;
      }

      if (Object.keys(exportItemWhere).length > 0) {
        const matchingItems = await this.exportItemRepository.find({
          where: exportItemWhere,
          relations: ['export'],
        });

        const matchingExportIds = [
          ...new Set(matchingItems.map((item) => item.export.id)),
        ];

        if (matchingExportIds.length === 0) {
          return successResponse(
            { items: [], total: 0, page, pageSize, lastPage: true },
            'Exportations récupérées avec succès',
          );
        }

        (where as any).id = In(matchingExportIds);
      }
    }

    const [items, total] = await this.exportRepository.findAndCount({
      where,
      relations: [
        'exportItems',
        'exportItems.product',
        'warehouse',
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
      'Exportations récupérées avec succès',
    );
  }

  async findOne(id: number): Promise<SuccessResponse<Export>> {
    const exportEntity = await this.exportRepository.findOne({
      where: { id } as FindOptionsWhere<Export>,
      relations: [
        'exportItems',
        'exportItems.product',
        'warehouse',
        'constructionSite',
      ],
    });
    if (!exportEntity) {
      throw new NotFoundException(`Exportation avec l'ID ${id} introuvable`);
    }
    return successResponse(exportEntity, 'Exportation récupérée avec succès');
  }

  async update(
    id: number,
    updateExportDto: UpdateExportDto,
  ): Promise<SuccessResponse<Export>> {
    const result = await this.findOne(id);
    const exportEntity = result.data;

    // Prevent updating a confirmed export
    if (exportEntity.confirmed) {
      throw new ConflictException(
        'Impossible de modifier une exportation déjà confirmée',
      );
    }

    // Update scalar fields
    if (updateExportDto.date !== undefined) {
      exportEntity.date = new Date(updateExportDto.date);
    }
    if (updateExportDto.observation !== undefined) {
      exportEntity.observation = updateExportDto.observation;
    }
    if (updateExportDto.exportType !== undefined) {
      exportEntity.exportType = updateExportDto.exportType;
    }

    // Update warehouse
    if (updateExportDto.warehouseId !== undefined) {
      exportEntity.warehouse = { id: updateExportDto.warehouseId } as any;
    }

    // Update construction site
    if (updateExportDto.constructionSiteId !== undefined) {
      exportEntity.constructionSite = {
        id: updateExportDto.constructionSiteId,
      } as any;
    }

    // Update external fields
    if (updateExportDto.entrepriseName !== undefined) {
      exportEntity.entrepriseName = updateExportDto.entrepriseName;
    }
    if (updateExportDto.address !== undefined) {
      exportEntity.address = updateExportDto.address;
    }
    if (updateExportDto.matriculeFiscale !== undefined) {
      exportEntity.matriculeFiscale = updateExportDto.matriculeFiscale;
    }
    if (updateExportDto.clientName !== undefined) {
      exportEntity.clientName = updateExportDto.clientName;
    }

    // Update transporter fields
    if (updateExportDto.withTransporter !== undefined) {
      exportEntity.withTransporter = updateExportDto.withTransporter;
    }
    if (updateExportDto.transporterName !== undefined) {
      exportEntity.transporterName = updateExportDto.transporterName;
    }
    if (updateExportDto.transporterMatricule !== undefined) {
      exportEntity.transporterMatricule = updateExportDto.transporterMatricule;
    }

    // Handle export items update
    if (updateExportDto.exportItems !== undefined) {
      // Validate products exist
      for (const item of updateExportDto.exportItems) {
        const product = await this.productRepository.findOne({
          where: { id: item.productId },
        });
        if (!product) {
          throw new NotFoundException(
            `Produit avec l'ID ${item.productId} introuvable`,
          );
        }
      }

      // Remove old items
      if (exportEntity.exportItems?.length > 0) {
        await this.exportItemRepository.remove(exportEntity.exportItems);
      }

      // Set new items
      exportEntity.exportItems = updateExportDto.exportItems.map((item) =>
        this.exportItemRepository.create({
          product: { id: item.productId } as any,
          exitedStock: item.exitedStock,
          unitPrice: item.unitPrice,
        }),
      );
    }

    const updatedExport = await this.exportRepository.save(exportEntity);
    return successResponse(
      updatedExport,
      'Exportation mise à jour avec succès',
    );
  }

  async confirm(id: number): Promise<SuccessResponse<Export>> {
    const result = await this.findOne(id);
    const exportEntity = result.data;

    if (exportEntity.confirmed) {
      throw new ConflictException('Cette exportation est déjà confirmée');
    }

    if (!exportEntity.exportItems || exportEntity.exportItems.length === 0) {
      throw new BadRequestException(
        'Impossible de confirmer une exportation sans articles',
      );
    }

    // Phase 1: Validation — check stock sufficiency for ALL items before deducting any
    for (const item of exportEntity.exportItems) {
      if (exportEntity.exportType !== ExportType.TO_WAREHOUSE) {
        const product = await this.productRepository.findOne({
          where: { id: item.product.id },
        });

        if (!product) {
          throw new NotFoundException(
            `Produit avec l'ID ${item.product.id} introuvable`,
          );
        }

        const currentStock = Number(product.stock);
        const exitedStock = Number(item.exitedStock);

        if (currentStock < exitedStock) {
          throw new BadRequestException(
            `Stock insuffisant pour le produit "${product.name}". ` +
              `Stock actuel: ${currentStock}, quantité demandée: ${exitedStock}`,
          );
        }
      }
    }

    // Phase 2: Deduction — all checks passed, proceed with stock deduction
    for (const item of exportEntity.exportItems) {
      if (exportEntity.exportType !== ExportType.TO_WAREHOUSE) {
        const product = await this.productRepository.findOne({
          where: { id: item.product.id },
        });

        if (product) {
          product.stock = Number(product.stock) - Number(item.exitedStock);
          await this.productRepository.save(product);

          // Notify if stock reaches 0
          if (Number(product.stock) === 0) {
            this.notificationsService
              .create({
                message: `Alerte stock épuisé : "${product.name}" est en rupture de stock (0 unité restante)`,
                type: NotificationType.STOCK_ALERT,
              })
              .catch(() => {});
          }
          // Notify if stock falls below minimum threshold
          else if (Number(product.stock) < Number(product.minimumStock)) {
            this.notificationsService
              .create({
                message: `Alerte stock : "${product.name}" a atteint ${product.stock} unités (seuil minimum : ${product.minimumStock})`,
                type: NotificationType.STOCK_ALERT,
              })
              .catch(() => {});
          }
        }
      }
    }

    let generatedDocument: any = null;

    if (exportEntity.exportType == ExportType.EXTERNAL) {
      generatedDocument =
        await this.documentService.generateBonDeLivraisonForSortie(
          exportEntity,
        );
    } else {
      generatedDocument =
        await this.documentService.generateFicheExpeditionForSortie(
          exportEntity,
        );
    }

    exportEntity.ficheExpedition = generatedDocument.filename;

    exportEntity.confirmed = true;
    const confirmedExport = await this.exportRepository.save(exportEntity);

    return successResponse(
      confirmedExport,
      'Exportation confirmée avec succès',
    );
  }

  async remove(id: number): Promise<SuccessResponse<null>> {
    const result = await this.findOne(id);
    const exportEntity = result.data;

    await this.exportRepository.remove(exportEntity);
    return successResponse(null, 'Exportation supprimée avec succès');
  }

  async generateDocument(id: number) {
    const exportEntity = await this.exportRepository.findOne({ where: { id } });

    this.documentService.generateFicheExpeditionForSortie(exportEntity!);
  }
}
