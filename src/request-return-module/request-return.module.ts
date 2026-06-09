import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductRequestController } from './request.controller';
import { ReturnController } from './return.controller';
import { RequestService } from './request.service';
import { ReturnService } from './return.service';
import { ProductRequest } from './entities/request.entity';
import { RequestItem } from './entities/request-items.entity';
import { ProductModule } from 'src/product-module/product.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductRequest, RequestItem]),
    ProductModule,
  ],
  controllers: [ProductRequestController, ReturnController],
  providers: [RequestService, ReturnService],
  exports: [],
})
export class RequestReturnModule {}
