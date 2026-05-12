// src/import-export-module/dto/list-import.dto.ts
import {
  IsOptional,
  IsInt,
  Min,
  IsObject,
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
  @IsBoolean()
  @Type(() => Boolean)
  confirmed?: boolean;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
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
