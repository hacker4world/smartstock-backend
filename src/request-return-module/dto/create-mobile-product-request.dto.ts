import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MobileRequestItemDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  requestedStock: number; // integer only
}

/**
 * Payload used by the mobile app to file a new product request.
 *
 * Unlike CreateProductRequestDto, the account is not provided in the body:
 * it is resolved from the authenticated user's JWT. The date is optional and
 * defaults to the current date.
 */
export class CreateMobileProductRequestDto {
  @IsDateString()
  @IsOptional()
  date?: string; // defaults to today when omitted

  @IsString()
  @IsOptional()
  observation?: string;

  @IsInt()
  @IsNotEmpty()
  constructionSiteId: number; // required

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MobileRequestItemDto)
  @IsNotEmpty()
  requestItems: MobileRequestItemDto[];
}
