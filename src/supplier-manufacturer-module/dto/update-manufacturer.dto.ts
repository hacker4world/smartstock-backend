import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateManufacturerDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
