import { Controller, Get, Query } from '@nestjs/common';
import { ScrapersService } from './scrapers.service';

@Controller('scrapers')
export class ScrapersController {
  constructor(private readonly scrapersService: ScrapersService) {}

  @Get('promotions')
  async getPromotions() {
    return this.scrapersService.scrapeAll();
  }

  @Get('search')
  async search(@Query('q') q: string) {
    if (!q) return [];
    return this.scrapersService.searchProducts(q);
  }

  @Get('refresh')
  async refresh() {
    return this.scrapersService.refreshAll();
  }
}
