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
    return successResponse(savedFamily, 'Famille créée avec succès');
  }

  async findAll(): Promise<SuccessResponse<Family[]>> {
    const families = await this.familyRepository.find({
      relations: ['subfamilies'],
    });
    return successResponse(families, 'Familles récupérées avec succès');
  }

  async findOne(id: number): Promise<SuccessResponse<Family>> {
    const family = await this.familyRepository.findOne({
      where: { id },
      relations: ['subfamilies'],
    });
    if (!family) {
      throw new NotFoundException(`Famille avec l'ID ${id} introuvable`);
    }
    return successResponse(family, 'Famille récupérée avec succès');
  }

  async update(
    id: number,
    updateFamilyDto: UpdateFamilyDto,
  ): Promise<SuccessResponse<Family>> {
    const family = await this.findOne(id);
    Object.assign(family.data, updateFamilyDto);
    const updatedFamily = await this.familyRepository.save(family.data);
    return successResponse(updatedFamily, 'Famille mise à jour avec succès');
  }

  async remove(id: number): Promise<SuccessResponse<null>> {
    const family = await this.findOne(id);
    await this.familyRepository.remove(family.data);
    return successResponse(null, 'Famille supprimée avec succès');
  }
}
