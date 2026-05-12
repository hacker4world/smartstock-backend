// src/import-export-module/import-export.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Import } from './entities/import.entity';
import { ImportItem } from './entities/import-item.entity';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ProductModule } from 'src/product-module/product.module';
import { Product } from 'src/product-module/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Import, ImportItem, Product]), ProductModule],
  controllers: [ImportController],
  providers: [ImportService],
  exports: [ImportService],
})
export class ImportExportModule {}
