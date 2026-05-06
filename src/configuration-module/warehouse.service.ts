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
    return successResponse(savedWarehouse, 'Entrepôt créé avec succès');
  }

  async findAll(): Promise<SuccessResponse<Warehouse[]>> {
    const warehouses = await this.warehouseRepository.find();
    return successResponse(warehouses, 'Entrepôts récupérés avec succès');
  }

  async findOne(id: number): Promise<SuccessResponse<Warehouse>> {
    const warehouse = await this.warehouseRepository.findOne({ where: { id } });
    if (!warehouse) {
      throw new NotFoundException(`Entrepôt avec l'ID ${id} introuvable`);
    }
    return successResponse(warehouse, 'Entrepôt récupéré avec succès');
  }

  async update(
    id: number,
    updateWarehouseDto: UpdateWarehouseDto,
  ): Promise<SuccessResponse<Warehouse>> {
    const warehouse = await this.findOne(id);
    Object.assign(warehouse.data, updateWarehouseDto);
    const updatedWarehouse = await this.warehouseRepository.save(
      warehouse.data,
    );
    return successResponse(updatedWarehouse, 'Entrepôt mis à jour avec succès');
  }

  async remove(id: number): Promise<SuccessResponse<null>> {
    const warehouse = await this.findOne(id);
    await this.warehouseRepository.remove(warehouse.data);
    return successResponse(null, 'Entrepôt supprimé avec succès');
  }
}
