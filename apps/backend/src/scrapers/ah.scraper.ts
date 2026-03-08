import { Injectable, Logger } from '@nestjs/common';
import { BaseScraper, Product, StockStatus } from './scraper.interface';

const AH_AUTH_URL = 'https://api.ah.nl/mobile-auth/v1/auth/token/anonymous';
const AH_SEARCH_URL = 'https://api.ah.nl/mobile-services/product/search/v2';

/** AH taxonomy IDs mapped from https://www.ah.nl/producten */
const AH_TAXONOMIES: Array<{ id: number; name: string }> = [
  { id: 6401, name: 'Groente & Aardappelen' },
  { id: 20885, name: 'Fruit & Verse Sappen' },
  { id: 1730, name: 'Zuivel & Eieren' },
  { id: 1355, name: 'Bakkerij' },
  { id: 9344, name: 'Vlees' },
  { id: 1651, name: 'Vis' },
  { id: 1301, name: 'Maaltijden & Salades' },
  { id: 20824, name: 'Snacks & Chips' },
  { id: 20130, name: 'Frisdrank & Water' },
  { id: 6406, name: 'Bier, Wijn & Aperitieven' },
  { id: 1043, name: 'Koffie & Thee' },
  { id: 20129, name: 'Koek & Chocolade' },
];

const PRODUCTS_PER_TAXONOMY = 30;
const BONUS_FETCH_SIZE = 100;

interface AhToken {
  access_token: string;
  expires_at: number;
}

interface AhDiscountLabel {
  code?: string;
  defaultDescription?: string;
  count?: number;
  price?: number;
}

interface AhProductRaw {
  webshopId?: number;
  title?: string;
  salesUnitSize?: string;
  images?: Array<{ url?: string; width?: number }>;
  priceBeforeBonus?: number;
  bonusMechanism?: string;
  discountLabels?: AhDiscountLabel[];
  isBonus?: boolean;
  mainCategory?: string;
  subCategory?: string;
  orderAvailabilityStatus?: string;
  isOrderable?: boolean;
  availableOnline?: boolean;
  link?: string;
  promotionUrl?: string;
}

@Injectable()
export class AhScraper extends BaseScraper {
  readonly retailerName = 'Albert Heijn';
  private readonly logger = new Logger(AhScraper.name);
  private tokenCache: AhToken | null = null;

  private async getToken(): Promise<string> {
    if (this.tokenCache && Date.now() < this.tokenCache.expires_at) {
      return this.tokenCache.access_token;
    }
    const res = await fetch(AH_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Appie/8.22.3',
      },
      body: JSON.stringify({ clientId: 'appie' }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`AH auth failed: ${res.status}`);
    const data = await res.json() as { access_token: string; expires_in: number };
    this.tokenCache = {
      access_token: data.access_token,
      expires_at: Date.now() + (data.expires_in - 60) * 1000,
    };
    return this.tokenCache.access_token;
  }

