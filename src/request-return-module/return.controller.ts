import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ProductReturnService } from './return.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { CreateMobileReturnDto } from './dto/create-mobile-return.dto';
import { ListReturnDto } from './dto/list-return.dto';
import { ConfirmReturnDto } from './dto/confirm-return.dto';
import { SuccessResponse } from '../common/utils/success-response';
import { Return } from './entities/return.entity';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';
import { PermissionName } from 'src/roles-module/permission.enum';
import { Account } from 'src/accounts-module/entities/account.entity';
import type { Request } from 'express';

@Controller('product-return')
export class ReturnController {
  constructor(private readonly productReturnService: ProductReturnService) {}

  @Post()
  async create(
    @Body() createDto: CreateReturnDto,
  ): Promise<SuccessResponse<Return>> {
    return this.productReturnService.create(createDto);
  }

  /**
   * File a new product return from the mobile app.
   * The account is resolved from the authenticated user's JWT.
   * Only protected by authentication, no role-based permission required.
   * POST /product-return/mobile
   */
  @Post('mobile')
  @UseGuards(JwtAuthGuard)
  async createFromMobile(
    @Req() req: Request,
    @Body() createDto: CreateMobileReturnDto,
  ): Promise<SuccessResponse<Return>> {
    const account = req['user'] as Account;
    return this.productReturnService.createForAccount(account.id, createDto);
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

  /**
   * List the returns filed by the authenticated account (mobile app).
   * The account is resolved from the JWT, so it is not part of the payload.
   * Only protected by authentication, no role-based permission required.
   * GET /product-return/my-returns?page=1&pageSize=20
   */
  @Get('my-returns')
  @UseGuards(JwtAuthGuard)
  async findMyReturns(
    @Req() req: Request,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<
    SuccessResponse<{
      items: Return[];
      total: number;
      page: number;
      pageSize: number;
      lastPage: boolean;
    }>
  > {
    const account = req['user'] as Account;
    return this.productReturnService.findMyReturns(
      account.id,
      page ? +page : 1,
      pageSize ? +pageSize : undefined,
    );
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
