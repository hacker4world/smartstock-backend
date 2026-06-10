// src/requests-module/product-request.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { RequestService } from './request.service';
import { CreateProductRequestDto } from './dto/create-product-request.dto';
import { ListProductRequestDto } from './dto/list-product-request.dto';
import { SuccessResponse } from '../common/utils/success-response';
import { ProductRequest } from './entities/request.entity';
import { Export } from 'src/import-export-module/entities/export.entity';
import { TurnProductRequestIntoExportDto } from './dto/turn-product-request-into-export.dto';

@Controller('product-request')
export class ProductRequestController {
  constructor(private readonly productRequestService: RequestService) {}

  @Post()
  async create(
    @Body() createDto: CreateProductRequestDto,
  ): Promise<SuccessResponse<ProductRequest>> {
    return this.productRequestService.create(createDto);
  }

  @Post('list')
  async list(@Body() listDto: ListProductRequestDto): Promise<
    SuccessResponse<{
      items: ProductRequest[];
      total: number;
      page: number;
      pageSize: number;
      lastPage: boolean;
    }>
  > {
    return this.productRequestService.findFiltered(listDto);
  }

  @Patch(':id/confirm')
  async confirm(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<ProductRequest>> {
    return this.productRequestService.confirm(id);
  }

  @Post(':id/turn-into-export')
  async turnIntoExport(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TurnProductRequestIntoExportDto,
  ): Promise<SuccessResponse<Export>> {
    return this.productRequestService.turnIntoExport(id, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    return this.productRequestService.remove(id);
  }
}
