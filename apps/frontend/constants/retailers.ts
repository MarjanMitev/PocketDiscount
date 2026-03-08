/**
 * Single source of truth for retailer branding.
 * Used across Deals, Map, and Basket for consistent colors and labels.
 */
export const RETAILER_COLORS: Record<string, string> = {
  'Albert Heijn': '#00AEEF',
  'Jumbo': '#FFD700',
  'Lidl': '#0050AA',
  'Aldi': '#1F5CA9',
  'Dirk': '#E30613',
  'Plus': '#FF6600',
  'Vomar': '#E2001A',
  'Spar': '#007A3D',
  'Etos': '#005BAA',
  'Troli (Aggregated)': '#6B7280',
  'Troli': '#6B7280',
};

export const RETAILER_SHORT_NAMES: Record<string, string> = {
  'Albert Heijn': 'AH',
  'Troli (Aggregated)': 'Troli',
};

export function getRetailerLabel(retailer: string): string {
  return RETAILER_SHORT_NAMES[retailer] ?? retailer.replace(' (Aggregated)', '');
}

export function getRetailerColor(retailer: string, fallback: string): string {
  return RETAILER_COLORS[retailer] ?? fallback;
}
