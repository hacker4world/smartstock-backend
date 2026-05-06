import {
  IsOptional,
  IsInt,
  Min,
  IsPositive,
  ValidateNested,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

class SubfamilyFilters {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  familyId?: number;
}

export class ListSubfamilyDto {
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
  @Type(() => SubfamilyFilters)
  filters?: SubfamilyFilters;
}
