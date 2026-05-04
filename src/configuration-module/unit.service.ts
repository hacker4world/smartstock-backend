import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './entities/unit.entity';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import {
  SuccessResponse,
  successResponse,
} from '../common/utils/success-response';

@Injectable()
export class UnitService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
  ) {}

  async create(createUnitDto: CreateUnitDto): Promise<SuccessResponse<Unit>> {
    // Check if a unit with the same name already exists
    const existingUnit = await this.unitRepository.findOne({
      where: { name: createUnitDto.name },
    });
    if (existingUnit) {
      throw new ConflictException(
        `Une unité avec le nom "${createUnitDto.name}" existe déjà`,
      );
    }

    const unit = this.unitRepository.create(createUnitDto);
    const savedUnit = await this.unitRepository.save(unit);
    return successResponse(savedUnit, 'Unité créée avec succès');
  }

  async findAll(): Promise<SuccessResponse<Unit[]>> {
    const units = await this.unitRepository.find();
    return successResponse(units, 'Unités récupérées avec succès');
  }

  async findOne(id: number): Promise<SuccessResponse<Unit>> {
    const unit = await this.unitRepository.findOne({ where: { id } });
    if (!unit) {
      throw new NotFoundException(`Unité avec l'ID ${id} introuvable`);
    }
    return successResponse(unit, 'Unité récupérée avec succès');
  }

  async update(
    id: number,
    updateUnitDto: UpdateUnitDto,
  ): Promise<SuccessResponse<Unit>> {
    const { data: unit } = await this.findOne(id);

    // If the name is being updated, check for duplicates
    if (updateUnitDto.name && updateUnitDto.name !== unit.name) {
      const existingUnit = await this.unitRepository.findOne({
        where: { name: updateUnitDto.name },
      });
      if (existingUnit) {
        throw new ConflictException(
          `Une unité avec le nom "${updateUnitDto.name}" existe déjà`,
        );
      }
    }

    Object.assign(unit, updateUnitDto);
    const updatedUnit = await this.unitRepository.save(unit);
    return successResponse(updatedUnit, 'Unité mise à jour avec succès');
  }

  async remove(id: number): Promise<SuccessResponse<null>> {
    const { data: unit } = await this.findOne(id);
    await this.unitRepository.remove(unit);
    return successResponse(null, 'Unité supprimée avec succès');
  }
}
