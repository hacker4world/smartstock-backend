import {
  IsOptional,
  IsInt,
  Min,
  IsObject,
  ValidateNested,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

class SupplierFilters {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  contact?: string;
}

export class ListSupplierDto {
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
  @Type(() => SupplierFilters)
  filters?: SupplierFilters;
}
