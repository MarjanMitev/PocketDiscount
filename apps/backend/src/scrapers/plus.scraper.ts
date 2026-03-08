import { Injectable, Logger } from '@nestjs/common';
import { BaseScraper, Product, StockStatus } from './scraper.interface';

@Injectable()
export class PlusScraper extends BaseScraper {
  readonly retailerName = 'Plus';
  private readonly logger = new Logger(PlusScraper.name);

  async scrapePromotions(): Promise<Product[]> {
    this.logger.log('Plus scraper: returning sample data');
    return this.getMockData();
  }

  async searchProduct(): Promise<Product[]> {
    return [];
  }

  private getMockData(): Product[] {
    return [
      { name: 'Plus Halfvolle Melk', price: 0.95, originalPrice: 1.15, discountLabel: 'Weekvoordeel', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'plus-mock-melk', unitSize: '1 L' },
      { name: 'Campina Botermelk', price: 0.79, originalPrice: 1.09, discountLabel: '2e Halve Prijs', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'plus-mock-botermelk', unitSize: '1 L' },
      { name: 'Plus Kipdrumsticks', price: 3.49, originalPrice: 4.99, discountLabel: '30% Korting', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'plus-mock-kip', unitSize: '600 g' },
      { name: 'Douwe Egberts Aroma Rood', price: 4.99, originalPrice: 6.99, discountLabel: '1+1 Gratis', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'plus-mock-koffie', unitSize: '250 g' },
      { name: 'Zonnatura Volkoren Crackers', price: 1.49, originalPrice: 1.99, discountLabel: 'Bonus', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'plus-mock-crackers', unitSize: '200 g' },
      { name: 'Plus Roomboter', price: 1.69, originalPrice: 2.19, discountLabel: 'Aanbevolen', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'plus-mock-boter', unitSize: '250 g' },
    ];
  }
}
