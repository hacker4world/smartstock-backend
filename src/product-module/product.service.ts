import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, ILike } from 'typeorm';
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
      ...createProductDto,
      stock: 0,
      averagePrice: 0,
    });
    const savedProduct = await this.productRepository.save(product);
    return successResponse(savedProduct, 'Produit créé avec succès');
  }

  async findAll(): Promise<SuccessResponse<Product[]>> {
    const products = await this.productRepository.find({
      relations: ['unit', 'warehouse', 'category'],
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

    const where: any[] = [{}];

    if (listProductDto.filters) {
      const filterConditions: any = {};
      if (listProductDto.filters.name) {
        filterConditions.name = ILike(`%${listProductDto.filters.name}%`);
      }
      where[0] = filterConditions;
    }

    const [items, total] = await this.productRepository.findAndCount({
      where,
      relations: ['unit', 'warehouse', 'category'],
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
      relations: ['unit', 'warehouse', 'category'],
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
    // Only allow updating name, minimumStock, and relationships —
    // stock and averagePrice are never updated through this endpoint
    Object.assign(product.data, updateProductDto);
    const updatedProduct = await this.productRepository.save(product.data);
    return successResponse(updatedProduct, 'Produit mis à jour avec succès');
  }

  async remove(id: number): Promise<SuccessResponse<null>> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product.data);
    return successResponse(null, 'Produit supprimé avec succès');
  }
}
