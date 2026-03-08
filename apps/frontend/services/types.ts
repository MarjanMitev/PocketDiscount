export type StockStatus = 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'UNKNOWN';

export interface Product {
  name: string;
  price: number;
  originalPrice?: number;
  discountLabel?: string;
  image?: string;
  unitSize?: string;
  category?: string;
  stockStatus: StockStatus;
  stockCount?: number;
  retailer: string;
  externalId: string;
  promotionUrl?: string;
}

export interface StoreLocation {
  id: string;
  retailer: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  color: string;
  openingHours?: string;
  distance?: number;
}

export interface BasketItem {
  query: string;
  bestMatch: Product | null;
  allMatches: Product[];
  savings: number;
}

export interface StoreGroup {
  retailer: string;
  items: BasketItem[];
  subtotal: number;
  color: string;
}

export interface BasketResult {
  plan: StoreGroup[];
  itemsNotFound: string[];
  totalCost: number;
  totalOriginalCost: number;
  totalSavings: number;
}

export type PromotionsResponse = Record<string, Product[]>;
