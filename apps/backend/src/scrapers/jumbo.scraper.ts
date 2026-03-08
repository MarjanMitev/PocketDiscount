import { Injectable, Logger } from '@nestjs/common';
import { BaseScraper, Product, StockStatus } from './scraper.interface';

const JUMBO_API = 'https://mobileapi.jumbo.com/v17/search?offset=0&limit=30';
const JUMBO_PROMO_API = 'https://mobileapi.jumbo.com/v17/promotions?currentPage=0&pageSize=50';

interface JumboProductRaw {
  id?: string;
  title?: string;
  quantity?: string;
  prices?: {
    price?: { amount?: number };
    unitPrice?: { amount?: number };
    promotionalPrice?: { amount?: number };
  };
  imageInfo?: { primaryView?: Array<{ url?: string }> };
  promotion?: { tags?: Array<{ text?: string }>; fromPrice?: number };
  available?: boolean;
}

interface JumboPromoRaw {
  id?: string;
  title?: string;
  subtitle?: string;
  offerId?: string;
  image?: { url?: string };
  products?: JumboProductRaw[];
}

function mapJumboProduct(p: JumboProductRaw, retailer: string): Product {
  const price = (p.prices?.promotionalPrice?.amount ?? p.prices?.price?.amount ?? 0) / 100;
  const originalPrice = p.prices?.promotionalPrice
    ? (p.prices.price?.amount ?? 0) / 100
    : undefined;
  const hasDiscount = originalPrice !== undefined && originalPrice > price;
  const promoTags = (p.promotion?.tags ?? []).map((t) => t.text).filter(Boolean);
  return {
    name: p.title ?? 'Onbekend',
    price,
    originalPrice: hasDiscount ? originalPrice : undefined,
    discountLabel: promoTags.join(', ') || (hasDiscount ? 'Aanbieding' : undefined),
    unitSize: p.quantity,
    image: p.imageInfo?.primaryView?.[0]?.url,
    stockStatus: p.available === false ? StockStatus.OUT_OF_STOCK : StockStatus.AVAILABLE,
    retailer,
    externalId: `jumbo-${p.id ?? Date.now()}`,
  };
}

@Injectable()
export class JumboScraper extends BaseScraper {
  readonly retailerName = 'Jumbo';
  private readonly logger = new Logger(JumboScraper.name);

  async scrapePromotions(): Promise<Product[]> {
    this.logger.log('Starting Jumbo API Scraper...');
    try {
      const products: Product[] = [];
      const seen = new Set<string>();

      const addUnique = (items: Product[]) => {
        for (const p of items) {
          if (!seen.has(p.externalId)) {
            seen.add(p.externalId);
            products.push(p);
          }
        }
      };

      // Fetch promotions
      const promoRes = await fetch(JUMBO_PROMO_API, {
        headers: { 'User-Agent': 'jumbo/7.0 ios/17' },
        signal: AbortSignal.timeout(12000),
      });
      if (promoRes.ok) {
        const data = await promoRes.json() as { promotions?: { data?: JumboPromoRaw[] } };
        const promos = data?.promotions?.data ?? [];
        for (const promo of promos) {
          if (Array.isArray(promo.products)) {
            addUnique(promo.products.map((p) => mapJumboProduct(p, this.retailerName)));
          }
        }
        this.logger.log(`Jumbo promo API: ${products.length} products`);
      }

      // Fetch general search (bonus filter)
      const searchRes = await fetch(`${JUMBO_API}&filters=promotions%3Atrue`, {
        headers: { 'User-Agent': 'jumbo/7.0 ios/17' },
        signal: AbortSignal.timeout(12000),
      });
      if (searchRes.ok) {
        const data = await searchRes.json() as { products?: { data?: JumboProductRaw[] } };
        const items = data?.products?.data ?? [];
        addUnique(items.map((p) => mapJumboProduct(p, this.retailerName)));
        this.logger.log(`Jumbo search API: ${products.length} products total`);
      }

      if (products.length === 0) return this.getMockData();
      return products;
    } catch (error) {
      this.logger.error('Jumbo API error – using mock data', error);
      return this.getMockData();
    }
  }

  async searchProduct(query: string): Promise<Product[]> {
    try {
      const res = await fetch(
        `https://mobileapi.jumbo.com/v17/search?q=${encodeURIComponent(query)}&offset=0&limit=10`,
        { headers: { 'User-Agent': 'jumbo/7.0 ios/17' }, signal: AbortSignal.timeout(8000) },
      );
      if (!res.ok) return [];
      const data = await res.json() as { products?: { data?: JumboProductRaw[] } };
      return (data?.products?.data ?? []).map((p) => mapJumboProduct(p, this.retailerName));
    } catch {
      return [];
    }
  }

  private getMockData(): Product[] {
    return [
      { name: 'Jumbo Halfvolle Melk', price: 1.05, originalPrice: 1.29, discountLabel: 'Bonus', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'jumbo-mock-milk', unitSize: '1 L' },
      { name: 'Unox Rookworst', price: 2.49, originalPrice: 3.89, discountLabel: '2e Halve Prijs', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'jumbo-mock-rookworst', unitSize: '300 g' },
      { name: 'Jumbo Bruine Bonen', price: 0.69, originalPrice: 0.89, discountLabel: '3 voor 1.99', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'jumbo-mock-bonen', unitSize: '400 g' },
      { name: 'Red Bull Energy Drink', price: 1.49, originalPrice: 1.99, discountLabel: '4 voor 5.00', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'jumbo-mock-redbull', unitSize: '250 ml' },
      { name: 'Jumbo Pindakaas Naturel', price: 1.99, originalPrice: 2.79, discountLabel: 'Weekdeal', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'jumbo-mock-pindakaas', unitSize: '350 g' },
      { name: "Lay's Naturel Chips", price: 1.29, originalPrice: 1.99, discountLabel: '2+1 Gratis', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'jumbo-mock-chips', unitSize: '150 g' },
    ];
  }
}
