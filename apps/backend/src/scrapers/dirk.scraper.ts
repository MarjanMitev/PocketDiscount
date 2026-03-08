import { Injectable, Logger } from '@nestjs/common';
import { BaseScraper, Product, StockStatus } from './scraper.interface';

@Injectable()
export class DirkScraper extends BaseScraper {
  readonly retailerName = 'Dirk';
  private readonly logger = new Logger(DirkScraper.name);

  async scrapePromotions(): Promise<Product[]> {
    this.logger.log('Dirk scraper: returning sample data');
    return this.getMockData();
  }

  async searchProduct(): Promise<Product[]> {
    return [];
  }

  private getMockData(): Product[] {
    return [
      { name: 'Dirk Goedkoop Brood Wit', price: 0.79, originalPrice: 1.09, discountLabel: 'Prijsknaller', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'dirk-mock-brood', unitSize: '800 g' },
      { name: 'Fristi Drinkfles', price: 0.49, originalPrice: 0.69, discountLabel: '6 voor 2.69', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'dirk-mock-fristi', unitSize: '200 ml' },
      { name: 'Dirk Varkensschnitzel', price: 2.99, originalPrice: 4.49, discountLabel: '33% Korting', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'dirk-mock-schnitzel', unitSize: '400 g' },
      { name: 'Spa Rood Bruisend Water', price: 0.49, originalPrice: 0.79, discountLabel: '2 voor 0.89', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'dirk-mock-spa', unitSize: '1.5 L' },
      { name: 'Conimex Bami Goreng Mix', price: 0.59, originalPrice: 0.89, discountLabel: 'Aanbod', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'dirk-mock-bami', unitSize: '40 g' },
      { name: 'Calvé Mayonaise', price: 1.49, originalPrice: 2.29, discountLabel: 'Superkorting', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'dirk-mock-mayo', unitSize: '300 ml' },
    ];
  }
}
