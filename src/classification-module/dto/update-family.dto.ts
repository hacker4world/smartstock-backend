import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateFamilyDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}
