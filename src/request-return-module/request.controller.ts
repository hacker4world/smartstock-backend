// src/requests-module/product-request.controller.ts
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
import { RequestService } from './request.service';
import { CreateProductRequestDto } from './dto/create-product-request.dto';
import { CreateMobileProductRequestDto } from './dto/create-mobile-product-request.dto';
import { ListProductRequestDto } from './dto/list-product-request.dto';
import { SuccessResponse } from '../common/utils/success-response';
import { ProductRequest } from './entities/request.entity';
import { Export } from 'src/import-export-module/entities/export.entity';
import { TurnProductRequestIntoExportDto } from './dto/turn-product-request-into-export.dto';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';
import { PermissionName } from 'src/roles-module/permission.enum';
import { Account } from 'src/accounts-module/entities/account.entity';
import type { Request } from 'express';

@Controller('product-request')
export class ProductRequestController {
  constructor(private readonly productRequestService: RequestService) {}

  @Post()
  async create(
    @Body() createDto: CreateProductRequestDto,
  ): Promise<SuccessResponse<ProductRequest>> {
    return this.productRequestService.create(createDto);
  }

  /**
   * File a new product request from the mobile app.
   * The account is resolved from the authenticated user's JWT.
   * Only protected by authentication, no role-based permission required.
   * POST /product-request/mobile
   */
  @Post('mobile')
  @UseGuards(JwtAuthGuard)
  async createFromMobile(
    @Req() req: Request,
    @Body() createDto: CreateMobileProductRequestDto,
  ): Promise<SuccessResponse<ProductRequest>> {
    const account = req['user'] as Account;
    return this.productRequestService.createForAccount(
      account.id,
      createDto,
    );
  }

  @Post('list')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.ACCESS_REQUESTS_PAGE)
  async list(@Body() listDto: ListProductRequestDto): Promise<
    SuccessResponse<{
      items: ProductRequest[];
      total: number;
      page: number;
      pageSize: number;
      lastPage: boolean;
    }>
  > {
    return this.productRequestService.findFiltered(listDto);
  }

  /**
   * List the requests filed by the authenticated account (mobile app).
   * The account is resolved from the JWT, so it is not part of the payload.
   * Only protected by authentication, no role-based permission required.
   * GET /product-request/my-requests?page=1&pageSize=20
   */
  @Get('my-requests')
  @UseGuards(JwtAuthGuard)
  async findMyRequests(
    @Req() req: Request,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<
    SuccessResponse<{
      items: ProductRequest[];
      total: number;
      page: number;
      pageSize: number;
      lastPage: boolean;
    }>
  > {
    const account = req['user'] as Account;
    return this.productRequestService.findMyRequests(
      account.id,
      page ? +page : 1,
      pageSize ? +pageSize : undefined,
    );
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.VIEW_REQUEST)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<ProductRequest>> {
    return this.productRequestService.findOne(id);
  }

  @Patch(':id/confirm')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.CONFIRM_REQUEST)
  async confirm(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<ProductRequest>> {
    return this.productRequestService.confirm(id);
  }

  @Post(':id/turn-into-export')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.ACCESS_REQUESTS_PAGE)
  async turnIntoExport(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TurnProductRequestIntoExportDto,
  ): Promise<SuccessResponse<Export>> {
    return this.productRequestService.turnIntoExport(id, dto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.DENY_REQUEST)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    return this.productRequestService.remove(id);
  }
}
