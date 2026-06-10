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

export class RequestItemDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  requestedStock: number; // integer only
}

export class CreateProductRequestDto {
  @IsDateString()
  @IsNotEmpty()
  date: string; // required

  @IsString()
  @IsOptional()
  observation?: string; // still optional

  @IsNumber()
  @IsNotEmpty()
  constructionSiteId: number; // required

  @IsNumber()
  @IsNotEmpty()
  accountId: number; // required

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequestItemDto)
  @IsNotEmpty()
  requestItems: RequestItemDto[];
}
