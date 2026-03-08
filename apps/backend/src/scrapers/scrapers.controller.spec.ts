import { Test, TestingModule } from '@nestjs/testing';
import { ScrapersController } from './scrapers.controller';
import { ScrapersService } from './scrapers.service';
import { Product, StockStatus } from './scraper.interface';

const MOCK_CACHE: Record<string, Product[]> = {
  'Albert Heijn': [
    {
      name: 'Melk',
      price: 0.99,
      retailer: 'Albert Heijn',
      stockStatus: StockStatus.AVAILABLE,
      externalId: 'ah-001',
    },
  ],
  Jumbo: [],
};

describe('ScrapersController', () => {
  let controller: ScrapersController;
  let service: jest.Mocked<ScrapersService>;

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<ScrapersService>> = {
      scrapeAll: jest.fn().mockResolvedValue(MOCK_CACHE),
      searchProducts: jest.fn().mockResolvedValue([]),
      refreshAll: jest.fn().mockResolvedValue(MOCK_CACHE),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScrapersController],
      providers: [{ provide: ScrapersService, useValue: serviceMock }],
    }).compile();

    controller = module.get<ScrapersController>(ScrapersController);
    service = module.get(ScrapersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPromotions()', () => {
    it('delegates to scrapersService.scrapeAll()', async () => {
      const result = await controller.getPromotions();
      expect(service.scrapeAll).toHaveBeenCalledTimes(1);
      expect(result).toBe(MOCK_CACHE);
    });
  });

  describe('search()', () => {
    it('returns empty array when q is undefined', async () => {
      const result = await controller.search(undefined as unknown as string);
      expect(result).toEqual([]);
      expect(service.searchProducts).not.toHaveBeenCalled();
    });

    it('returns empty array when q is empty string', async () => {
      const result = await controller.search('');
      expect(result).toEqual([]);
      expect(service.searchProducts).not.toHaveBeenCalled();
    });

    it('delegates to searchProducts when q is provided', async () => {
      service.searchProducts.mockResolvedValue(MOCK_CACHE['Albert Heijn']);
      const result = await controller.search('melk');
      expect(service.searchProducts).toHaveBeenCalledWith('melk');
      expect(result).toEqual(MOCK_CACHE['Albert Heijn']);
    });
  });

  describe('refresh()', () => {
    it('delegates to scrapersService.refreshAll()', async () => {
      const result = await controller.refresh();
      expect(service.refreshAll).toHaveBeenCalledTimes(1);
      expect(result).toBe(MOCK_CACHE);
    });
  });
});
