// src/import-export-module/dto/create-export.dto.ts
import {
  IsDateString,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  ValidateIf,
} from 'class-validator';
import { Type, Transform, plainToInstance } from 'class-transformer';
import { ExportType } from '../entities/export.entity';

export class CreateExportItemDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
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

export class CreateExportDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  observation?: string;

  @IsEnum(ExportType)
  exportType: ExportType;

  // --- Warehouse (required if exportType is to-warehouse) ---
  @ValidateIf((o) => o.exportType === ExportType.TO_WAREHOUSE)
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  warehouseId?: number;

  // --- Construction site (required if exportType is to-construction-site) ---
  @ValidateIf((o) => o.exportType === ExportType.TO_CONSTRUCTION_SITE)
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  constructionSiteId?: number;

  // --- External export fields (required if exportType is external) ---
  @ValidateIf((o) => o.exportType === ExportType.EXTERNAL)
  @IsString()
  @IsNotEmpty()
  entrepriseName?: string;

  @ValidateIf((o) => o.exportType === ExportType.EXTERNAL)
  @IsString()
  @IsNotEmpty()
  address?: string;

  @ValidateIf((o) => o.exportType === ExportType.EXTERNAL)
  @IsString()
  @IsNotEmpty()
  matriculeFiscale?: string;

  @ValidateIf((o) => o.exportType === ExportType.EXTERNAL)
  @IsString()
  @IsNotEmpty()
  clientName?: string;

  // --- Transporter toggle (only relevant for external) ---
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  withTransporter?: boolean;

  // --- Transporter fields ---
  // Required when: (to-warehouse or to-construction-site) OR (external AND withTransporter=true)
  @ValidateIf(
    (o) =>
      o.exportType === ExportType.TO_WAREHOUSE ||
      o.exportType === ExportType.TO_CONSTRUCTION_SITE ||
      o.withTransporter === true,
  )
  @IsString()
  @IsNotEmpty()
  transporterName?: string;

  @ValidateIf(
    (o) =>
      o.exportType === ExportType.TO_WAREHOUSE ||
      o.exportType === ExportType.TO_CONSTRUCTION_SITE ||
      o.withTransporter === true,
  )
  @IsString()
  @IsNotEmpty()
  transporterMatricule?: string;

  // --- Items ---
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const parsed = JSON.parse(value);
    return plainToInstance(CreateExportItemDto, parsed);
  })
  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  exportItems?: CreateExportItemDto[];
}
