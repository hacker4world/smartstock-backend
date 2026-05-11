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
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ListAccountDto } from './dto/list-account.dto';
import { SuccessResponse } from '../common/utils/success-response';
import { Account } from './entities/account.entity';
import { AccountStats } from './dto/account-stats.dto';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SuccessResponse<{ account: Account; token: string }>> {
    const result = await this.accountsService.login(loginDto);

    res.cookie('access_token', result.data.token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day in ms
    });

    return result;
  }

  @Post()
  create(
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<SuccessResponse<Account>> {
    return this.accountsService.create(createAccountDto);
  }

  @Post('list')
  findFiltered(@Body() listAccountDto: ListAccountDto): Promise<
    SuccessResponse<{
      items: Account[];
      total: number;
      page: number;
      pageSize: number;
    }>
  > {
    return this.accountsService.findFiltered(listAccountDto);
  }

  @Get('stats')
  getStats(): Promise<SuccessResponse<AccountStats>> {
    return this.accountsService.getStats();
  }

  @Patch(':id/accept')
  accept(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<Account>> {
    return this.accountsService.accept(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<SuccessResponse<Account>> {
    return this.accountsService.update(id, updateAccountDto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    return this.accountsService.remove(id);
  }
}
