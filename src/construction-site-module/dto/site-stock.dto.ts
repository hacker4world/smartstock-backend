import { Product } from '../../product-module/entities/product.entity';

/**
 * Stock available for return on a construction site, per product.
 * Used by the mobile app's return screen.
 */
export class SiteStockItemDto {
  product: Product;

  // Total quantity delivered to the site through confirmed exports
  totalLivre: number;

  // Total quantity already returned through confirmed returns
  totalRetourne: number;

  // Total quantity in pending (not yet confirmed) returns
  enAttenteRetour: number;

  // totalLivre - totalRetourne - enAttenteRetour, floored at 0
  quantiteDisponible: number;
}

export type SiteStockDto = SiteStockItemDto;
