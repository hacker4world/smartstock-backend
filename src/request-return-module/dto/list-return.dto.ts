import {
  IsOptional,
  IsNumber,
  IsBoolean,
  IsString,
  IsDateString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ReturnFiltersDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  accountId?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  constructionSiteId?: number;

  @IsString()
  @IsOptional()
  observation?: string;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  confirmed?: boolean;

  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @IsDateString()
  @IsOptional()
  dateTo?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  productId?: number;
}

export class ListReturnDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  pageSize?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ReturnFiltersDto)
  filters?: ReturnFiltersDto;
}
