import { Injectable, Logger } from '@nestjs/common';
import { BaseScraper, Product, StockStatus } from './scraper.interface';

/** Lidl NL public offers API */
const LIDL_API = 'https://www.lidl.nl/api/versionable/v1/offers/dutch/NL';

interface LidlOfferRaw {
  id?: string;
  fullTitle?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  discount?: string;
  image?: string;
  imageUrl?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class LidlScraper extends BaseScraper {
  readonly retailerName = 'Lidl';
  private readonly logger = new Logger(LidlScraper.name);

  async scrapePromotions(): Promise<Product[]> {
    this.logger.log('Starting Lidl API Scraper...');
    try {
      const res = await fetch(LIDL_API, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible)',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) {
        this.logger.warn(`Lidl API responded ${res.status} – using mock data`);
        return this.getMockData();
      }
      const data = await res.json() as LidlOfferRaw[] | { offers?: LidlOfferRaw[]; data?: LidlOfferRaw[] };
      const offers: LidlOfferRaw[] = Array.isArray(data)
        ? data
        : ((data as any).offers ?? (data as any).data ?? []);

      if (offers.length === 0) return this.getMockData();

      const products: Product[] = offers.map((o, i) => {
        const price = o.price ?? 0;
        const origPrice = o.originalPrice && o.originalPrice > price ? o.originalPrice : undefined;
        return {
          name: o.fullTitle ?? o.description ?? 'Lidl product',
          price,
          originalPrice: origPrice,
          discountLabel: o.discount || (origPrice ? 'Aanbieding' : undefined),
          image: o.imageUrl ?? o.image,
          category: o.category,
          stockStatus: StockStatus.AVAILABLE,
          retailer: this.retailerName,
          externalId: `lidl-${o.id ?? i}`,
        };
      });

      this.logger.log(`Lidl: ${products.length} products from API`);
      return products;
    } catch (error) {
      this.logger.error('Lidl API error – using mock data', error);
      return this.getMockData();
    }
  }

  async searchProduct(query: string): Promise<Product[]> {
    return [];
  }

  private getMockData(): Product[] {
    return [
      { name: 'Lidl Verse Broodjes 6-pack', price: 0.89, originalPrice: 1.29, discountLabel: '3+1 Gratis', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'lidl-mock-broodjes', unitSize: '6 stuks' },
      { name: 'Milbona Volle Yoghurt', price: 0.59, originalPrice: 0.79, discountLabel: 'Weekaanbieding', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'lidl-mock-yoghurt', unitSize: '500 g' },
      { name: 'Lidl Kipfilet', price: 3.99, originalPrice: 5.49, discountLabel: '27% Korting', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'lidl-mock-kip', unitSize: '500 g' },
      { name: 'Gut Bio Bananen', price: 1.19, originalPrice: 1.59, discountLabel: 'Bonus', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'lidl-mock-bananen', unitSize: '1 kg' },
      { name: 'Solevita Sinaasappelsap', price: 1.29, originalPrice: 1.89, discountLabel: '2 voor 2.39', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'lidl-mock-sap', unitSize: '1 L' },
    ];
  }
}
