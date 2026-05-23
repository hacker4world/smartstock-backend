// src/import-export-module/dto/list-export.dto.ts
import {
  IsOptional,
  IsInt,
  Min,
  ValidateNested,
  IsString,
  IsBoolean,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExportType } from '../entities/export.entity';

class ExportFilters {
  @IsOptional()
  @IsString()
  observation?: string;

  @IsOptional()
  @IsEnum(ExportType)
  exportType?: ExportType;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  warehouseId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  constructionSiteId?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  confirmed?: boolean;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  accountId?: number;

  // --- Item-level filter ---
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  productId?: number;
}

export class ListExportDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pageSize?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ExportFilters)
  filters?: ExportFilters;
}