  private async fetchProducts(token: string, params: Record<string, string | number>): Promise<Product[]> {
    const qs = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)]),
    ).toString();
    const res = await fetch(`${AH_SEARCH_URL}?${qs}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'Appie/8.22.3',
        'X-Application': 'AHWEBSHOP',
        Accept: 'application/json',
        'x-client-name': 'appie',
        'x-client-version': '8.22.3',
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) {
      this.logger.debug(`AH search HTTP ${res.status} for params: ${qs}`);
      return [];
    }
    const data = await res.json() as {
      products?: AhProductRaw[];
      cards?: Array<{ type?: string; products?: AhProductRaw[] }>;
    };

    const raws: AhProductRaw[] = [];
    // v2 API returns products[] at top level
    if (Array.isArray(data.products)) raws.push(...data.products);
    // older/alternative shape uses cards[]
    if (Array.isArray(data.cards)) {
      for (const card of data.cards) {
        if (Array.isArray(card.products)) raws.push(...card.products);
      }
    }
    return raws.map((p) => this.mapProduct(p));
  }

  private mapProduct(p: AhProductRaw): Product {
    const externalId = p.webshopId ? `ah-${p.webshopId}` : `ah-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    // Price is the unit/normal price (priceBeforeBonus is the regular shelf price)
    const price = p.priceBeforeBonus ?? 0;

    // Discount label: prefer bonusMechanism ("2 voor 1.49"), fallback to discountLabels
    const discountLabel =
      p.bonusMechanism ||
      p.discountLabels?.[0]?.defaultDescription ||
      (p.isBonus ? 'Bonus' : undefined);

    // Original price: only set when there's a simple per-unit discount to show strikethrough
    // For multi-buy promos ("2 voor 1.49") we just show the label, no originalPrice
    const originalPrice: number | undefined = undefined;

    // Prefer the largest image (800px is first in the array)
    const image = p.images?.[0]?.url;

    const outOfStock = p.orderAvailabilityStatus === 'OUT_OF_ASSORTMENT' || p.isOrderable === false;

    return {
      name: p.title ?? 'Onbekend product',
      price,
      originalPrice,
      discountLabel,
      image,
      unitSize: p.salesUnitSize,
      category: p.mainCategory,
      stockStatus: outOfStock ? StockStatus.OUT_OF_STOCK : StockStatus.AVAILABLE,
      retailer: this.retailerName,
      externalId,
      promotionUrl: p.webshopId
        ? `https://www.ah.nl/producten/product/wi${p.webshopId}`
        : undefined,
    };
  }

  async scrapePromotions(): Promise<Product[]> {
    this.logger.log('Starting AH API Scraper...');
    try {
      const token = await this.getToken();

      const allProducts: Product[] = [];
      const seen = new Set<string>();

      const addUnique = (products: Product[]) => {
        for (const p of products) {
          if (!seen.has(p.externalId)) {
            seen.add(p.externalId);
            allProducts.push(p);
          }
        }
      };

      // Fetch bonus/promoted products first (these are what users care about most)
      this.logger.log('Fetching AH bonus products...');
      const bonusProducts = await this.fetchProducts(token, {
        bonus: 'BONUS',
        sortOn: 'RELEVANCE',
        size: BONUS_FETCH_SIZE,
        page: 0,
      });
      addUnique(bonusProducts);
      this.logger.log(`AH bonus: ${bonusProducts.length} products`);

      // Fetch products from each category
      for (const taxonomy of AH_TAXONOMIES) {
        try {
          const items = await this.fetchProducts(token, {
            taxonomyId: taxonomy.id,
            sortOn: 'RELEVANCE',
            size: PRODUCTS_PER_TAXONOMY,
            page: 0,
            adType: 'TAXONOMY',
          });
          const tagged = items.map((p) => ({
            ...p,
            category: p.category ?? taxonomy.name,
          }));
          addUnique(tagged);
          this.logger.log(`AH ${taxonomy.name}: ${items.length} products`);
        } catch (e) {
          this.logger.warn(`AH taxonomy ${taxonomy.id} failed: ${e}`);
        }
      }

      this.logger.log(`AH total (deduped): ${allProducts.length} products`);
      if (allProducts.length === 0) {
        this.logger.warn('AH API returned 0 products – using mock data');
        return this.getMockData();
      }
      return allProducts;
    } catch (error) {
      this.logger.error('AH API scraper error – using mock data', error);
      return this.getMockData();
    }
  }

  async searchProduct(query: string): Promise<Product[]> {
    try {
      const token = await this.getToken();
      return this.fetchProducts(token, {
        query,
        sortOn: 'RELEVANCE',
        size: 20,
        page: 0,
      });
    } catch {
      return [];
    }
  }

  private getMockData(): Product[] {
    return [
      { name: 'Coca-Cola Regular 1.5L', price: 1.99, originalPrice: 2.59, discountLabel: '20% Korting', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'ah-mock-coke', unitSize: '1.5 L' },
      { name: 'Heineken Pilsener 6-pack', price: 14.99, originalPrice: 21.99, discountLabel: '1+1 Gratis', retailer: this.retailerName, stockStatus: StockStatus.LOW_STOCK, externalId: 'ah-mock-beer', unitSize: '6 x 330 ml' },
      { name: 'AH Halfvolle Melk', price: 0.99, originalPrice: 1.19, discountLabel: 'Prijsfavoriet', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'ah-mock-milk', unitSize: '1 L' },
      { name: 'AH Biologisch Volkoren Brood', price: 2.49, retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'ah-mock-bread', unitSize: '750 g' },
      { name: "Lay's Paprika Chips", price: 1.49, originalPrice: 2.29, discountLabel: '2+1 Gratis', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'ah-mock-chips', unitSize: '175 g' },
      { name: 'AH Verse Aardbeien', price: 2.99, originalPrice: 3.99, discountLabel: 'Bonus', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'ah-mock-aardbeien', unitSize: '400 g' },
    ];
  }
}
