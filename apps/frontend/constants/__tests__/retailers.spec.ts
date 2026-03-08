import { getRetailerLabel, getRetailerColor, RETAILER_COLORS, RETAILER_SHORT_NAMES } from '../retailers';

describe('getRetailerLabel()', () => {
  it('returns short name for Albert Heijn', () => {
    expect(getRetailerLabel('Albert Heijn')).toBe('AH');
  });

  it('returns short name for Troli (Aggregated)', () => {
    expect(getRetailerLabel('Troli (Aggregated)')).toBe('Troli');
  });

  it('strips (Aggregated) suffix for unknown aggregators', () => {
    expect(getRetailerLabel('SomeStore (Aggregated)')).toBe('SomeStore');
  });

  it('returns retailer name as-is when not in short names map', () => {
    expect(getRetailerLabel('Jumbo')).toBe('Jumbo');
    expect(getRetailerLabel('Dirk')).toBe('Dirk');
    expect(getRetailerLabel('Lidl')).toBe('Lidl');
    expect(getRetailerLabel('Etos')).toBe('Etos');
  });

  it('handles unknown/new retailers gracefully', () => {
    expect(getRetailerLabel('UnknownMart')).toBe('UnknownMart');
  });
});

describe('getRetailerColor()', () => {
  it('returns AH blue for Albert Heijn', () => {
    expect(getRetailerColor('Albert Heijn', '#000')).toBe('#00AEEF');
  });

  it('returns Jumbo yellow for Jumbo', () => {
    expect(getRetailerColor('Jumbo', '#000')).toBe('#FFD700');
  });

  it('returns fallback color for unknown retailer', () => {
    const fallback = '#FF0000';
    expect(getRetailerColor('UnknownStore', fallback)).toBe(fallback);
  });

  it('returns fallback color when retailer is empty string', () => {
    const fallback = '#AABBCC';
    expect(getRetailerColor('', fallback)).toBe(fallback);
  });
});

describe('RETAILER_COLORS constant', () => {
  it('has entries for all major Dutch supermarkets', () => {
    const required = ['Albert Heijn', 'Jumbo', 'Lidl', 'Dirk', 'Plus', 'Vomar', 'Spar', 'Etos'];
    for (const r of required) {
      expect(RETAILER_COLORS).toHaveProperty(r);
    }
  });

  it('all color values start with #', () => {
    for (const color of Object.values(RETAILER_COLORS)) {
      expect(color).toMatch(/^#[0-9A-Fa-f]{3,8}$/);
    }
  });
});

describe('RETAILER_SHORT_NAMES constant', () => {
  it('maps Albert Heijn to AH', () => {
    expect(RETAILER_SHORT_NAMES['Albert Heijn']).toBe('AH');
  });
});
