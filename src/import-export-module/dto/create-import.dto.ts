import {
  IsDateString,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { Type, Transform, plainToInstance } from 'class-transformer';

export class CreateImportItemDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  enteredStock: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateImportDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  observation?: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  supplierId: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  manufacturerId: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  accountId: number;

  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const parsed = JSON.parse(value);
    return plainToInstance(CreateImportItemDto, parsed); // ← parse + instantiate
  })
  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  importItems?: CreateImportItemDto[];
}
