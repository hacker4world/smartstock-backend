import {
  IsOptional,
  IsInt,
  Min,
  IsObject,
  ValidateNested,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

class ConstructionSiteFilters {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  managerId?: number;
}

export class ListConstructionSiteDto {
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
  @Type(() => ConstructionSiteFilters)
  filters?: ConstructionSiteFilters;
}
