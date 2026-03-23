import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AhScraper } from './ah.scraper';
import { TroliScraper } from './troli.scraper';
import { JumboScraper } from './jumbo.scraper';
import { LidlScraper } from './lidl.scraper';
import { PlusScraper } from './plus.scraper';
import { DirkScraper } from './dirk.scraper';
import { VomarScraper } from './vomar.scraper';
import { SparScraper } from './spar.scraper';
import { EtosScraper } from './etos.scraper';
import { Product } from './scraper.interface';
import { ProductImagesService } from '../product-images/product-images.service';

@Injectable()
export class ScrapersService {
  private readonly logger = new Logger(ScrapersService.name);
  private cache: Record<string, Product[]> = {};
  private lastFetched: Date | null = null;
  private readonly CACHE_TTL_MS = 30 * 60 * 1000;

  constructor(
    private readonly productImages: ProductImagesService,
    private readonly ahScraper: AhScraper,
    private readonly troliScraper: TroliScraper,
    private readonly jumboScraper: JumboScraper,
    private readonly lidlScraper: LidlScraper,
    private readonly plusScraper: PlusScraper,
    private readonly dirkScraper: DirkScraper,
    private readonly vomarScraper: VomarScraper,
    private readonly sparScraper: SparScraper,
    private readonly etosScraper: EtosScraper,
  ) {}

  async scrapeAll(): Promise<Record<string, Product[]>> {
    const hasProducts = Object.values(this.cache).some((arr) => arr.length > 0);
    if (hasProducts && this.lastFetched && Date.now() - this.lastFetched.getTime() < this.CACHE_TTL_MS) {
      this.logger.debug('Returning cached products');
      return this.cache;
    }
    return this.refreshAll();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async refreshAll(): Promise<Record<string, Product[]>> {
    this.logger.log('Refreshing all scrapers...');

    const [ah, troli, jumbo, lidl, plus, dirk, vomar, spar, etos] = await Promise.allSettled([
      this.ahScraper.scrapePromotions(),
      this.troliScraper.scrapePromotions(),
      this.jumboScraper.scrapePromotions(),
      this.lidlScraper.scrapePromotions(),
      this.plusScraper.scrapePromotions(),
      this.dirkScraper.scrapePromotions(),
      this.vomarScraper.scrapePromotions(),
      this.sparScraper.scrapePromotions(),
      this.etosScraper.scrapePromotions(),
    ]);

    const toList = (p: PromiseSettledResult<Product[]>) => (p.status === 'fulfilled' ? p.value : []);

    const retailers = [
      this.ahScraper, this.troliScraper, this.jumboScraper, this.lidlScraper,
      this.plusScraper, this.dirkScraper, this.vomarScraper, this.sparScraper, this.etosScraper,
    ];
    const results = [ah, troli, jumbo, lidl, plus, dirk, vomar, spar, etos];
    this.cache = {};
    retailers.forEach((scraper, i) => {
      this.cache[scraper.retailerName] = toList(results[i]);
    });
    const all = Object.values(this.cache).flat();
    this.lastFetched = new Date();
    this.logger.log(`Scrape complete. Total: ${all.length} products. Downloading images in background...`);
    this.productImages.replaceWithLocalImages(all).catch((err) =>
      this.logger.warn(`Background image download failed: ${err}`),
    );
    return this.cache;
  }

  async searchProducts(query: string): Promise<Product[]> {
    const all = await this.scrapeAll();
    const flat = Object.values(all).flat();
    const q = query.toLowerCase();
    return flat.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q),
    );
  }

  getAllFlat(): Product[] {
    return Object.values(this.cache).flat();
  }
}
