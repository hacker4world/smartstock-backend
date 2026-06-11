import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductRequestController } from './request.controller';
import { ReturnController } from './return.controller';
import { RequestService } from './request.service';
import { ProductReturnService } from './return.service';
import { ProductRequest } from './entities/request.entity';
import { RequestItem } from './entities/request-items.entity';
import { ProductModule } from 'src/product-module/product.module';
import { ConstructionSiteModule } from 'src/construction-site-module/construction-site.module';
import { AccountsModule } from 'src/accounts-module/accounts.module';
import { Product } from 'src/product-module/entities/product.entity';
import { Account } from 'src/accounts-module/entities/account.entity';
import { ConstructionSite } from 'src/construction-site-module/entities/construction-site.entity';
import { NotificationsModule } from 'src/notifications-module/notifications.module';
import { Export } from 'src/import-export-module/entities/export.entity';
import { ExportItem } from 'src/import-export-module/entities/export-item.entity';
import { Return } from './entities/return.entity';
import { ReturnItem } from './entities/return-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductRequest,
      RequestItem,
      Product,
      Account,
      ConstructionSite,
      Export,
      ExportItem,
      Return,
      ReturnItem,
    ]),
    ProductModule,
    ConstructionSiteModule,
    AccountsModule,
    NotificationsModule,
  ],
  controllers: [ProductRequestController, ReturnController],
  providers: [RequestService, ProductReturnService],
  exports: [],
})
export class RequestReturnModule {}
