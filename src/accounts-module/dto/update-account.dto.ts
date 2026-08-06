import { IsOptional, IsString, IsNotEmpty, IsInt } from 'class-validator';

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
  @IsInt()
  roleId?: number;
}
