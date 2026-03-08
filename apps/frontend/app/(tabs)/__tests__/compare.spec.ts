/**
 * Unit tests for the pure helper functions in compare.tsx.
 * No React rendering — tests normalizeName() and buildGroups() logic only.
 */

// compare.tsx imports React Native — mock it to avoid native dependencies
jest.mock('react-native', () => ({
  StyleSheet: { create: (s: unknown) => s },
  Platform: { OS: 'ios' },
  FlatList: 'FlatList',
  Pressable: 'Pressable',
  ScrollView: 'ScrollView',
  Text: 'Text',
  TextInput: 'TextInput',
  View: 'View',
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
}));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');
jest.mock('@/services/api', () => ({ api: { getPromotions: jest.fn() } }));
jest.mock('@/components/ui/AppBar', () => ({ AppBar: 'AppBar' }));
jest.mock('@/constants/retailers', () => ({
  getRetailerColor: () => '#000',
  getRetailerLabel: (r: string) => r,
}));
jest.mock('@/constants/theme', () => ({
  Colors: { light: {}, dark: {} },
  Elevation: { level1: {} },
  Radius: { full: 9999, lg: 16, sm: 8, xs: 4 },
  Spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  Typography: { bodyMedium: {}, labelMedium: {}, labelSmall: {}, titleSmall: {}, bodyLarge: {}, bodySmall: {}, titleMedium: {} },
  SCREEN_PADDING_BOTTOM: 100,
}));
jest.mock('@/hooks/use-color-scheme', () => ({ useColorScheme: () => 'light' }));

import { normalizeName, buildGroups } from '../compare';
import { PromotionsResponse } from '@/services/types';

describe('normalizeName()', () => {
  it('lowercases the name', () => {
    expect(normalizeName('HALFVOLLE MELK')).toBe('halfvolle melk');
  });

  it('strips known brand/qualifier words', () => {
    expect(normalizeName('AH Halfvolle Melk')).not.toContain('ah');
    expect(normalizeName('Biologisch Appelsap')).not.toContain('biologisch');
  });

  it('strips short words (≤2 chars)', () => {
    const result = normalizeName('AH de la Melk');
    const words = result.split(' ');
    expect(words.every((w) => w.length > 2)).toBe(true);
  });

  it('strips special characters', () => {
    expect(normalizeName("Lay's Paprika!")).not.toContain("'");
    expect(normalizeName("Lay's Paprika!")).not.toContain('!');
  });

  it('returns at most 4 meaningful words', () => {
    const result = normalizeName('AH Premium Verse Biologisch Halfvolle Magere Karnemelk Extra');
    expect(result.split(' ').length).toBeLessThanOrEqual(4);
  });

  it('"AH Halfvolle Melk" and "Jumbo Halfvolle Melk" normalize to the same key', () => {
    const ah = normalizeName('AH Halfvolle Melk');
    const jumbo = normalizeName('Jumbo Halfvolle Melk');
    expect(ah).toBe(jumbo);
  });

  it('"Lidl Verse Broodjes" and "Plus Verse Broodjes" normalize to the same key', () => {
    const lidl = normalizeName('Lidl Verse Broodjes');
    const plus = normalizeName('Plus Verse Broodjes');
    expect(lidl).toBe(plus);
  });

  it('handles empty string gracefully', () => {
    expect(() => normalizeName('')).not.toThrow();
    expect(normalizeName('')).toBe('');
  });
});

describe('buildGroups()', () => {
  const mockData: PromotionsResponse = {
    'Albert Heijn': [
      { name: 'AH Halfvolle Melk', price: 0.99, retailer: 'Albert Heijn', stockStatus: 'AVAILABLE', externalId: 'ah-melk' },
      { name: 'Coca-Cola Regular', price: 1.99, originalPrice: 2.59, discountLabel: '20% Korting', retailer: 'Albert Heijn', stockStatus: 'AVAILABLE', externalId: 'ah-coke' },
    ],
    Jumbo: [
      { name: 'Jumbo Halfvolle Melk', price: 1.05, retailer: 'Jumbo', stockStatus: 'AVAILABLE', externalId: 'ju-melk' },
      { name: 'Coca-Cola Regular 1.5L', price: 2.19, retailer: 'Jumbo', stockStatus: 'AVAILABLE', externalId: 'ju-coke' },
    ],
  };

  it('returns an empty array for empty data', () => {
    expect(buildGroups({})).toEqual([]);
  });

  it('only includes groups with 2+ retailers', () => {
    const groups = buildGroups(mockData);
    for (const g of groups) {
      expect(g.entries.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('identifies melk as a multi-retailer group', () => {
    const groups = buildGroups(mockData);
    const melkGroup = groups.find((g) => g.key.includes('halfvolle') || g.key.includes('melk'));
    expect(melkGroup).toBeDefined();
    const retailers = melkGroup!.entries.map((e) => e.retailer);
    expect(retailers).toContain('Albert Heijn');
    expect(retailers).toContain('Jumbo');
  });

  it('sets cheapest to the retailer with lowest price', () => {
    const groups = buildGroups(mockData);
    const melkGroup = groups.find((g) => g.key.includes('melk'));
    expect(melkGroup).toBeDefined();
    expect(melkGroup!.cheapest.retailer).toBe('Albert Heijn'); // 0.99 < 1.05
    expect(melkGroup!.cheapest.price).toBe(0.99);
  });

  it('computes priceDiff correctly', () => {
    const groups = buildGroups(mockData);
    const melkGroup = groups.find((g) => g.key.includes('melk'));
    expect(melkGroup!.priceDiff).toBeCloseTo(1.05 - 0.99, 2);
  });

  it('entries within a group are sorted cheapest first', () => {
    const groups = buildGroups(mockData);
    for (const g of groups) {
      const prices = g.entries.map((e) => e.price);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    }
  });

  it('groups are sorted by priceDiff descending', () => {
    const groups = buildGroups(mockData);
    const diffs = groups.map((g) => g.priceDiff);
    expect(diffs).toEqual([...diffs].sort((a, b) => b - a));
  });

  it('does not include single-retailer products', () => {
    const singleRetailerData: PromotionsResponse = {
      'Albert Heijn': [
        { name: 'AH Unique Product', price: 1.99, retailer: 'Albert Heijn', stockStatus: 'AVAILABLE', externalId: 'ah-unique' },
      ],
    };
    expect(buildGroups(singleRetailerData)).toEqual([]);
  });

  it('keeps only the cheapest entry per retailer in a group', () => {
    const duplicateData: PromotionsResponse = {
      'Albert Heijn': [
        { name: 'AH Halfvolle Melk 1L', price: 1.29, retailer: 'Albert Heijn', stockStatus: 'AVAILABLE', externalId: 'ah-melk-a' },
        { name: 'AH Halfvolle Melk', price: 0.99, retailer: 'Albert Heijn', stockStatus: 'AVAILABLE', externalId: 'ah-melk-b' },
      ],
      Jumbo: [
        { name: 'Jumbo Halfvolle Melk', price: 1.05, retailer: 'Jumbo', stockStatus: 'AVAILABLE', externalId: 'ju-melk' },
      ],
    };
    const groups = buildGroups(duplicateData);
    const melkGroup = groups.find((g) => g.key.includes('melk'));
    if (melkGroup) {
      const ahEntry = melkGroup.entries.find((e) => e.retailer === 'Albert Heijn');
      expect(ahEntry?.price).toBe(0.99); // cheapest AH melk
    }
  });
});
