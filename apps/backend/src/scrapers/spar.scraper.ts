import { Injectable, Logger } from '@nestjs/common';
import { BaseScraper, Product, StockStatus } from './scraper.interface';

@Injectable()
export class SparScraper extends BaseScraper {
  readonly retailerName = 'Spar';
  private readonly logger = new Logger(SparScraper.name);

  async scrapePromotions(): Promise<Product[]> {
    this.logger.log('Spar scraper: returning sample data');
    return this.getMockData();
  }

  async searchProduct(): Promise<Product[]> {
    return [];
  }

  private getMockData(): Product[] {
    return [
      { name: 'Spar Verse Eieren', price: 1.79, originalPrice: 2.29, discountLabel: 'Weekaanbieding', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'spar-mock-eieren', unitSize: '6 stuks' },
      { name: 'Spar Biologisch Appelsap', price: 1.49, originalPrice: 1.99, discountLabel: 'Bio Deal', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'spar-mock-appelsap', unitSize: '1 L' },
      { name: 'Spar Kaasplakken Jong', price: 1.99, originalPrice: 2.79, discountLabel: '2e Halve Prijs', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'spar-mock-kaas', unitSize: '250 g' },
      { name: 'Spar Rundergehakt', price: 3.49, originalPrice: 4.99, discountLabel: 'Korting', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'spar-mock-gehakt', unitSize: '400 g' },
    ];
  }
}
