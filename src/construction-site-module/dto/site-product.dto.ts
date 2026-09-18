import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

/**
 * Product available on a construction site.
 * A site "has" a product when at least one confirmed export to that site
 * contains the product in its items.
 */
export class SiteProductDto {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  stock: number;

  @IsNumber()
  minimumStock: number;

  @IsNumber()
  averagePrice: number;

  @IsOptional()
  unit: { id: number; name: string } | null;

  @IsOptional()
  warehouse: { id: number; name: string } | null;

  @IsOptional()
  category: { id: number; name: string } | null;

  // Total quantity delivered to the site through confirmed exports
  @IsNumber()
  @Min(0)
  quantiteLivre: number;
}
