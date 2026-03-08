import { Injectable, Logger } from '@nestjs/common';
import { BaseScraper, Product, StockStatus } from './scraper.interface';

@Injectable()
export class TroliScraper extends BaseScraper {
  readonly retailerName = 'Troli';
  private readonly logger = new Logger(TroliScraper.name);

  async scrapePromotions(): Promise<Product[]> {
    this.logger.log('Troli scraper: returning sample data');
    return this.getMockData();
  }

  async searchProduct(): Promise<Product[]> {
    return [];
  }

  private getMockData(): Product[] {
    return [
      { name: 'Grolsch Premium Pilsner', price: 10.49, originalPrice: 16.99, discountLabel: '38% Korting', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'troli-mock-grolsch', unitSize: '6 x 450 ml' },
      { name: 'Bonduelle Groene Erwten', price: 0.79, originalPrice: 1.09, discountLabel: '3 voor 1.99', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'troli-mock-erwten', unitSize: '400 g' },
      { name: 'Dr. Oetker Diepvriespizza', price: 2.99, originalPrice: 4.49, discountLabel: '2e Halve Prijs', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'troli-mock-pizza', unitSize: '350 g' },
    ];
  }
}
