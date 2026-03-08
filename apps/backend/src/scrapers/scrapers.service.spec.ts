import { Test, TestingModule } from '@nestjs/testing';
import { ScrapersService } from './scrapers.service';
import { AhScraper } from './ah.scraper';
import { TroliScraper } from './troli.scraper';
import { JumboScraper } from './jumbo.scraper';
import { LidlScraper } from './lidl.scraper';
import { PlusScraper } from './plus.scraper';
import { DirkScraper } from './dirk.scraper';
import { VomarScraper } from './vomar.scraper';
import { SparScraper } from './spar.scraper';
import { EtosScraper } from './etos.scraper';
import { ProductImagesService } from '../product-images/product-images.service';
import { Product, StockStatus } from './scraper.interface';

const MOCK_PRODUCT: Product = {
  name: 'Test Product',
  price: 1.99,
  originalPrice: 2.99,
  discountLabel: '33% Korting',
  retailer: 'Albert Heijn',
  stockStatus: StockStatus.AVAILABLE,
  externalId: 'ah-test-001',
};

function makeScraperMock(retailerName: string, products: Product[] = [MOCK_PRODUCT]) {
  return {
    retailerName,
    scrapePromotions: jest.fn().mockResolvedValue(products),
    searchProduct: jest.fn().mockResolvedValue([]),
  };
}

describe('ScrapersService', () => {
  let service: ScrapersService;
  let ahMock: ReturnType<typeof makeScraperMock>;
  let imagesMock: { replaceWithLocalImages: jest.Mock };

  beforeEach(async () => {
    ahMock = makeScraperMock('Albert Heijn', [MOCK_PRODUCT]);
    imagesMock = { replaceWithLocalImages: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScrapersService,
        { provide: AhScraper, useValue: ahMock },
        { provide: TroliScraper, useValue: makeScraperMock('Troli', []) },
        { provide: JumboScraper, useValue: makeScraperMock('Jumbo', []) },
        { provide: LidlScraper, useValue: makeScraperMock('Lidl', []) },
        { provide: PlusScraper, useValue: makeScraperMock('Plus', []) },
        { provide: DirkScraper, useValue: makeScraperMock('Dirk', []) },
        { provide: VomarScraper, useValue: makeScraperMock('Vomar', []) },
        { provide: SparScraper, useValue: makeScraperMock('Spar', []) },
        { provide: EtosScraper, useValue: makeScraperMock('Etos', []) },
        { provide: ProductImagesService, useValue: imagesMock },
      ],
    }).compile();

    service = module.get<ScrapersService>(ScrapersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('refreshAll()', () => {
    it('calls all scraper scrapePromotions methods', async () => {
      await service.refreshAll();
      expect(ahMock.scrapePromotions).toHaveBeenCalledTimes(1);
    });

    it('returns a cache keyed by retailer name', async () => {
      const result = await service.refreshAll();
      expect(result).toHaveProperty('Albert Heijn');
      expect(result['Albert Heijn']).toEqual([MOCK_PRODUCT]);
    });

    it('calls replaceWithLocalImages with all products', async () => {
      await service.refreshAll();
      expect(imagesMock.replaceWithLocalImages).toHaveBeenCalledWith([MOCK_PRODUCT]);
    });

    it('handles rejected scraper without crashing (returns empty array for that retailer)', async () => {
      ahMock.scrapePromotions.mockRejectedValue(new Error('network error'));
      const result = await service.refreshAll();
      expect(result['Albert Heijn']).toEqual([]);
    });
  });

  describe('scrapeAll()', () => {
    it('calls refreshAll when cache is empty', async () => {
      const refreshSpy = jest.spyOn(service, 'refreshAll');
      await service.scrapeAll();
      expect(refreshSpy).toHaveBeenCalledTimes(1);
    });

    it('returns cached result on second call within TTL', async () => {
      const refreshSpy = jest.spyOn(service, 'refreshAll');
      await service.scrapeAll(); // populates cache
      await service.scrapeAll(); // should hit cache
      expect(refreshSpy).toHaveBeenCalledTimes(1);
    });

    it('re-fetches when cache only contains empty arrays', async () => {
      ahMock.scrapePromotions.mockResolvedValueOnce([]);
      const refreshSpy = jest.spyOn(service, 'refreshAll');
      await service.scrapeAll(); // returns empty cache
      await service.scrapeAll(); // should not use cache (no products)
      expect(refreshSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('searchProducts()', () => {
    it('returns products matching query by name', async () => {
      await service.refreshAll();
      const results = await service.searchProducts('test');
      expect(results).toEqual([MOCK_PRODUCT]);
    });

    it('returns empty array when no match', async () => {
      await service.refreshAll();
      const results = await service.searchProducts('xyznotfound');
      expect(results).toEqual([]);
    });

    it('is case-insensitive', async () => {
      await service.refreshAll();
      const results = await service.searchProducts('TEST');
      expect(results).toEqual([MOCK_PRODUCT]);
    });
  });

  describe('getAllFlat()', () => {
    it('returns empty array before any scrape', () => {
      expect(service.getAllFlat()).toEqual([]);
    });

    it('returns all products after refresh', async () => {
      await service.refreshAll();
      expect(service.getAllFlat()).toEqual([MOCK_PRODUCT]);
    });
  });
});
