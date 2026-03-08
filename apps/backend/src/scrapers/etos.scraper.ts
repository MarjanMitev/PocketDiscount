import { Injectable, Logger } from '@nestjs/common';
import { BaseScraper, Product, StockStatus } from './scraper.interface';

@Injectable()
export class EtosScraper extends BaseScraper {
  readonly retailerName = 'Etos';
  private readonly logger = new Logger(EtosScraper.name);

  async scrapePromotions(): Promise<Product[]> {
    this.logger.log('Etos scraper: returning sample data');
    return this.getMockData();
  }

  async searchProduct(): Promise<Product[]> {
    return [];
  }

  private getMockData(): Product[] {
    return [
      { name: 'Etos Zonnebrand SPF50', price: 4.99, originalPrice: 7.99, discountLabel: '38% Korting', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'etos-mock-zonnebrand', unitSize: '100 ml' },
      { name: 'Head & Shoulders Shampoo', price: 3.49, originalPrice: 5.49, discountLabel: '1+1 Gratis', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'etos-mock-shampoo', unitSize: '250 ml' },
      { name: 'Oral-B Tandenborstel', price: 3.99, originalPrice: 5.99, discountLabel: 'Weekaanbieding', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'etos-mock-tandenborstel' },
      { name: 'Etos Dagcrème Normal', price: 3.29, originalPrice: 4.59, discountLabel: '2e Halve Prijs', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'etos-mock-creme', unitSize: '75 ml' },
      { name: 'Nivea Bodymilk', price: 3.99, originalPrice: 5.99, discountLabel: '33% Korting', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'etos-mock-bodymilk', unitSize: '400 ml' },
    ];
  }
}
