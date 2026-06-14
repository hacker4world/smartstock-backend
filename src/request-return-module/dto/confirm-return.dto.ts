import {
  IsArray,
  ValidateNested,
  IsBoolean,
  IsInt,
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

class ConfirmReturnItemDto {
  @IsInt()
  productId: number;

  @IsBoolean()
  restock: boolean;
}

export class ConfirmReturnDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfirmReturnItemDto)
  items: ConfirmReturnItemDto[];

  @IsString()
  @IsNotEmpty()
  transporterName: string;

  @IsString()
  @IsNotEmpty()
  transporterMatricule: string;
}
