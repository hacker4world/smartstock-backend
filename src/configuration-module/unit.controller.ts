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
import { UnitService } from './unit.service';
import * as createUnitDto_1 from './dto/create-unit.dto';
import * as updateUnitDto_1 from './dto/update-unit.dto';
import { SuccessResponse } from '../common/utils/success-response';
import { Unit } from './entities/unit.entity';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';
import { PermissionName } from 'src/roles-module/permission.enum';

@Controller('configuration/units')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.CREATE_UNIT)
  create(
    @Body() createUnitDto: createUnitDto_1.CreateUnitDto,
  ): Promise<SuccessResponse<Unit>> {
    return this.unitService.create(createUnitDto);
  }

  @Get()
  findAll(): Promise<SuccessResponse<Unit[]>> {
    return this.unitService.findAll();
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.VIEW_UNIT)
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<Unit>> {
    return this.unitService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.UPDATE_UNIT)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUnitDto: updateUnitDto_1.UpdateUnitDto,
  ): Promise<SuccessResponse<Unit>> {
    return this.unitService.update(id, updateUnitDto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.DELETE_UNIT)
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    return this.unitService.remove(id);
  }
}
