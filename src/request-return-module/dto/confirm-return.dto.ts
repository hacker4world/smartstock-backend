// src/returns-module/dto/confirm-return.dto.ts
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ConfirmReturnItemDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsBoolean()
  @IsNotEmpty()
  restock: boolean;
}

export class ConfirmReturnDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfirmReturnItemDto)
  @IsNotEmpty()
  items: ConfirmReturnItemDto[];
}
