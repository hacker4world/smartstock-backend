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

@Controller('product-request')
export class ProductRequestController {
  constructor(private readonly productRequestService: RequestService) {}

  @Post()
  async create(
    @Body() createDto: CreateProductRequestDto,
  ): Promise<SuccessResponse<ProductRequest>> {
    return this.productRequestService.create(createDto);
  }

  @Get()
  async findFiltered(@Query() listDto: ListProductRequestDto): Promise<
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

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    return this.productRequestService.remove(id);
  }
}
