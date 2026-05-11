import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { SharedJwtModule } from '../common/jwt/jwt.module';

@Module({
  imports: [TypeOrmModule.forFeature([Account]), SharedJwtModule],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
