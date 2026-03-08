import { Injectable, Logger } from '@nestjs/common';
import { BaseScraper, Product, StockStatus } from './scraper.interface';

@Injectable()
export class VomarScraper extends BaseScraper {
  readonly retailerName = 'Vomar';
  private readonly logger = new Logger(VomarScraper.name);

  async scrapePromotions(): Promise<Product[]> {
    this.logger.log('Vomar scraper: returning sample data');
    return this.getMockData();
  }

  async searchProduct(): Promise<Product[]> {
    return [];
  }

  private getMockData(): Product[] {
    return [
      { name: 'Vomar Volkoren Pasta', price: 0.79, originalPrice: 1.09, discountLabel: '3 voor 2.19', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'vomar-mock-pasta', unitSize: '500 g' },
      { name: 'Amul Roomboter', price: 1.49, originalPrice: 2.09, discountLabel: 'Weekdeal', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'vomar-mock-boter', unitSize: '250 g' },
      { name: 'Vomar Sinaasappels', price: 1.99, originalPrice: 2.79, discountLabel: 'Vers & Goedkoop', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'vomar-mock-sinaas', unitSize: '1 kg' },
      { name: 'Hertog Roomijs Vanille', price: 2.49, originalPrice: 3.49, discountLabel: '1+1 Gratis', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'vomar-mock-ijs', unitSize: '900 ml' },
      { name: 'Vomar Gehakt Half-om-half', price: 2.99, originalPrice: 4.29, discountLabel: '30% Korting', retailer: this.retailerName, stockStatus: StockStatus.AVAILABLE, externalId: 'vomar-mock-gehakt', unitSize: '500 g' },
    ];
  }
}
