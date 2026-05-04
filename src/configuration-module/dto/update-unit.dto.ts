import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUnitDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}
