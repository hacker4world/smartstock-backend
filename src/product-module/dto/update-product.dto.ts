import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumStock?: number;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  unitId?: number;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  warehouseId?: number;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  categoryId?: number;
}
