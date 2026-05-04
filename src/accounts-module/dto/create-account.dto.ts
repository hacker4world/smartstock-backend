import { IsString, IsNotEmpty, IsEnum, MinLength } from 'class-validator';
import { AccountRole } from '../../common/enums/account-role.enum';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsEnum(AccountRole)
  role: AccountRole;
}
