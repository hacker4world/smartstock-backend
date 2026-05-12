// src/import-export-module/import.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImportService } from './import.service';
import { CreateImportDto } from './dto/create-import.dto';
import { UpdateImportDto } from './dto/update-import.dto';
import { ListImportDto } from './dto/list-import.dto';
import { SuccessResponse } from '../common/utils/success-response';
import { Import } from './entities/import.entity';
import { multerOptions } from '../common/multer/multer.config';

@Controller('imports')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 2, multerOptions))
  create(
    @Body() createImportDto: CreateImportDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<SuccessResponse<Import>> {
    const bonDeCommande = files?.[0]?.filename;
    const bonDeLivraison = files?.[1]?.filename;
    return this.importService.create(
      createImportDto,
      bonDeCommande,
      bonDeLivraison,
    );
  }

  @Get()
  findAll(): Promise<SuccessResponse<Import[]>> {
    return this.importService.findAll();
  }

  @Post('list')
  findFiltered(@Body() listImportDto: ListImportDto): Promise<
    SuccessResponse<{
      items: Import[];
      total: number;
      page: number;
      pageSize: number;
      lastPage: boolean;
    }>
  > {
    return this.importService.findFiltered(listImportDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<Import>> {
    return this.importService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files', 2, multerOptions))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateImportDto: UpdateImportDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<SuccessResponse<Import>> {
    const bonDeCommande = files?.[0]?.filename;
    const bonDeLivraison = files?.[1]?.filename;
    return this.importService.update(
      id,
      updateImportDto,
      bonDeCommande,
      bonDeLivraison,
    );
  }

  @Patch(':id/confirm')
  confirm(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<Import>> {
    return this.importService.confirm(id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    return this.importService.remove(id);
  }
}
