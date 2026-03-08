import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StoresService } from './stores.service';
import { Store } from './store.entity';

function makeStore(overrides: Partial<Store> = {}): Store {
  return Object.assign(new Store(), {
    id: 'store-1',
    retailer: 'Albert Heijn',
    name: 'AH Amsterdam Centrum',
    address: 'Kalverstraat 1',
    city: 'Amsterdam',
    lat: 52.3702,
    lng: 4.8952,
    color: '#00AEEF',
    openingHours: '08:00-22:00',
    ...overrides,
  });
}

const STORES: Store[] = [
  makeStore({ id: '1', name: 'AH Amsterdam Centrum', lat: 52.3702, lng: 4.8952 }),
  makeStore({ id: '2', name: 'AH Rotterdam', retailer: 'Albert Heijn', city: 'Rotterdam', lat: 51.9225, lng: 4.4792 }),
  makeStore({ id: '3', name: 'Jumbo Amsterdam', retailer: 'Jumbo', color: '#FFD700', lat: 52.3740, lng: 4.9000 }),
];

describe('StoresService', () => {
  let service: StoresService;

  const mockQueryBuilder = {
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(STORES),
  };

  const mockRepo = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    find: jest.fn().mockResolvedValue(STORES),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockQueryBuilder.getMany.mockResolvedValue(STORES);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresService,
        { provide: getRepositoryToken(Store), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<StoresService>(StoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    it('returns stores mapped to StoreLocation shape', async () => {
      const results = await service.findAll();
      expect(results.length).toBe(STORES.length);
      expect(results[0]).toMatchObject({
        id: '1',
        retailer: 'Albert Heijn',
        name: 'AH Amsterdam Centrum',
        lat: 52.3702,
        lng: 4.8952,
      });
    });

    it('applies city filter when city is provided', async () => {
      await service.findAll('Amsterdam');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'LOWER(store.city) = LOWER(:city)',
        { city: 'Amsterdam' },
      );
    });

    it('does not apply where clause when city is empty', async () => {
      await service.findAll('');
      expect(mockQueryBuilder.where).not.toHaveBeenCalled();
    });

    it('does not apply where clause when city is whitespace only', async () => {
      await service.findAll('   ');
      expect(mockQueryBuilder.where).not.toHaveBeenCalled();
    });
  });

  describe('findNearest()', () => {
    it('returns stores sorted by distance ascending', async () => {
      // Amsterdam coords — store 1 (Amsterdam) should be closer than store 2 (Rotterdam)
      const results = await service.findNearest(52.3702, 4.8952, 10);
      const distances = results.map((r) => r.distance!);
      expect(distances).toEqual([...distances].sort((a, b) => a - b));
    });

    it('respects the limit parameter', async () => {
      const results = await service.findNearest(52.3702, 4.8952, 1);
      expect(results.length).toBe(1);
    });

    it('nearest store to Amsterdam coords is in Amsterdam', async () => {
      const results = await service.findNearest(52.3702, 4.8952, 3);
      expect(results[0].city).toBe('Amsterdam');
    });

    it('includes distance field on each result', async () => {
      const results = await service.findNearest(52.3702, 4.8952, 3);
      for (const r of results) {
        expect(typeof r.distance).toBe('number');
        expect(r.distance!).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
