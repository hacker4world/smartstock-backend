import {
  IsOptional,
  IsInt,
  Min,
  IsObject,
  ValidateNested,
  IsString,
  IsEnum,
  IsBoolean, // ← new import
} from 'class-validator';
import { Type } from 'class-transformer';
import { AccountRole } from '../../common/enums/account-role.enum';

class AccountFilters {
  @IsOptional()
  @IsEnum(AccountRole)
  role?: AccountRole;

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
  @Type(() => Boolean) // ← new field
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
