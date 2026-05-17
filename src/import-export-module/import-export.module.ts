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
import { Export } from './entities/export.entity';
import { ExportItem } from './entities/export-item.entity';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';

@Module({
  imports: [TypeOrmModule.forFeature([Import, ImportItem, Product, Export, ExportItem]), ProductModule],
  controllers: [ImportController, ExportController],
  providers: [ImportService, ExportService],
  exports: [ImportService],
})
export class ImportExportModule {}
