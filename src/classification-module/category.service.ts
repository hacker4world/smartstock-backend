import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, ILike } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ListCategoryDto } from './dto/list-category.dto';
import { Subfamily } from './entities/subfamily.entity';
import {
  SuccessResponse,
  successResponse,
} from '../common/utils/success-response';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Subfamily)
    private readonly subfamilyRepository: Repository<Subfamily>,
    private readonly configService: ConfigService,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<SuccessResponse<Category>> {
    const subfamily = await this.subfamilyRepository.findOne({
      where: { id: createCategoryDto.subfamilyId },
    });
    if (!subfamily) {
      throw new NotFoundException(
        `Sous-famille avec l'ID ${createCategoryDto.subfamilyId} introuvable`,
      );
    }

    const category = this.categoryRepository.create({
      name: createCategoryDto.name,
      subfamily,
    });
    const savedCategory = await this.categoryRepository.save(category);
    return successResponse(savedCategory, 'Catégorie créée avec succès');
  }

  async findAll(): Promise<SuccessResponse<Category[]>> {
    const categories = await this.categoryRepository.find({
      relations: ['subfamily'],
    });
    return successResponse(categories, 'Catégories récupérées avec succès');
  }

  async findFiltered(listCategoryDto: ListCategoryDto): Promise<
    SuccessResponse<{
      items: Category[];
      total: number;
      page: number;
      pageSize: number;
      lastPage: boolean;
    }>
  > {
    const maxPageSize = this.configService.get<number>('PAGE_SIZE', 20);
    const page = listCategoryDto.page ?? 1;
    let pageSize = listCategoryDto.pageSize ?? maxPageSize;

    if (pageSize > maxPageSize) {
      pageSize = maxPageSize;
    }

    const where: any = {};

    if (listCategoryDto.filters) {
      if (listCategoryDto.filters.name) {
        where.name = ILike(`%${listCategoryDto.filters.name}%`);
      }
      if (listCategoryDto.filters.subfamilyId) {
        where.subfamily = { id: listCategoryDto.filters.subfamilyId };
      }
    }

    const [items, total] = await this.categoryRepository.findAndCount({
      where,
      relations: ['subfamily'],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const lastPage = page * pageSize >= total;

    return successResponse(
      { items, total, page, pageSize, lastPage },
      'Catégories récupérées avec succès',
    );
  }

  async findOne(id: number): Promise<SuccessResponse<Category>> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['subfamily'],
    });
    if (!category) {
      throw new NotFoundException(`Catégorie avec l'ID ${id} introuvable`);
    }
    return successResponse(category, 'Catégorie récupérée avec succès');
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<SuccessResponse<Category>> {
    const category = await this.findOne(id);

    if (updateCategoryDto.subfamilyId) {
      const subfamily = await this.subfamilyRepository.findOne({
        where: { id: updateCategoryDto.subfamilyId },
      });
      if (!subfamily) {
        throw new NotFoundException(
          `Sous-famille avec l'ID ${updateCategoryDto.subfamilyId} introuvable`,
        );
      }
      category.data.subfamily = subfamily;
    }

    Object.assign(category.data, { name: updateCategoryDto.name });
    const updatedCategory = await this.categoryRepository.save(category.data);
    return successResponse(
      updatedCategory,
      'Catégorie mise à jour avec succès',
    );
  }

  async remove(id: number): Promise<SuccessResponse<null>> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category.data);
    return successResponse(null, 'Catégorie supprimée avec succès');
  }
}
