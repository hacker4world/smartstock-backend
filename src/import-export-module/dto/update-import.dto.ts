import {
  IsDateString,
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type, Transform, plainToInstance } from 'class-transformer';

export class UpdateImportItemDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id?: number;

  @Type(() => Number)
  @IsNumber()
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

export class UpdateImportDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  observation?: string;

  @IsOptional()
  @IsBoolean()
  confirmed?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  supplierId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  manufacturerId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  accountId?: number;

  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const parsed = JSON.parse(value);
    return plainToInstance(UpdateImportItemDto, parsed);
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  importItems?: UpdateImportItemDto[];
}
