import { Injectable, NotFoundException } from '@nestjs/common';
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
    const unit = this.unitRepository.create(createUnitDto);
    const savedUnit = await this.unitRepository.save(unit);
    return successResponse(savedUnit, 'Unit created successfully');
  }

  async findAll(): Promise<SuccessResponse<Unit[]>> {
    const units = await this.unitRepository.find();
    return successResponse(units, 'Units fetched successfully');
  }

  async findOne(id: number): Promise<SuccessResponse<Unit>> {
    const unit = await this.unitRepository.findOne({ where: { id } });
    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }
    return successResponse(unit, 'Unit fetched successfully');
  }

  async update(
    id: number,
    updateUnitDto: UpdateUnitDto,
  ): Promise<SuccessResponse<Unit>> {
    const unit = await this.findOne(id);
    Object.assign(unit, updateUnitDto);
    const updatedUnit = await this.unitRepository.save(unit.data);
    return successResponse(updatedUnit, 'Unit updated successfully');
  }

  async remove(id: number): Promise<SuccessResponse<null>> {
    const unit = await this.findOne(id);
    await this.unitRepository.remove(unit.data);
    return successResponse(null, 'Unit deleted successfully');
  }
}
