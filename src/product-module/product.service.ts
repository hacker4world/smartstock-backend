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
    return successResponse(savedProduct, 'Produit créé avec succès');
  }

  async findAll(): Promise<SuccessResponse<Product[]>> {
    const products = await this.productRepository.find({
      relations: ['unit', 'warehouse', 'category', 'suppliers'],
    });
    return successResponse(products, 'Produits récupérés avec succès');
  }

  async findFiltered(listProductDto: ListProductDto): Promise<
    SuccessResponse<{
      items: Product[];
      total: number;
      page: number;
      pageSize: number;
    }>
  > {
    const maxPageSize = this.configService.get<number>('PAGE_SIZE', 20);
    const page = listProductDto.page ?? 1;
    let pageSize = listProductDto.pageSize ?? maxPageSize;

    if (pageSize > maxPageSize) {
      pageSize = maxPageSize;
    }

    const where: any = {};

    if (listProductDto.filters) {
      if (listProductDto.filters.name) {
        where.name = ILike(`%${listProductDto.filters.name}%`);
      }

      if (listProductDto.filters.unitId) {
        where.unit = { id: listProductDto.filters.unitId };
      }

      if (listProductDto.filters.categoryId) {
        where.category = { id: listProductDto.filters.categoryId };
      }

      if (listProductDto.filters.warehouseId) {
        where.warehouse = { id: listProductDto.filters.warehouseId };
      }

      if (listProductDto.filters.minimumStock !== undefined) {
        where.stock = LessThanOrEqual(listProductDto.filters.minimumStock);
      }

      if (listProductDto.filters.averagePrice !== undefined) {
        where.averagePrice = listProductDto.filters.averagePrice;
      }

      if (listProductDto.filters.stock !== undefined) {
        where.stock = listProductDto.filters.stock;
      }
    }

    const [items, total] = await this.productRepository.findAndCount({
      where,
      relations: ['unit', 'warehouse', 'category', 'suppliers'],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return successResponse(
      { items, total, page, pageSize },
      'Produits récupérés avec succès',
    );
  }

  async findOne(id: number): Promise<SuccessResponse<Product>> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['unit', 'warehouse', 'category', 'suppliers'],
    });
    if (!product) {
      throw new NotFoundException(`Produit avec l'ID ${id} introuvable`);
    }
    return successResponse(product, 'Produit récupéré avec succès');
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<SuccessResponse<Product>> {
    const product = await this.findOne(id);

    // Update direct properties (name, minimumStock)
    if (updateProductDto.name !== undefined) {
      product.data.name = updateProductDto.name;
    }
    if (updateProductDto.minimumStock !== undefined) {
      product.data.minimumStock = updateProductDto.minimumStock;
    }

    // Update relations using the same pattern as create()
    if (updateProductDto.unitId !== undefined) {
      product.data.unit = { id: updateProductDto.unitId } as any;
    }
    if (updateProductDto.warehouseId !== undefined) {
      product.data.warehouse = { id: updateProductDto.warehouseId } as any;
    }
    if (updateProductDto.categoryId !== undefined) {
      product.data.category = { id: updateProductDto.categoryId } as any;
    }

    await this.productRepository.save(product.data);

    // Reload with full relation objects for the frontend
    const updatedProduct = (await this.productRepository.findOne({
      where: { id },
      relations: ['unit', 'warehouse', 'category', 'suppliers'],
    })) as Product;

    return successResponse(updatedProduct, 'Produit mis à jour avec succès');
  }

  async remove(id: number): Promise<SuccessResponse<null>> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product.data);
    return successResponse(null, 'Produit supprimé avec succès');
  }
}
