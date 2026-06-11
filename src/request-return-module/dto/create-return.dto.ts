import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReturnItemDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @Min(0.01)
  returnedStock: number;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class CreateReturnDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  observation?: string;

  @IsNumber()
  constructionSiteId: number;

  @IsNumber()
  accountId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReturnItemDto)
  returnItems: CreateReturnItemDto[];
}
