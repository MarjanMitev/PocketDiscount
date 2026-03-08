export enum StockStatus {
  AVAILABLE = 'AVAILABLE',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  UNKNOWN = 'UNKNOWN',
}

export interface Product {
  name: string;
  price: number;
  originalPrice?: number;
  discountLabel?: string; // e.g., "1+1 Free"
  image?: string;
  unitSize?: string; // e.g. "500 gr"
  category?: string;
  stockStatus: StockStatus;
  stockCount?: number; // Optional, only if retailer provides it
  retailer: string; // "AH", "Jumbo"
  externalId: string;
  promotionUrl?: string;
}

export abstract class BaseScraper {
  abstract readonly retailerName: string;

  /**
   * Scrapes the "Weekly Folder" or Promotions page.
   * This is safer and less aggressive than scraping the full catalog.
   */
  abstract scrapePromotions(): Promise<Product[]>;

  /**
   * Optional: Search for a specific product.
   */
  abstract searchProduct(query: string): Promise<Product[]>;
}
