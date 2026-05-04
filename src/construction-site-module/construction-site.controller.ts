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
import { ConstructionSiteService } from './construction-site.service';
import { CreateConstructionSiteDto } from './dto/create-construction-site.dto';
import { UpdateConstructionSiteDto } from './dto/update-construction-site.dto';
import { ListConstructionSiteDto } from './dto/list-construction-site.dto';
import { SuccessResponse } from '../common/utils/success-response';
import { ConstructionSite } from './entities/construction-site.entity';

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
