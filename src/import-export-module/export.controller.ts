// src/import-export-module/export.controller.ts
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
import { ExportService } from './export.service';
import { CreateExportDto } from './dto/create-export.dto';
import { UpdateExportDto } from './dto/update-export.dto';
import { ListExportDto } from './dto/list-export.dto';
import { SuccessResponse } from '../common/utils/success-response';
import { Export } from './entities/export.entity';

@Controller('exports')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post()
  create(
    @Body() createExportDto: CreateExportDto,
  ): Promise<SuccessResponse<Export>> {
    return this.exportService.create(createExportDto);
  }

  @Get()
  findAll(): Promise<SuccessResponse<Export[]>> {
    return this.exportService.findAll();
  }

  @Post('list')
  findFiltered(@Body() listExportDto: ListExportDto): Promise<
    SuccessResponse<{
      items: Export[];
      total: number;
      page: number;
      pageSize: number;
      lastPage: boolean;
    }>
  > {
    return this.exportService.findFiltered(listExportDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<Export>> {
    return this.exportService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExportDto: UpdateExportDto,
  ): Promise<SuccessResponse<Export>> {
    return this.exportService.update(id, updateExportDto);
  }

  @Patch(':id/confirm')
  confirm(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<Export>> {
    return this.exportService.confirm(id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    return this.exportService.remove(id);
  }
}
