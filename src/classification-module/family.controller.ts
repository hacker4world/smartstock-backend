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
import { FamilyService } from './family.service';
import * as createFamilyDto_1 from './dto/create-family.dto';
import * as updateFamilyDto_1 from './dto/update-family.dto';
import { SuccessResponse } from '../common/utils/success-response';
import { Family } from './entities/family.entity';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';
import { PermissionName } from 'src/roles-module/permission.enum';

@Controller('classification/families')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.CREATE_FAMILY)
  create(
    @Body() createFamilyDto: createFamilyDto_1.CreateFamilyDto,
  ): Promise<SuccessResponse<Family>> {
    return this.familyService.create(createFamilyDto);
  }

  @Get()
  findAll(): Promise<SuccessResponse<Family[]>> {
    return this.familyService.findAll();
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.VIEW_FAMILY)
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<Family>> {
    return this.familyService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.UPDATE_FAMILY)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFamilyDto: updateFamilyDto_1.UpdateFamilyDto,
  ): Promise<SuccessResponse<Family>> {
    return this.familyService.update(id, updateFamilyDto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.DELETE_FAMILY)
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    return this.familyService.remove(id);
  }
}
