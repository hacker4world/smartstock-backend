import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductReturnService } from './return.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { ListReturnDto } from './dto/list-return.dto';
import { ConfirmReturnDto } from './dto/confirm-return.dto';
import { SuccessResponse } from '../common/utils/success-response';
import { Return } from './entities/return.entity';

@Controller('product-return')
export class ReturnController {
  constructor(private readonly productReturnService: ProductReturnService) {}

  @Post()
  async create(
    @Body() createDto: CreateReturnDto,
  ): Promise<SuccessResponse<Return>> {
    return this.productReturnService.create(createDto);
  }

  @Post('list')
  async findFiltered(@Body() listDto: ListReturnDto): Promise<
    SuccessResponse<{
      items: Return[];
      total: number;
      page: number;
      pageSize: number;
      lastPage: boolean;
    }>
  > {
    return this.productReturnService.findFiltered(listDto);
  }

  @Patch(':id/confirm')
  async confirm(
    @Param('id', ParseIntPipe) id: number,
    @Body() confirmDto: ConfirmReturnDto,
  ): Promise<SuccessResponse<Return>> {
    return this.productReturnService.confirm(id, confirmDto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    return this.productReturnService.remove(id);
  }
}
