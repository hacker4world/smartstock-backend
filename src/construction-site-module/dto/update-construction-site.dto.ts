import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class UpdateConstructionSiteDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address?: string;

  @IsOptional()
  @IsInt()
  @IsNotEmpty()
  managerId?: number;
}
