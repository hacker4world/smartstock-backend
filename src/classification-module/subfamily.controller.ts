import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { SubfamilyService } from './subfamily.service';
import * as createSubfamilyDto_1 from './dto/create-subfamily.dto';
import * as updateSubfamilyDto_1 from './dto/update-subfamily.dto';
import { ListSubfamilyDto } from './dto/list-subfamily.dto';
import { SuccessResponse } from '../common/utils/success-response';
import { Subfamily } from './entities/subfamily.entity';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';
import { PermissionName } from 'src/roles-module/permission.enum';

@Controller('classification/subfamilies')
export class SubfamilyController {
  constructor(private readonly subfamilyService: SubfamilyService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.CREATE_SUBFAMILY)
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
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.VIEW_SUBFAMILY)
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<Subfamily>> {
    return this.subfamilyService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.UPDATE_SUBFAMILY)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubfamilyDto: updateSubfamilyDto_1.UpdateSubfamilyDto,
  ): Promise<SuccessResponse<Subfamily>> {
    return this.subfamilyService.update(id, updateSubfamilyDto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.DELETE_SUBFAMILY)
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    return this.subfamilyService.remove(id);
  }
}
