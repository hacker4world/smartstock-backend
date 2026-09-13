import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { StockChange } from './entities/stock-change.entity';
import { SharedJwtModule } from 'src/common/jwt/jwt.module';
import { PermissionsModule } from 'src/common/permissions/permissions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product, StockChange]), PermissionsModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
