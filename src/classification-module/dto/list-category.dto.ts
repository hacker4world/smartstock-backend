import {
  IsOptional,
  IsInt,
  Min,
  IsPositive,
  ValidateNested,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

class CategoryFilters {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  subfamilyId?: number;
}

export class ListCategoryDto {
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
  @Type(() => CategoryFilters)
  filters?: CategoryFilters;
}
