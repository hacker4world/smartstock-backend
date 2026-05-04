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
import { ManufacturerService } from './manufacturer.service';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';
import { ListManufacturerDto } from './dto/list-manufacturer.dto';
import { SuccessResponse } from '../common/utils/success-response';
import { Manufacturer } from './entities/manufacturer.entity';

@Controller('manufacturers')
export class ManufacturerController {
  constructor(private readonly manufacturerService: ManufacturerService) {}

  @Post()
  create(
    @Body() createManufacturerDto: CreateManufacturerDto,
  ): Promise<SuccessResponse<Manufacturer>> {
    return this.manufacturerService.create(createManufacturerDto);
  }

  @Get()
  findAll(): Promise<SuccessResponse<Manufacturer[]>> {
    return this.manufacturerService.findAll();
  }

  @Post('list')
  findFiltered(
    @Body() listManufacturerDto: ListManufacturerDto,
  ): Promise<
    SuccessResponse<{
      items: Manufacturer[];
      total: number;
      page: number;
      pageSize: number;
    }>
  > {
    return this.manufacturerService.findFiltered(listManufacturerDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<Manufacturer>> {
    return this.manufacturerService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateManufacturerDto: UpdateManufacturerDto,
  ): Promise<SuccessResponse<Manufacturer>> {
    return this.manufacturerService.update(id, updateManufacturerDto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    return this.manufacturerService.remove(id);
  }
}
