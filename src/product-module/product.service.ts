import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, ILike, LessThanOrEqual } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductDto } from './dto/list-product.dto';
import {
  SuccessResponse,
  successResponse,
} from '../common/utils/success-response';
import { Unit } from 'src/configuration-module/entities/unit.entity';
import { Warehouse } from 'src/configuration-module/entities/warehouse.entity';
import { Category } from 'src/classification-module/entities/category.entity';

const RELATIONS = ['unit', 'warehouse', 'category', 'suppliers'];

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly configService: ConfigService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
  ): Promise<SuccessResponse<Product>> {
    const product = this.productRepository.create({
      name: createProductDto.name,
      minimumStock: createProductDto.minimumStock,
      stock: 0,
      averagePrice: 0,
      unit: { id: createProductDto.unitId },
      warehouse: { id: createProductDto.warehouseId },
      category: { id: createProductDto.categoryId },
    });
    const savedProduct = await this.productRepository.save(product);

    // Reload with full relation objects for the frontend
    const createdProduct = await this.findOneEntity(savedProduct.id);
    return successResponse(createdProduct, 'Produit créé avec succès');
  }

  async findAll(): Promise<SuccessResponse<Product[]>> {
    const products = await this.productRepository.find({
      relations: RELATIONS,
    });
    return successResponse(products, 'Produits récupérés avec succès');
  }

  async findFiltered(listProductDto: ListProductDto): Promise<
    SuccessResponse<{
      items: Product[];
      total: number;
      page: number;
      pageSize: number;
      lastPage: boolean;
    }>
  > {
    const maxPageSize = this.configService.get<number>('PAGE_SIZE', 20);
    const page = listProductDto.page ?? 1;
    const pageSize = Math.min(
      listProductDto.pageSize ?? maxPageSize,
      maxPageSize,
    );

    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.unit', 'unit')
      .leftJoinAndSelect('product.warehouse', 'warehouse')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.suppliers', 'suppliers')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const filters = listProductDto.filters;
    if (filters) {
      if (filters.name) {
        query.andWhere('product.name ILIKE :name', {
          name: `%${filters.name}%`,
        });
      }
      if (filters.unitId) {
        query.andWhere('unit.id = :unitId', { unitId: filters.unitId });
      }
      if (filters.categoryId) {
        query.andWhere('category.id = :categoryId', {
          categoryId: filters.categoryId,
        });
      }
      if (filters.warehouseId) {
        query.andWhere('warehouse.id = :warehouseId', {
          warehouseId: filters.warehouseId,
        });
      }
      if (filters.minimumStock !== undefined) {
        query.andWhere('product.stock <= :minimumStock', {
          minimumStock: filters.minimumStock,
        });
      }
      if (filters.averagePrice !== undefined) {
        query.andWhere('product.averagePrice = :averagePrice', {
          averagePrice: filters.averagePrice,
        });
      }
      if (filters.stock !== undefined) {
        query.andWhere('product.stock = :stock', { stock: filters.stock });
      }
      if (filters.supplierId) {
        query.innerJoin(
          'product.suppliers',
          'filtered_supplier',
          'filtered_supplier.id = :supplierId',
          { supplierId: filters.supplierId },
        );
      }
    }

    const [items, total] = await query.getManyAndCount();
    const lastPage = page * pageSize >= total;

    return successResponse(
      { items, total, page, pageSize, lastPage },
      'Produits récupérés avec succès',
    );
  }

  async findOne(id: number): Promise<SuccessResponse<Product>> {
    const product = await this.findOneEntity(id);
    return successResponse(product, 'Produit récupéré avec succès');
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<SuccessResponse<Product>> {
    const product = await this.findOneEntity(id);

    if (updateProductDto.name !== undefined) {
      product.name = updateProductDto.name;
    }
    if (updateProductDto.minimumStock !== undefined) {
      product.minimumStock = updateProductDto.minimumStock;
    }
    if (updateProductDto.unitId !== undefined) {
      product.unit = { id: updateProductDto.unitId } as Unit;
    }
    if (updateProductDto.warehouseId !== undefined) {
      product.warehouse = { id: updateProductDto.warehouseId } as Warehouse;
    }
    if (updateProductDto.categoryId !== undefined) {
      product.category = { id: updateProductDto.categoryId } as Category;
    }

    await this.productRepository.save(product);

    // Reload with full relation objects for the frontend
    const updatedProduct = await this.findOneEntity(id);
    return successResponse(updatedProduct, 'Produit mis à jour avec succès');
  }

  async remove(id: number): Promise<SuccessResponse<null>> {
    const product = await this.findOneEntity(id);
    await this.productRepository.remove(product);
    return successResponse(null, 'Produit supprimé avec succès');
  }

  private async findOneEntity(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: RELATIONS,
    });
    if (!product) {
      throw new NotFoundException(`Produit avec l'ID ${id} introuvable`);
    }
    return product;
  }
}
