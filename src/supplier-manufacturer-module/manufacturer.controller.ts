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
import { ManufacturerService } from './manufacturer.service';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';
import { ListManufacturerDto } from './dto/list-manufacturer.dto';
import { SuccessResponse } from '../common/utils/success-response';
import { Manufacturer } from './entities/manufacturer.entity';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { PermissionName } from 'src/roles-module/permission.enum';

@Controller('manufacturers')
export class ManufacturerController {
  constructor(private readonly manufacturerService: ManufacturerService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.CREATE_MANUFACTURER)
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
  findFiltered(@Body() listManufacturerDto: ListManufacturerDto): Promise<
    SuccessResponse<{
      items: Manufacturer[];
      total: number;
      page: number;
      pageSize: number;
      lastPage: boolean;
    }>
  > {
    return this.manufacturerService.findFiltered(listManufacturerDto);
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.VIEW_MANUFACTURER)
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<Manufacturer>> {
    return this.manufacturerService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.UPDATE_MANUFACTURER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateManufacturerDto: UpdateManufacturerDto,
  ): Promise<SuccessResponse<Manufacturer>> {
    return this.manufacturerService.update(id, updateManufacturerDto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.DELETE_MANUFACTURER)
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    return this.manufacturerService.remove(id);
  }

  @Get(':id/stats')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.VIEW_MANUFACTURER)
  getStats(@Param('id', ParseIntPipe) id: number): Promise<
    SuccessResponse<{
      importCount: number;
    }>
  > {
    return this.manufacturerService.getStats(id);
  }
}
