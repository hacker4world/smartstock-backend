import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, ILike } from 'typeorm';
import { Subfamily } from './entities/subfamily.entity';
import { CreateSubfamilyDto } from './dto/create-subfamily.dto';
import { UpdateSubfamilyDto } from './dto/update-subfamily.dto';
import { ListSubfamilyDto } from './dto/list-subfamily.dto';
import { Family } from './entities/family.entity';
import {
  SuccessResponse,
  successResponse,
} from '../common/utils/success-response';

@Injectable()
export class SubfamilyService {
  constructor(
    @InjectRepository(Subfamily)
    private readonly subfamilyRepository: Repository<Subfamily>,
    @InjectRepository(Family)
    private readonly familyRepository: Repository<Family>,
    private readonly configService: ConfigService,
  ) {}

  async create(
    createSubfamilyDto: CreateSubfamilyDto,
  ): Promise<SuccessResponse<Subfamily>> {
    const family = await this.familyRepository.findOne({
      where: { id: createSubfamilyDto.familyId },
    });
    if (!family) {
      throw new NotFoundException(
        `Famille avec l'ID ${createSubfamilyDto.familyId} introuvable`,
      );
    }

    const subfamily = this.subfamilyRepository.create({
      name: createSubfamilyDto.name,
      family,
    });
    const savedSubfamily = await this.subfamilyRepository.save(subfamily);
    return successResponse(savedSubfamily, 'Sous-famille créée avec succès');
  }

  async findAll(): Promise<SuccessResponse<Subfamily[]>> {
    const subfamilies = await this.subfamilyRepository.find({
      relations: ['family', 'categories'],
    });
    return successResponse(subfamilies, 'Sous-familles récupérées avec succès');
  }

  async findFiltered(listSubfamilyDto: ListSubfamilyDto): Promise<
    SuccessResponse<{
      items: Subfamily[];
      total: number;
      page: number;
      pageSize: number;
      lastPage: boolean;
    }>
  > {
    const maxPageSize = this.configService.get<number>('PAGE_SIZE', 20);
    const page = listSubfamilyDto.page ?? 1;
    let pageSize = listSubfamilyDto.pageSize ?? maxPageSize;

    if (pageSize > maxPageSize) {
      pageSize = maxPageSize;
    }

    const where: any = {};

    if (listSubfamilyDto.filters) {
      if (listSubfamilyDto.filters.name) {
        where.name = ILike(`%${listSubfamilyDto.filters.name}%`);
      }
      if (listSubfamilyDto.filters.familyId) {
        where.family = { id: listSubfamilyDto.filters.familyId };
      }
    }

    const [items, total] = await this.subfamilyRepository.findAndCount({
      where,
      relations: ['family', 'categories'],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const lastPage = page * pageSize >= total;

    return successResponse(
      { items, total, page, pageSize, lastPage },
      'Sous-familles récupérées avec succès',
    );
  }

  async findOne(id: number): Promise<SuccessResponse<Subfamily>> {
    const subfamily = await this.subfamilyRepository.findOne({
      where: { id },
      relations: ['family', 'categories'],
    });
    if (!subfamily) {
      throw new NotFoundException(`Sous-famille avec l'ID ${id} introuvable`);
    }
    return successResponse(subfamily, 'Sous-famille récupérée avec succès');
  }

  async update(
    id: number,
    updateSubfamilyDto: UpdateSubfamilyDto,
  ): Promise<SuccessResponse<Subfamily>> {
    const subfamily = await this.findOne(id);

    if (updateSubfamilyDto.familyId) {
      const family = await this.familyRepository.findOne({
        where: { id: updateSubfamilyDto.familyId },
      });
      if (!family) {
        throw new NotFoundException(
          `Famille avec l'ID ${updateSubfamilyDto.familyId} introuvable`,
        );
      }
      subfamily.data.family = family;
    }

    Object.assign(subfamily.data, { name: updateSubfamilyDto.name });
    const updatedSubfamily = await this.subfamilyRepository.save(
      subfamily.data,
    );
    return successResponse(
      updatedSubfamily,
      'Sous-famille mise à jour avec succès',
    );
  }

  async remove(id: number): Promise<SuccessResponse<null>> {
    const subfamily = await this.findOne(id);
    await this.subfamilyRepository.remove(subfamily.data);
    return successResponse(null, 'Sous-famille supprimée avec succès');
  }
}
