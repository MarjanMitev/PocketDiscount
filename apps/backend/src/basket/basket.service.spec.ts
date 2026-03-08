import { Test, TestingModule } from '@nestjs/testing';
import { BasketService } from './basket.service';
import { ScrapersService } from '../scrapers/scrapers.service';
import { Product, StockStatus } from '../scrapers/scraper.interface';

const makeProduct = (overrides: Partial<Product> & Pick<Product, 'name' | 'price' | 'retailer' | 'externalId'>): Product => ({
  stockStatus: StockStatus.AVAILABLE,
  ...overrides,
});

const MOCK_PRODUCTS: Product[] = [
  makeProduct({ name: 'AH Halfvolle Melk 1L', price: 0.99, originalPrice: 1.19, retailer: 'Albert Heijn', externalId: 'ah-melk' }),
  makeProduct({ name: 'Jumbo Halfvolle Melk', price: 1.05, retailer: 'Jumbo', externalId: 'ju-melk' }),
  makeProduct({ name: "Lay's Paprika Chips", price: 1.49, originalPrice: 2.29, retailer: 'Albert Heijn', externalId: 'ah-chips' }),
  makeProduct({ name: 'Heineken Bier 6-pack', price: 5.99, retailer: 'Dirk', externalId: 'dirk-bier' }),
];

describe('BasketService', () => {
  let service: BasketService;
  let scrapersService: jest.Mocked<Pick<ScrapersService, 'scrapeAll'>>;

  beforeEach(async () => {
    scrapersService = {
      scrapeAll: jest.fn().mockResolvedValue({ 'Albert Heijn': MOCK_PRODUCTS }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BasketService,
        { provide: ScrapersService, useValue: scrapersService },
      ],
    }).compile();

    service = module.get<BasketService>(BasketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('optimize()', () => {
    it('returns itemsNotFound for unmatched queries', async () => {
      const result = await service.optimize(['diamonds', 'gold']);
      expect(result.itemsNotFound).toEqual(['diamonds', 'gold']);
      expect(result.plan).toEqual([]);
      expect(result.totalCost).toBe(0);
    });

    it('returns itemsNotFound when product list is empty', async () => {
      scrapersService.scrapeAll.mockResolvedValue({});
      const result = await service.optimize(['melk']);
      expect(result.itemsNotFound).toContain('melk');
    });

    it('finds the cheapest product for a query', async () => {
      const result = await service.optimize(['melk']);
      expect(result.itemsNotFound).toHaveLength(0);
      // cheapest melk is AH at 0.99
      const ahGroup = result.plan.find((g) => g.retailer === 'Albert Heijn');
      expect(ahGroup).toBeDefined();
      expect(ahGroup!.items[0].bestMatch?.price).toBe(0.99);
    });

    it('returns allMatches sorted cheapest first', async () => {
      const result = await service.optimize(['melk']);
      const melkItem = result.plan.flatMap((g) => g.items).find((i) => i.query === 'melk');
      expect(melkItem).toBeDefined();
      const prices = melkItem!.allMatches.map((p) => p.price);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    it('computes savings correctly', async () => {
      const result = await service.optimize(['chips']);
      const chipsItem = result.plan.flatMap((g) => g.items).find((i) => i.query === 'chips');
      // originalPrice 2.29 - price 1.49 = 0.80
      expect(chipsItem?.savings).toBeCloseTo(0.80, 2);
    });

    it('computes totalCost as sum of best match prices', async () => {
      const result = await service.optimize(['melk', 'chips']);
      // cheapest melk = 0.99, cheapest chips = 1.49
      expect(result.totalCost).toBeCloseTo(0.99 + 1.49, 2);
    });

    it('computes totalSavings correctly', async () => {
      const result = await service.optimize(['melk', 'chips']);
      // melk saving: 1.19 - 0.99 = 0.20; chips saving: 2.29 - 1.49 = 0.80
      expect(result.totalSavings).toBeCloseTo(0.20 + 0.80, 2);
    });

    it('groups items by retailer of cheapest match', async () => {
      const result = await service.optimize(['melk', 'chips']);
      const ahGroup = result.plan.find((g) => g.retailer === 'Albert Heijn');
      expect(ahGroup).toBeDefined();
      expect(ahGroup!.items.length).toBeGreaterThanOrEqual(2);
    });

    it('handles empty queries array', async () => {
      const result = await service.optimize([]);
      expect(result.plan).toEqual([]);
      expect(result.itemsNotFound).toEqual([]);
      expect(result.totalCost).toBe(0);
      expect(result.totalSavings).toBe(0);
    });

    it('is case-insensitive for product matching', async () => {
      const result = await service.optimize(['MELK']);
      expect(result.itemsNotFound).toHaveLength(0);
    });
  });
});
