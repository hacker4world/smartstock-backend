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
import { ExportService } from './export.service';
import { CreateExportDto } from './dto/create-export.dto';
import { UpdateExportDto } from './dto/update-export.dto';
import { ListExportDto } from './dto/list-export.dto';
import { SuccessResponse } from '../common/utils/success-response';
import { Export } from './entities/export.entity';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';
import { PermissionName } from 'src/roles-module/permission.enum';

@Controller('exports')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.CREATE_EXPORT)
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
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.VIEW_EXPORT)
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
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.CONFIRM_EXPORT)
  confirm(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<Export>> {
    return this.exportService.confirm(id);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.DENY_EXPORT)
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    return this.exportService.remove(id);
  }

  @Get('/document/:id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.VIEW_EXPORT)
  generateDocument(@Param('id', ParseIntPipe) id: number) {
    return this.exportService.generateDocument(id);
  }
}