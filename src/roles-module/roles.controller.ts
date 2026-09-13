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
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { SuccessResponse } from '../common/utils/success-response';
import { Role } from './entities/Role.entity';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';
import { PermissionName } from './permission.enum';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.CREATE_ROLE)
  create(@Body() createRoleDto: CreateRoleDto): Promise<SuccessResponse<Role>> {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  findAll(): Promise<SuccessResponse<Role[]>> {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.VIEW_ROLE)
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<Role>> {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.UPDATE_ROLE)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<SuccessResponse<Role>> {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.DELETE_ROLE)
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    return this.rolesService.remove(id);
  }
}
