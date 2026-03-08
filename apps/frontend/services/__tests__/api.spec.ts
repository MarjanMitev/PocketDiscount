/**
 * Tests for the frontend API service layer.
 * Mocks global fetch to avoid real network calls.
 */
import { api } from '../api';

beforeEach(() => {
  jest.resetAllMocks();
});

function mockFetch(status: number, body: unknown) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response);
}

describe('api.getPromotions()', () => {
  it('calls the promotions endpoint', async () => {
    mockFetch(200, { 'Albert Heijn': [] });
    await api.getPromotions();
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('/scrapers/promotions');
  });

  it('passes cache: no-store option', async () => {
    mockFetch(200, {});
    await api.getPromotions();
    const options = (global.fetch as jest.Mock).mock.calls[0][1] as RequestInit;
    expect(options.cache).toBe('no-store');
  });

  it('returns parsed JSON on success', async () => {
    const expected = { 'Albert Heijn': [{ name: 'Melk', price: 0.99 }] };
    mockFetch(200, expected);
    const result = await api.getPromotions();
    expect(result).toEqual(expected);
  });

  it('throws with Dutch message on 404', async () => {
    mockFetch(404, {});
    await expect(api.getPromotions()).rejects.toThrow('Niet gevonden.');
  });

  it('throws with Dutch server error message on 500', async () => {
    mockFetch(500, {});
    await expect(api.getPromotions()).rejects.toThrow('Serverfout. Probeer het later opnieuw.');
  });

  it('throws server error message on 503 (>= 500)', async () => {
    mockFetch(503, {});
    await expect(api.getPromotions()).rejects.toThrow('Serverfout. Probeer het later opnieuw.');
  });

  it('throws generic fout message on 4xx other than 404', async () => {
    mockFetch(403, {});
    await expect(api.getPromotions()).rejects.toThrow('Fout 403.');
  });
});

describe('api.searchProducts()', () => {
  it('calls the search endpoint', async () => {
    mockFetch(200, []);
    await api.searchProducts('melk');
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('/scrapers/search');
  });

  it('encodes the query parameter', async () => {
    mockFetch(200, []);
    await api.searchProducts('half volle melk');
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('half%20volle%20melk');
  });
});

describe('api.getStores()', () => {
  it('calls /stores without city param when city is undefined', async () => {
    mockFetch(200, []);
    await api.getStores();
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('/stores');
    expect(url).not.toContain('city=');
  });

  it('calls /stores with city param when city is provided', async () => {
    mockFetch(200, []);
    await api.getStores('Amsterdam');
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('city=Amsterdam');
  });
});

describe('api.getNearestStores()', () => {
  it('passes lat, lng, and limit in the query string', async () => {
    mockFetch(200, []);
    await api.getNearestStores(52.37, 4.89, 5);
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('lat=52.37');
    expect(url).toContain('lng=4.89');
    expect(url).toContain('limit=5');
  });
});

describe('api.optimizeBasket()', () => {
  it('sends POST request', async () => {
    mockFetch(200, { plan: [], itemsNotFound: [], totalCost: 0, totalOriginalCost: 0, totalSavings: 0 });
    await api.optimizeBasket(['melk', 'brood']);
    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect((options as RequestInit).method).toBe('POST');
  });

  it('sends items in request body', async () => {
    mockFetch(200, { plan: [], itemsNotFound: [], totalCost: 0, totalOriginalCost: 0, totalSavings: 0 });
    await api.optimizeBasket(['melk', 'brood']);
    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse((options as RequestInit).body as string);
    expect(body.items).toEqual(['melk', 'brood']);
  });
});
