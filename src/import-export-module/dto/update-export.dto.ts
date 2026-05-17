// src/import-export-module/dto/update-export.dto.ts
import {
  IsDateString,
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsEnum,
} from 'class-validator';
import { Type, Transform, plainToInstance } from 'class-transformer';
import { ExportType } from '../entities/export.entity';

export class UpdateExportItemDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id?: number;

  @Type(() => Number)
  @IsNumber()
  productId: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  exitedStock: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class UpdateExportDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  observation?: string;

  @IsOptional()
  @IsEnum(ExportType)
  exportType?: ExportType;

  // --- Warehouse ---
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  warehouseId?: number;

  // --- Construction site ---
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  constructionSiteId?: number;

  // --- External export fields ---
  @IsOptional()
  @IsString()
  entrepriseName?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  matriculeFiscale?: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  // --- Transporter ---
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  withTransporter?: boolean;

  @IsOptional()
  @IsString()
  transporterName?: string;

  @IsOptional()
  @IsString()
  transporterMatricule?: string;

  // --- Items ---
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const parsed = JSON.parse(value);
    return plainToInstance(UpdateExportItemDto, parsed);
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  exportItems?: UpdateExportItemDto[];
}
