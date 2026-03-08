import { BasketResult, PromotionsResponse, Product, StoreLocation } from './types';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

function getErrorMessage(res: Response): string {
  if (res.status === 404) return 'Niet gevonden.';
  if (res.status >= 500) return 'Serverfout. Probeer het later opnieuw.';
  if (res.status === 0 || res.status === 408) return 'Geen verbinding. Controleer je netwerk.';
  return `Fout ${res.status}.`;
}

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { signal, cache: 'no-store' });
  if (!res.ok) throw new Error(getErrorMessage(res));
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) throw new Error(getErrorMessage(res));
  return res.json() as Promise<T>;
}

export const api = {
  getPromotions: () => get<PromotionsResponse>('/scrapers/promotions'),
  searchProducts: (q: string) => get<Product[]>(`/scrapers/search?q=${encodeURIComponent(q)}`),
  getStores: (city?: string) =>
    get<StoreLocation[]>(city ? `/stores?city=${encodeURIComponent(city)}` : '/stores'),
  getNearestStores: (lat: number, lng: number, limit = 15) =>
    get<StoreLocation[]>(`/stores/nearest?lat=${lat}&lng=${lng}&limit=${limit}`),
  optimizeBasket: (items: string[]) =>
    post<BasketResult>('/basket/optimize', { items }),

  /** Receipt OCR: send base64 image, get extracted text (Dutch + English). */
  receiptOcr: (imageBase64: string) =>
    post<{ text: string; confidence?: number }>('/receipts/ocr', { imageBase64 }),
};
