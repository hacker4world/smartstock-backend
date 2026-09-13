import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ProductReturnService } from './return.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { ListReturnDto } from './dto/list-return.dto';
import { ConfirmReturnDto } from './dto/confirm-return.dto';
import { SuccessResponse } from '../common/utils/success-response';
import { Return } from './entities/return.entity';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';
import { PermissionName } from 'src/roles-module/permission.enum';

@Controller('product-return')
export class ReturnController {
  constructor(private readonly productReturnService: ProductReturnService) {}

  @Post()
  async create(
    @Body() createDto: CreateReturnDto,
  ): Promise<SuccessResponse<Return>> {
    return this.productReturnService.create(createDto);
  }

  @Post('list')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.ACCESS_REQUESTS_PAGE)
  async findFiltered(@Body() listDto: ListReturnDto): Promise<
    SuccessResponse<{
      items: Return[];
      total: number;
      page: number;
      pageSize: number;
      lastPage: boolean;
    }>
  > {
    return this.productReturnService.findFiltered(listDto);
  }

  @Patch(':id/confirm')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.CONFIRM_REQUEST)
  async confirm(
    @Param('id', ParseIntPipe) id: number,
    @Body() confirmDto: ConfirmReturnDto,
  ): Promise<SuccessResponse<Return>> {
    return this.productReturnService.confirm(id, confirmDto);
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.VIEW_REQUEST)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<Return>> {
    return this.productReturnService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.DENY_REQUEST)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    return this.productReturnService.remove(id);
  }
}
