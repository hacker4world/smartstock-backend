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
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { ListSupplierDto } from './dto/list-supplier.dto';
import { SuccessResponse } from '../common/utils/success-response';
import { Supplier } from './entities/supplier.entity';

@Controller('suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  create(
    @Body() createSupplierDto: CreateSupplierDto,
  ): Promise<SuccessResponse<Supplier>> {
    return this.supplierService.create(createSupplierDto);
  }

  @Get()
  findAll(): Promise<SuccessResponse<Supplier[]>> {
    return this.supplierService.findAll();
  }

  @Post('list')
  findFiltered(@Body() listSupplierDto: ListSupplierDto): Promise<
    SuccessResponse<{
      items: Supplier[];
      total: number;
      page: number;
      pageSize: number;
      lastPage: boolean;
    }>
  > {
    return this.supplierService.findFiltered(listSupplierDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<Supplier>> {
    return this.supplierService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ): Promise<SuccessResponse<Supplier>> {
    return this.supplierService.update(id, updateSupplierDto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    return this.supplierService.remove(id);
  }

  @Get(':id/stats')
  getStats(@Param('id', ParseIntPipe) id: number): Promise<
    SuccessResponse<{
      productCount: number;
      importCount: number;
    }>
  > {
    return this.supplierService.getStats(id);
  }
}
