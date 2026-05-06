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
import { SubfamilyService } from './subfamily.service';
import * as createSubfamilyDto_1 from './dto/create-subfamily.dto';
import * as updateSubfamilyDto_1 from './dto/update-subfamily.dto';
import { ListSubfamilyDto } from './dto/list-subfamily.dto';
import { SuccessResponse } from '../common/utils/success-response';
import { Subfamily } from './entities/subfamily.entity';

@Controller('classification/subfamilies')
export class SubfamilyController {
  constructor(private readonly subfamilyService: SubfamilyService) {}

  @Post()
  create(
    @Body() createSubfamilyDto: createSubfamilyDto_1.CreateSubfamilyDto,
  ): Promise<SuccessResponse<Subfamily>> {
    return this.subfamilyService.create(createSubfamilyDto);
  }

  @Get()
  findAll(): Promise<SuccessResponse<Subfamily[]>> {
    return this.subfamilyService.findAll();
  }

  @Post('list')
  findFiltered(@Body() listSubfamilyDto: ListSubfamilyDto): Promise<
    SuccessResponse<{
      items: Subfamily[];
      total: number;
      page: number;
      pageSize: number;
      lastPage: boolean;
    }>
  > {
    return this.subfamilyService.findFiltered(listSubfamilyDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<Subfamily>> {
    return this.subfamilyService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubfamilyDto: updateSubfamilyDto_1.UpdateSubfamilyDto,
  ): Promise<SuccessResponse<Subfamily>> {
    return this.subfamilyService.update(id, updateSubfamilyDto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    return this.subfamilyService.remove(id);
  }
}
