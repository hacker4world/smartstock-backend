import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RequestItemDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsNotEmpty()
  requestedStock: number;
}

export class CreateProductRequestDto {
  @IsDateString()
  @IsNotEmpty()
  date: string; // ISO date string, e.g. "2026-06-09"

  @IsString()
  @IsOptional()
  observation?: string;

  @IsNumber()
  @IsOptional()
  constructionSiteId?: number;

  @IsNumber()
  @IsOptional()
  accountId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequestItemDto)
  @IsNotEmpty()
  requestItems: RequestItemDto[];
}
