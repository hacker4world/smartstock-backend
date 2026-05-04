import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  minimumStock: number;

  @IsNumber()
  @IsNotEmpty()
  unitId: number;

  @IsNumber()
  @IsNotEmpty()
  warehouseId: number;

  @IsNumber()
  @IsNotEmpty()
  categoryId: number;
}
