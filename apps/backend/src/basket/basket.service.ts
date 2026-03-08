import { Injectable } from '@nestjs/common';
import { ScrapersService } from '../scrapers/scrapers.service';
import { Product } from '../scrapers/scraper.interface';

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

const RETAILER_COLORS: Record<string, string> = {
  'Albert Heijn': '#00AEEF',
  'Jumbo': '#FFD700',
  'Lidl': '#0050AA',
  'Aldi': '#1F5CA9',
  'Dirk': '#E30613',
  'Plus': '#FF6600',
  'Vomar': '#E2001A',
  'Spar': '#007A3D',
  'Etos': '#005BAA',
};

@Injectable()
export class BasketService {
  constructor(private readonly scrapersService: ScrapersService) {}

  async optimize(queries: string[]): Promise<BasketResult> {
    const allProducts = await this.scrapersService.scrapeAll();

    const flat: Product[] = Object.values(allProducts).flat();

    const itemResults: BasketItem[] = [];
    const itemsNotFound: string[] = [];

    for (const query of queries) {
      const q = query.toLowerCase().trim();
      const matches = flat.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          q.split(' ').some((word) => p.name.toLowerCase().includes(word)),
      );

      if (matches.length === 0) {
        itemsNotFound.push(query);
        continue;
      }

      const sorted = [...matches].sort((a, b) => a.price - b.price);
      const best = sorted[0];
      const savings = best.originalPrice
        ? best.originalPrice - best.price
        : 0;

      itemResults.push({
        query,
        bestMatch: best,
        allMatches: sorted,
        savings,
      });
    }

    const storeMap = new Map<string, StoreGroup>();
    for (const item of itemResults) {
      if (!item.bestMatch) continue;
      const retailer = item.bestMatch.retailer;
      if (!storeMap.has(retailer)) {
        storeMap.set(retailer, {
          retailer,
          items: [],
          subtotal: 0,
          color: RETAILER_COLORS[retailer] ?? '#888',
        });
      }
      const group = storeMap.get(retailer)!;
      group.items.push(item);
      group.subtotal += item.bestMatch.price;
    }

    const plan = [...storeMap.values()].sort(
      (a, b) => b.items.length - a.items.length,
    );

    const totalCost = itemResults.reduce(
      (sum, i) => sum + (i.bestMatch?.price ?? 0),
      0,
    );
    const totalOriginalCost = itemResults.reduce(
      (sum, i) => sum + (i.bestMatch?.originalPrice ?? i.bestMatch?.price ?? 0),
      0,
    );

    return {
      plan,
      itemsNotFound,
      totalCost: Math.round(totalCost * 100) / 100,
      totalOriginalCost: Math.round(totalOriginalCost * 100) / 100,
      totalSavings: Math.round((totalOriginalCost - totalCost) * 100) / 100,
    };
  }
}
