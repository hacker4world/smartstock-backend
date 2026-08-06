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
import { CategoryService } from './category.service';
import * as createCategoryDto_1 from './dto/create-category.dto';
import * as updateCategoryDto_1 from './dto/update-category.dto';
import { ListCategoryDto } from './dto/list-category.dto';
import { SuccessResponse } from '../common/utils/success-response';
import { Category } from './entities/category.entity';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';
import { PermissionName } from 'src/roles-module/permission.enum';

@Controller('classification/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.CREATE_CATEGORY)
  create(
    @Body() createCategoryDto: createCategoryDto_1.CreateCategoryDto,
  ): Promise<SuccessResponse<Category>> {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  findAll(): Promise<SuccessResponse<Category[]>> {
    return this.categoryService.findAll();
  }

  @Post('list')
  findFiltered(@Body() listCategoryDto: ListCategoryDto): Promise<
    SuccessResponse<{
      items: Category[];
      total: number;
      page: number;
      pageSize: number;
      lastPage: boolean;
    }>
  > {
    return this.categoryService.findFiltered(listCategoryDto);
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.VIEW_CATEGORY)
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<Category>> {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.UPDATE_CATEGORY)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: updateCategoryDto_1.UpdateCategoryDto,
  ): Promise<SuccessResponse<Category>> {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.DELETE_CATEGORY)
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    return this.categoryService.remove(id);
  }
}
