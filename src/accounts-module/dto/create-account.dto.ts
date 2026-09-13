import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  MinLength,
} from 'class-validator';

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
}
