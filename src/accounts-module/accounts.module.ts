import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { SharedJwtModule } from '../common/jwt/jwt.module';
import { NotificationsModule } from 'src/notifications-module/notifications.module';
import { ConstructionSite } from 'src/construction-site-module/entities/construction-site.entity';
import { Export } from 'src/import-export-module/entities/export.entity';
import { Import } from 'src/import-export-module/entities/import.entity';
import { ProductRequest } from 'src/request-return-module/entities/request.entity';
import { Return } from 'src/request-return-module/entities/return.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Account,
      Import,
      Export,
      ProductRequest,
      Return,
      ConstructionSite,
    ]),
    SharedJwtModule,
    NotificationsModule,
  ],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
