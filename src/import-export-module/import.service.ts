// src/import-export-module/import.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, ILike, Between, FindOptionsWhere, In } from 'typeorm';
import { Import } from './entities/import.entity';
import { ImportItem } from './entities/import-item.entity';
import { Product } from '../product-module/entities/product.entity';
import { CreateImportDto } from './dto/create-import.dto';
import { UpdateImportDto } from './dto/update-import.dto';
import { ListImportDto } from './dto/list-import.dto';
import {
  SuccessResponse,
  successResponse,
} from '../common/utils/success-response';
import { NotificationsService } from 'src/notifications-module/notifications.service';
import { NotificationType } from 'src/notifications-module/enums/notification-type.enum';

@Injectable()
export class ImportService {
  constructor(
    @InjectRepository(Import)
    private readonly importRepository: Repository<Import>,
    @InjectRepository(ImportItem)
    private readonly importItemRepository: Repository<ImportItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(
    createImportDto: CreateImportDto,
    bonDeCommande?: string,
    bonDeLivraison?: string,
  ): Promise<SuccessResponse<Import>> {
    // Validate that all products exist
    if (createImportDto.importItems && createImportDto.importItems.length > 0) {
      for (const item of createImportDto.importItems) {
        const product = await this.productRepository.findOne({
          where: { id: item.productId },
        });
        if (!product) {
          throw new NotFoundException(
            `Produit avec l'ID ${item.productId} introuvable`,
          );
        }
      }
    }

    const importEntity = this.importRepository.create({
      date: createImportDto.date,
      observation: createImportDto.observation,
      confirmed: false,
      bonDeCommande: bonDeCommande ?? '',
      bonDeLivraison: bonDeLivraison ?? '',
      supplier: { id: createImportDto.supplierId } as any,
      manufacturer: { id: createImportDto.manufacturerId } as any,
      account: { id: createImportDto.accountId } as any,
      importItems: createImportDto.importItems?.map((item) => ({
        product: { id: item.productId } as any,
        enteredStock: item.enteredStock,
        unitPrice: item.unitPrice,
      })),
    });

    const savedImport = await this.importRepository.save(importEntity);

    await this.notificationsService
      .create({
        message: `Nouvel import créé le ${new Date(savedImport.date).toLocaleDateString()}`,
        type: NotificationType.NEW_IMPORT,
      })
      .catch(() => {}); // Fire-and-forget — don't fail the import if notification fails

    const importWithRelations = (await this.importRepository.findOne({
      where: { id: savedImport.id },
      relations: [
        'importItems',
        'importItems.product',
        'supplier',
        'manufacturer',
        'account',
      ],
    })) as Import;

    return successResponse(importWithRelations, 'Import créé avec succès');
  }

  async findAll(): Promise<SuccessResponse<Import[]>> {
    const imports = await this.importRepository.find({
      relations: [
        'importItems',
        'importItems.product',
        'supplier',
        'manufacturer',
        'account',
      ],
      order: { createdAt: 'DESC' },
    });
    return successResponse(imports, 'Imports récupérés avec succès');
  }

  // src/import-export-module/import.service.ts
  // (Keep all imports as-is, only modify the findFiltered method)

  async findFiltered(listImportDto: ListImportDto): Promise<
    SuccessResponse<{
      items: Import[];
      total: number;
      page: number;
      pageSize: number;
      lastPage: boolean;
    }>
  > {
    const maxPageSize = this.configService.get<number>('PAGE_SIZE', 20);
    const page = listImportDto.page ?? 1;
    let pageSize = listImportDto.pageSize ?? maxPageSize;

    if (pageSize > maxPageSize) {
      pageSize = maxPageSize;
    }

    const where: FindOptionsWhere<Import> = {};

    if (listImportDto.filters) {
      if (listImportDto.filters.observation) {
        where.observation = ILike(`%${listImportDto.filters.observation}%`);
      }

      if (listImportDto.filters.supplierId) {
        where.supplier = { id: listImportDto.filters.supplierId } as any;
      }

      if (listImportDto.filters.manufacturerId) {
        where.manufacturer = {
          id: listImportDto.filters.manufacturerId,
        } as any;
      }

      if (listImportDto.filters.accountId) {
        where.account = { id: listImportDto.filters.accountId } as any;
      }

      if (listImportDto.filters.confirmed !== undefined) {
        where.confirmed = listImportDto.filters.confirmed;
      }

      if (listImportDto.filters.dateFrom && listImportDto.filters.dateTo) {
        where.date = Between(
          new Date(listImportDto.filters.dateFrom),
          new Date(listImportDto.filters.dateTo),
        );
      } else if (listImportDto.filters.dateFrom) {
        where.date = Between(
          new Date(listImportDto.filters.dateFrom),
          new Date('9999-12-31'),
        );
      } else if (listImportDto.filters.dateTo) {
        where.date = Between(
          new Date('1970-01-01'),
          new Date(listImportDto.filters.dateTo),
        );
      }

      // --- Item-level filters: find matching import IDs separately ---
      const importItemWhere: FindOptionsWhere<ImportItem> = {};

      if (listImportDto.filters.productId) {
        importItemWhere.product = {
          id: listImportDto.filters.productId,
        } as any;
      }

      // If there are item-level filters, find matching import IDs first,
      // then filter the main query by those IDs — this way ALL import items
      // are loaded for each matching import, not just the filtered ones.
      if (Object.keys(importItemWhere).length > 0) {
        const matchingItems = await this.importItemRepository.find({
          where: importItemWhere,
          relations: ['import'],
        });

        const matchingImportIds = [
          ...new Set(matchingItems.map((item) => item.import.id)),
        ];

        if (matchingImportIds.length === 0) {
          return successResponse(
            { items: [], total: 0, page, pageSize, lastPage: true },
            'Imports récupérés avec succès',
          );
        }

        (where as any).id = In(matchingImportIds);
      }
    }

    const [items, total] = await this.importRepository.findAndCount({
      where,
      relations: [
        'importItems',
        'importItems.product',
        'supplier',
        'manufacturer',
        'account',
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    const lastPage = page * pageSize >= total;

    return successResponse(
      { items, total, page, pageSize, lastPage },
      'Imports récupérés avec succès',
    );
  }

  async findOne(id: number): Promise<SuccessResponse<Import>> {
    const importEntity = await this.importRepository.findOne({
      where: { id },
      relations: [
        'importItems',
        'importItems.product',
        'supplier',
        'manufacturer',
        'account',
      ],
    });
    if (!importEntity) {
      throw new NotFoundException(`Import avec l'ID ${id} introuvable`);
    }
    return successResponse(importEntity, 'Import récupéré avec succès');
  }

  async update(
    id: number,
    updateImportDto: UpdateImportDto,
    bonDeCommande?: string,
    bonDeLivraison?: string,
  ): Promise<SuccessResponse<Import>> {
    const importEntity = await this.findOne(id);

    // Prevent updating a confirmed import
    if (importEntity.data.confirmed) {
      throw new ConflictException(
        'Impossible de modifier un import déjà confirmé',
      );
    }

    // Update file fields if new files were uploaded
    if (bonDeCommande !== undefined) {
      importEntity.data.bonDeCommande = bonDeCommande;
    }
    if (bonDeLivraison !== undefined) {
      importEntity.data.bonDeLivraison = bonDeLivraison;
    }

    // Update scalar fields
    if (updateImportDto.date !== undefined) {
      importEntity.data.date = new Date(updateImportDto.date);
    }
    if (updateImportDto.observation !== undefined) {
      importEntity.data.observation = updateImportDto.observation;
    }
    if (updateImportDto.supplierId !== undefined) {
      importEntity.data.supplier = { id: updateImportDto.supplierId } as any;
    }
    if (updateImportDto.manufacturerId !== undefined) {
      importEntity.data.manufacturer = {
        id: updateImportDto.manufacturerId,
      } as any;
    }
    if (updateImportDto.accountId !== undefined) {
      importEntity.data.account = { id: updateImportDto.accountId } as any;
    }

    // Handle import items update: remove old, add new
    if (updateImportDto.importItems !== undefined) {
      // Validate products exist
      for (const item of updateImportDto.importItems) {
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
      if (importEntity.data.importItems?.length > 0) {
        await this.importItemRepository.remove(importEntity.data.importItems);
      }

      // Set new items
      importEntity.data.importItems = updateImportDto.importItems.map((item) =>
        this.importItemRepository.create({
          product: { id: item.productId } as any,
          enteredStock: item.enteredStock,
          unitPrice: item.unitPrice,
        }),
      );
    }

    const updatedImport = await this.importRepository.save(importEntity.data);
    return successResponse(updatedImport, 'Import mis à jour avec succès');
  }

  async confirm(id: number): Promise<SuccessResponse<Import>> {
    const importEntity = await this.findOne(id);

    if (importEntity.data.confirmed) {
      throw new ConflictException('Cet import est déjà confirmé');
    }

    if (
      !importEntity.data.importItems ||
      importEntity.data.importItems.length === 0
    ) {
      throw new BadRequestException(
        'Impossible de confirmer un import sans articles',
      );
    }

    // Update product stock and average price for each item
    for (const item of importEntity.data.importItems) {
      const product = await this.productRepository.findOne({
        where: { id: item.product.id },
      });

      if (!product) {
        throw new NotFoundException(
          `Produit avec l'ID ${item.product.id} introuvable lors de la confirmation`,
        );
      }

      // Calculate new average price
      const oldStock = Number(product.stock);
      const oldAvgPrice = Number(product.averagePrice);
      const enteredStock = Number(item.enteredStock);
      const unitPrice = Number(item.unitPrice);

      const newStock = oldStock + enteredStock;
      const newAvgPrice =
        newStock > 0
          ? (oldStock * oldAvgPrice + enteredStock * unitPrice) / newStock
          : unitPrice;

      product.stock = newStock;
      product.averagePrice = Math.round(newAvgPrice * 100) / 100; // Round to 2 decimals

      const supplier = importEntity.data.supplier;
      if (supplier) {
        const alreadyAssociated = product.suppliers?.some(
          (s) => s.id === supplier.id,
        );
        if (!alreadyAssociated) {
          if (!product.suppliers) {
            product.suppliers = [];
          }
          product.suppliers.push(supplier);
        }
      }

      await this.productRepository.save(product);
    }

    // Mark import as confirmed
    importEntity.data.confirmed = true;
    const confirmedImport = await this.importRepository.save(importEntity.data);

    return successResponse(confirmedImport, 'Import confirmé avec succès');
  }

  async remove(id: number): Promise<SuccessResponse<null>> {
    const importEntity = await this.findOne(id);

    if (importEntity.data.confirmed) {
      throw new ConflictException(
        'Impossible de supprimer un import déjà confirmé',
      );
    }

    await this.importRepository.remove(importEntity.data);
    return successResponse(null, 'Import supprimé avec succès');
  }
}
