import {
  IsOptional,
  IsInt,
  Min,
  IsObject,
  ValidateNested,
  IsString,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class ProductFilters {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  unitId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  categoryId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  warehouseId?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minimumStock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  averagePrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stock?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  supplierId?: number;
}

export class ListProductDto {
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
  @Type(() => ProductFilters)
  filters?: ProductFilters;
}
