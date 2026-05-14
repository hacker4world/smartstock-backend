// src/import-export-module/dto/list-import.dto.ts
import {
  IsOptional,
  IsInt,
  Min,
  ValidateNested,
  IsString,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

class ImportFilters {
  @IsOptional()
  @IsString()
  observation?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  supplierId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  manufacturerId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  accountId?: number;

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

  // --- Item-level filters ---

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  productId?: number;
}

export class ListImportDto {
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
  @Type(() => ImportFilters)
  filters?: ImportFilters;
}
