import { Test, TestingModule } from '@nestjs/testing';
import { AhScraper } from './ah.scraper';
import { StockStatus } from './scraper.interface';

describe('AhScraper', () => {
  let scraper: AhScraper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AhScraper],
    }).compile();

    scraper = module.get<AhScraper>(AhScraper);
  });

  it('should be defined', () => {
    expect(scraper).toBeDefined();
  });

  it('retailerName is "Albert Heijn"', () => {
    expect(scraper.retailerName).toBe('Albert Heijn');
  });

  describe('scrapePromotions() — API failure fallback', () => {
    it('returns mock data when AH auth API call fails (network error)', async () => {
      // Patch global fetch to reject
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValue(new Error('Network unreachable'));

      const products = await scraper.scrapePromotions();

      global.fetch = originalFetch;

      expect(products.length).toBeGreaterThan(0);
      expect(products.every((p) => p.retailer === 'Albert Heijn')).toBe(true);
    });

    it('returns mock data when AH API responds with HTTP 500', async () => {
      const originalFetch = global.fetch;
      global.fetch = jest.fn()
        // auth call succeeds
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'fake-token', expires_in: 3600 }),
        } as Response)
        // all product search calls return 500
        .mockResolvedValue({ ok: false, status: 500 } as Response);

      const products = await scraper.scrapePromotions();

      global.fetch = originalFetch;

      expect(products.length).toBeGreaterThan(0);
      expect(products.every((p) => p.retailer === 'Albert Heijn')).toBe(true);
    });
  });

  describe('mock data shape', () => {
    it('mock products have required Product fields', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('force mock'));
      const products = await scraper.scrapePromotions();
      global.fetch = jest.fn();

      for (const p of products) {
        expect(p).toHaveProperty('name');
        expect(p).toHaveProperty('price');
        expect(p).toHaveProperty('retailer');
        expect(p).toHaveProperty('stockStatus');
        expect(p).toHaveProperty('externalId');
        expect(typeof p.price).toBe('number');
        expect(p.price).toBeGreaterThanOrEqual(0);
      }
    });

    it('mock product externalIds are unique', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('force mock'));
      const products = await scraper.scrapePromotions();
      global.fetch = jest.fn();

      const ids = products.map((p) => p.externalId);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('mapProduct() via API success', () => {
    it('maps AH API response to Product correctly', async () => {
      const originalFetch = global.fetch;
      global.fetch = jest.fn()
        // auth
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'tok', expires_in: 3600 }),
        } as Response)
        // bonus fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            products: [
              {
                webshopId: 12345,
                title: 'AH Halfvolle Melk',
                salesUnitSize: '1 L',
                priceBeforeBonus: 0.99,
                bonusMechanism: 'Prijsfavoriet',
                isBonus: true,
                images: [{ url: 'https://static.ah.nl/dam/product/test.jpg', width: 800 }],
                orderAvailabilityStatus: 'IN_ASSORTMENT',
                mainCategory: 'Zuivel & Eieren',
              },
            ],
          }),
        } as Response)
        // all remaining category fetches return empty
        .mockResolvedValue({
          ok: true,
          json: async () => ({ products: [] }),
        } as Response);

      const products = await scraper.scrapePromotions();
      global.fetch = originalFetch;

      const melk = products.find((p) => p.name === 'AH Halfvolle Melk');
      expect(melk).toBeDefined();
      expect(melk!.price).toBe(0.99);
      expect(melk!.discountLabel).toBe('Prijsfavoriet');
      expect(melk!.externalId).toBe('ah-12345');
      expect(melk!.unitSize).toBe('1 L');
      expect(melk!.stockStatus).toBe(StockStatus.AVAILABLE);
      expect(melk!.image).toBe('https://static.ah.nl/dam/product/test.jpg');
    });
  });

  describe('searchProduct()', () => {
    it('returns empty array on fetch error', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('fail'));
      const results = await scraper.searchProduct('melk');
      global.fetch = jest.fn();
      expect(results).toEqual([]);
    });
  });
});
