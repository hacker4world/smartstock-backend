import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from './entities/supplier.entity';
import { Manufacturer } from './entities/manufacturer.entity';
import { SupplierController } from './supplier.controller';
import { ManufacturerController } from './manufacturer.controller';
import { SupplierService } from './supplier.service';
import { ManufacturerService } from './manufacturer.service';
import { Product } from 'src/product-module/entities/product.entity';
import { Import } from 'src/import-export-module/entities/import.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Supplier, Manufacturer, Product, Import]),
  ],
  controllers: [SupplierController, ManufacturerController],
  providers: [SupplierService, ManufacturerService],
  exports: [SupplierService, ManufacturerService],
})
export class SupplierManufacturerModule {}
