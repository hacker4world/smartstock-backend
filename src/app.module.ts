import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationModule } from './configuration-module/configuration.module';
import { ClassificationModule } from './classification-module/classification.module';
import { SupplierManufacturerModule } from './supplier-manufacturer-module/supplier-manufacturer.module';
import { AccountsModule } from './accounts-module/accounts.module';
import { ConstructionSiteModule } from './construction-site-module/construction-site.module';
import { ProductModule } from './product-module/product.module';
import { SharedJwtModule } from './common/jwt/jwt.module';
import { ImportExportModule } from './import-export-module/import-export.module';
import { NotificationsModule } from './notifications-module/notifications.module';
import { WebsocketModule } from './common/websocket/websocket.module';
import { CalendarModule } from './calendar-module/calendar.module';
import { RequestReturnModule } from './request-return-module/request-return.module';
import { EventsModule } from './events-module/events.module';
import { RolesModule } from './roles-module/roles.module';

@Module({
  imports: [
    // Load .env file globally so all modules can access it
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    SharedJwtModule,

    // Configure TypeORM connection to PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    ConfigurationModule,
    ClassificationModule,
    SupplierManufacturerModule,
    AccountsModule,
    ConstructionSiteModule,
    ProductModule,
    ImportExportModule,
    NotificationsModule,
    WebsocketModule,
    CalendarModule,
    RequestReturnModule,
    EventsModule,
    RolesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}