import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './entities/warehouse.entity';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import {
  SuccessResponse,
  successResponse,
} from '../common/utils/success-response';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) {}

  async create(
    createWarehouseDto: CreateWarehouseDto,
  ): Promise<SuccessResponse<Warehouse>> {
    const warehouse = this.warehouseRepository.create(createWarehouseDto);
    const savedWarehouse = await this.warehouseRepository.save(warehouse);
    return successResponse(savedWarehouse, 'Warehouse created successfully');
  }

  async findAll(): Promise<SuccessResponse<Warehouse[]>> {
    const warehouses = await this.warehouseRepository.find();
    return successResponse(warehouses, 'Warehouses fetched successfully');
  }

  async findOne(id: number): Promise<SuccessResponse<Warehouse>> {
    const warehouse = await this.warehouseRepository.findOne({ where: { id } });
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }
    return successResponse(warehouse, 'Warehouse fetched successfully');
  }

  async update(
    id: number,
    updateWarehouseDto: UpdateWarehouseDto,
  ): Promise<SuccessResponse<Warehouse>> {
    const warehouse = await this.findOne(id);
    Object.assign(warehouse, updateWarehouseDto);
    const updatedWarehouse = await this.warehouseRepository.save(warehouse.data);
    return successResponse(updatedWarehouse, 'Warehouse updated successfully');
  }

  async remove(id: number): Promise<SuccessResponse<null>> {
    const warehouse = await this.findOne(id);
    await this.warehouseRepository.remove(warehouse.data);
    return successResponse(null, 'Warehouse deleted successfully');
  }
}
