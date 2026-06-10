import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UnitPriceItemDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  unitPrice: number;
}

export class TurnProductRequestIntoExportDto {
  @IsString()
  @IsNotEmpty()
  transporterName: string;

  @IsString()
  @IsNotEmpty()
  transporterMatricule: string;

  @IsNumber()
  @IsNotEmpty()
  accountId: number;

  @IsString()
  @IsOptional()
  observation?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UnitPriceItemDto)
  @IsNotEmpty()
  unitPrices: UnitPriceItemDto[];
}
