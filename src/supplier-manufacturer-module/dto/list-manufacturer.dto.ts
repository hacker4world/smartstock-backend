import {
  IsOptional,
  IsInt,
  Min,
  IsObject,
  ValidateNested,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

class ManufacturerFilters {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

export class ListManufacturerDto {
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
  @Type(() => ManufacturerFilters)
  filters?: ManufacturerFilters;
}
