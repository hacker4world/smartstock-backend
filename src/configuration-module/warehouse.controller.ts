import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import * as createWarehouseDto_1 from './dto/create-warehouse.dto';
import * as updateWarehouseDto_1 from './dto/update-warehouse.dto';
import { SuccessResponse } from '../common/utils/success-response';
import { Warehouse } from './entities/warehouse.entity';

@Controller('configuration/warehouses')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  create(
    @Body() createWarehouseDto: createWarehouseDto_1.CreateWarehouseDto,
  ): Promise<SuccessResponse<Warehouse>> {
    return this.warehouseService.create(createWarehouseDto);
  }

  @Get()
  findAll(): Promise<SuccessResponse<Warehouse[]>> {
    return this.warehouseService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<Warehouse>> {
    return this.warehouseService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWarehouseDto: updateWarehouseDto_1.UpdateWarehouseDto,
  ): Promise<SuccessResponse<Warehouse>> {
    return this.warehouseService.update(id, updateWarehouseDto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    return this.warehouseService.remove(id);
  }
}
