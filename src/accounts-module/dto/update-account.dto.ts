import { IsOptional, IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { AccountRole } from '../../common/enums/account-role.enum';

export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstname?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastname?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  username?: string;

  @IsOptional()
  @IsEnum(AccountRole)
  role?: AccountRole;
}
