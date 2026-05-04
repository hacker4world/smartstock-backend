import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subfamily } from './entities/subfamily.entity';
import { CreateSubfamilyDto } from './dto/create-subfamily.dto';
import { UpdateSubfamilyDto } from './dto/update-subfamily.dto';
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
  ) {}

  async create(
    createSubfamilyDto: CreateSubfamilyDto,
  ): Promise<SuccessResponse<Subfamily>> {
    const family = await this.familyRepository.findOne({
      where: { id: createSubfamilyDto.familyId },
    });
    if (!family) {
      throw new NotFoundException(
        `Family with ID ${createSubfamilyDto.familyId} not found`,
      );
    }

    const subfamily = this.subfamilyRepository.create({
      name: createSubfamilyDto.name,
      family,
    });
    const savedSubfamily = await this.subfamilyRepository.save(subfamily);
    return successResponse(savedSubfamily, 'Subfamily created successfully');
  }

  async findAll(): Promise<SuccessResponse<Subfamily[]>> {
    const subfamilies = await this.subfamilyRepository.find({
      relations: ['family', 'categories'],
    });
    return successResponse(subfamilies, 'Subfamilies fetched successfully');
  }

  async findOne(id: number): Promise<SuccessResponse<Subfamily>> {
    const subfamily = await this.subfamilyRepository.findOne({
      where: { id },
      relations: ['family', 'categories'],
    });
    if (!subfamily) {
      throw new NotFoundException(`Subfamily with ID ${id} not found`);
    }
    return successResponse(subfamily, 'Subfamily fetched successfully');
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
          `Family with ID ${updateSubfamilyDto.familyId} not found`,
        );
      }
      subfamily.data.family = family;
    }

    Object.assign(subfamily, { name: updateSubfamilyDto.name });
    const updatedSubfamily = await this.subfamilyRepository.save(subfamily.data);
    return successResponse(updatedSubfamily, 'Subfamily updated successfully');
  }

  async remove(id: number): Promise<SuccessResponse<null>> {
    const subfamily = await this.findOne(id);
    await this.subfamilyRepository.remove(subfamily.data);
    return successResponse(null, 'Subfamily deleted successfully');
  }
}
