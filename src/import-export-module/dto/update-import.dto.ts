// src/import-export-module/dto/update-import.dto.ts
import {
  IsDateString,
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateImportItemDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsNumber()
  productId: number;

  @IsNumber()
  @Min(0)
  enteredStock: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class UpdateImportDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  observation?: string;

  @IsOptional()
  @IsBoolean()
  confirmed?: boolean;

  @IsOptional()
  @IsNumber()
  supplierId?: number;

  @IsOptional()
  @IsNumber()
  manufacturerId?: number;

  @IsOptional()
  @IsNumber()
  accountId?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateImportItemDto)
  importItems?: UpdateImportItemDto[];
}
