import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ConstructionSiteService } from './construction-site.service';
import { CreateConstructionSiteDto } from './dto/create-construction-site.dto';
import { UpdateConstructionSiteDto } from './dto/update-construction-site.dto';
import { ListConstructionSiteDto } from './dto/list-construction-site.dto';
import { SuccessResponse } from '../common/utils/success-response';
import { ConstructionSite } from './entities/construction-site.entity';
import { Export } from 'src/import-export-module/entities/export.entity';
import { Return } from 'src/request-return-module/entities/return.entity';
import { ProductRequest } from 'src/request-return-module/entities/request.entity';

@Controller('construction-sites')
export class ConstructionSiteController {
  constructor(
    private readonly constructionSiteService: ConstructionSiteService,
  ) {}

  @Post()
  create(
    @Body() createConstructionSiteDto: CreateConstructionSiteDto,
  ): Promise<SuccessResponse<ConstructionSite>> {
    return this.constructionSiteService.create(createConstructionSiteDto);
  }

  @Get()
  findAll(): Promise<SuccessResponse<ConstructionSite[]>> {
    return this.constructionSiteService.findAll();
  }

  @Post('list')
  findFiltered(
    @Body() listConstructionSiteDto: ListConstructionSiteDto,
  ): Promise<
    SuccessResponse<{
      items: ConstructionSite[];
      total: number;
      page: number;
      pageSize: number;
    }>
  > {
    return this.constructionSiteService.findFiltered(listConstructionSiteDto);
  }

  // NEW ENDPOINTS – placed before the :id route to avoid conflicts
  @Get(':id/exports')
  getExportsBySiteId(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<
    SuccessResponse<{
      items: Export[];
      total: number;
      page: number;
      pageSize: number;
    }>
  > {
    return this.constructionSiteService.getExportsBySiteId(
      id,
      page ? +page : 1,
      pageSize ? +pageSize : undefined,
    );
  }

  @Get(':id/returns')
  getReturnsBySiteId(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<
    SuccessResponse<{
      items: Return[];
      total: number;
      page: number;
      pageSize: number;
    }>
  > {
    return this.constructionSiteService.getReturnsBySiteId(
      id,
      page ? +page : 1,
      pageSize ? +pageSize : undefined,
    );
  }

  @Get(':id/requests')
  getRequestsBySiteId(  
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<
    SuccessResponse<{
      items: ProductRequest[];
      total: number;
      page: number;
      pageSize: number;
    }>
  > {
    return this.constructionSiteService.getRequestsBySiteId(
      id,
      page ? +page : 1,
      pageSize ? +pageSize : undefined,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<ConstructionSite>> {
    return this.constructionSiteService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateConstructionSiteDto: UpdateConstructionSiteDto,
  ): Promise<SuccessResponse<ConstructionSite>> {
    return this.constructionSiteService.update(id, updateConstructionSiteDto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    return this.constructionSiteService.remove(id);
  }
}
