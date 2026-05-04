import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Family } from './entities/family.entity';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import {
  SuccessResponse,
  successResponse,
} from '../common/utils/success-response';

@Injectable()
export class FamilyService {
  constructor(
    @InjectRepository(Family)
    private readonly familyRepository: Repository<Family>,
  ) {}

  async create(
    createFamilyDto: CreateFamilyDto,
  ): Promise<SuccessResponse<Family>> {
    const family = this.familyRepository.create(createFamilyDto);
    const savedFamily = await this.familyRepository.save(family);
    return successResponse(savedFamily, 'Family created successfully');
  }

  async findAll(): Promise<SuccessResponse<Family[]>> {
    const families = await this.familyRepository.find({
      relations: ['subfamilies'],
    });
    return successResponse(families, 'Families fetched successfully');
  }

  async findOne(id: number): Promise<SuccessResponse<Family>> {
    const family = await this.familyRepository.findOne({
      where: { id },
      relations: ['subfamilies'],
    });
    if (!family) {
      throw new NotFoundException(`Family with ID ${id} not found`);
    }
    return successResponse(family, 'Family fetched successfully');
  }

  async update(
    id: number,
    updateFamilyDto: UpdateFamilyDto,
  ): Promise<SuccessResponse<Family>> {
    const family = await this.findOne(id);
    Object.assign(family, updateFamilyDto);
    const updatedFamily = await this.familyRepository.save(family.data);
    return successResponse(updatedFamily, 'Family updated successfully');
  }

  async remove(id: number): Promise<SuccessResponse<null>> {
    const family = await this.findOne(id);
    await this.familyRepository.remove(family.data);
    return successResponse(null, 'Family deleted successfully');
  }
}
