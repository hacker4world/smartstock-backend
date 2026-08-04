import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, ILike } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { ListSupplierDto } from './dto/list-supplier.dto';
import {
  SuccessResponse,
  successResponse,
} from '../common/utils/success-response';
import { Product } from 'src/product-module/entities/product.entity';
import { Import } from 'src/import-export-module/entities/import.entity';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    private readonly configService: ConfigService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Import)
    private readonly importRepository: Repository<Import>,
  ) {}

  async create(
    createSupplierDto: CreateSupplierDto,
  ): Promise<SuccessResponse<Supplier>> {
    const supplier = this.supplierRepository.create(createSupplierDto);
    const savedSupplier = await this.supplierRepository.save(supplier);
    return successResponse(savedSupplier, 'Fournisseur créé avec succès');
  }

  async findAll(): Promise<SuccessResponse<Supplier[]>> {
    const suppliers = await this.supplierRepository.find();
    return successResponse(suppliers, 'Fournisseurs récupérés avec succès');
  }

  async findFiltered(listSupplierDto: ListSupplierDto): Promise<
    SuccessResponse<{
      items: Supplier[];
      total: number;
      page: number;
      pageSize: number;
      lastPage: boolean;
    }>
  > {
    const maxPageSize = this.configService.get<number>('PAGE_SIZE', 20);
    const page = listSupplierDto.page ?? 1;
    let pageSize = listSupplierDto.pageSize ?? maxPageSize;

    if (pageSize > maxPageSize) {
      pageSize = maxPageSize;
    }

    const where: any[] = [{}];

    if (listSupplierDto.filters) {
      const filterConditions: any = {};
      if (listSupplierDto.filters.name) {
        filterConditions.name = ILike(`%${listSupplierDto.filters.name}%`);
      }
      if (listSupplierDto.filters.contact) {
        filterConditions.contact = ILike(
          `%${listSupplierDto.filters.contact}%`,
        );
      }
      where[0] = filterConditions;
    }

    const [items, total] = await this.supplierRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const lastPage = page * pageSize >= total; // <-- NEW

    return successResponse(
      { items, total, page, pageSize, lastPage }, // <-- CHANGED: added lastPage
      'Fournisseurs récupérés avec succès',
    );
  }

  async findOne(id: number): Promise<SuccessResponse<Supplier>> {
    const supplier = await this.supplierRepository.findOne({ where: { id } });
    if (!supplier) {
      throw new NotFoundException(`Fournisseur avec l'ID ${id} introuvable`);
    }
    return successResponse(supplier, 'Fournisseur récupéré avec succès');
  }

  async update(
    id: number,
    updateSupplierDto: UpdateSupplierDto,
  ): Promise<SuccessResponse<Supplier>> {
    const supplier = await this.findOne(id);
    Object.assign(supplier.data, updateSupplierDto);
    const updatedSupplier = await this.supplierRepository.save(supplier.data);
    return successResponse(
      updatedSupplier,
      'Fournisseur mis à jour avec succès',
    );
  }

  async remove(id: number): Promise<SuccessResponse<null>> {
    const supplier = await this.findOne(id);
    await this.supplierRepository.remove(supplier.data);
    return successResponse(null, 'Fournisseur supprimé avec succès');
  }

  async getStats(id: number): Promise<
    SuccessResponse<{
      productCount: number;
      importCount: number;
    }>
  > {
    // Verify supplier exists
    await this.findOne(id);

    const productCount = await this.productRepository
      .createQueryBuilder('product')
      .innerJoin('product.suppliers', 'supplier', 'supplier.id = :supplierId', {
        supplierId: id,
      })
      .getCount();

    const importCount = await this.importRepository.count({
      where: { supplier: { id } },
    });

    return successResponse(
      { productCount, importCount },
      'Statistiques récupérées avec succès',
    );
  }
}
