import { IsString, IsNotEmpty, IsInt, IsNumber } from 'class-validator';

export class CreateConstructionSiteDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsInt()
  @IsNotEmpty()
  managerId: number;
}
