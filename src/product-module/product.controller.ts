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
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductDto } from './dto/list-product.dto';
import { SuccessResponse } from '../common/utils/success-response';
import { Product } from './entities/product.entity';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<SuccessResponse<Product>> {
    return this.productService.create(createProductDto);
  }

  @Get()
  findAll(): Promise<SuccessResponse<Product[]>> {
    return this.productService.findAll();
  }

  @Post('list')
  findFiltered(@Body() listProductDto: ListProductDto): Promise<
    SuccessResponse<{
      items: Product[];
      total: number;
      page: number;
      pageSize: number;
    }>
  > {
    return this.productService.findFiltered(listProductDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<Product>> {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<SuccessResponse<Product>> {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    return this.productService.remove(id);
  }
}
