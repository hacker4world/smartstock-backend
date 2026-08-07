import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  Get,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ListAccountDto } from './dto/list-account.dto';
import * as successResponse from '../common/utils/success-response';
import { Account } from './entities/account.entity';
import { AccountStats } from './dto/account-stats.dto';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionName } from 'src/roles-module/permission.enum';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get(':id/activity')
  async getActivity(@Param('id', ParseIntPipe) id: number): Promise<
    successResponse.SuccessResponse<{
      imports: any[];
      exports: any[];
      requests: any[];
      returns: any[];
      constructionSites: any[];
    }>
  > {
    return this.accountsService.getAccountActivity(id);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<successResponse.SuccessResponse<{ account: Account; token: string }>> {
    const result = await this.accountsService.login(loginDto);

    res.cookie('access_token', result.data.token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return result;
  }

  // ── NEW: Check authentication status from cookie ──
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(
    @Req() req: Request,
  ): successResponse.SuccessResponse<{ account: Account; token: string }> {
    return {
      data: {
        account: req['user'] as Account,
        token: req['token'] as string,
      },
      message: 'Authentifié avec succès',
    };
  }

  @Post()
  create(
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<successResponse.SuccessResponse<Account>> {
    return this.accountsService.create(createAccountDto);
  }

  @Post('list')
  findFiltered(@Body() listAccountDto: ListAccountDto): Promise<
    successResponse.SuccessResponse<{
      items: Account[];
      total: number;
      page: number;
      pageSize: number;
    }>
  > {
    return this.accountsService.findFiltered(listAccountDto);
  }

  @Get('stats')
  getStats(): Promise<successResponse.SuccessResponse<AccountStats>> {
    return this.accountsService.getStats();
  }

  @Patch(':id/accept')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.CONFIRM_PENDING_ACCOUNT)
  accept(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<successResponse.SuccessResponse<Account>> {
    return this.accountsService.accept(id);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.UPDATE_CONFIRMED_ACCOUNT)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<successResponse.SuccessResponse<Account>> {
    return this.accountsService.update(id, updateAccountDto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<successResponse.SuccessResponse<null>> {
    return this.accountsService.remove(id);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<successResponse.SuccessResponse<Account>> {
    return this.accountsService.findOne(id);
  }

  @Post('logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
  ): Promise<successResponse.SuccessResponse<null>> {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
    return {
      data: null,
      message: 'Déconnexion réussie',
    };
  }
}
