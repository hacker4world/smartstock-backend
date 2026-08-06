import {
  IsOptional,
  IsInt,
  Min,
  ValidateNested,
  IsString,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

class AccountFilters {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  roleId?: number;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  firstname?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  confirmed?: boolean;
}

export class ListAccountDto {
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
  @Type(() => AccountFilters)
  filters?: AccountFilters;
}
