// src/import-export-module/dto/create-import.dto.ts
import {
  IsDateString,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateImportItemDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @Min(0)
  enteredStock: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateImportDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  observation?: string;

  @IsNumber()
  @IsNotEmpty()
  supplierId: number;

  @IsNumber()
  @IsNotEmpty()
  manufacturerId: number;

  @IsNumber()
  @IsNotEmpty()
  accountId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateImportItemDto)
  @IsOptional()
  importItems?: CreateImportItemDto[];
}
