/**
 * Vergelijken – cross-market price comparison.
 * Groups products by normalised name, shows cheapest per group, highlights savings.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { api } from '@/services/api';
import { PromotionsResponse } from '@/services/types';
import { Colors, Elevation, Radius, Spacing, Typography, SCREEN_PADDING_BOTTOM } from '@/constants/theme';
import { getRetailerColor, getRetailerLabel } from '@/constants/retailers';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppBar } from '@/components/ui/AppBar';

// ─── Product grouping ────────────────────────────────────────────────────────

/** Common words to strip so "AH Halfvolle Melk" and "Jumbo Halfvolle Melk" match */
export const STRIP_WORDS = new Set([
  'ah', 'jumbo', 'lidl', 'plus', 'dirk', 'vomar', 'spar', 'etos', 'troli',
  'biologisch', 'bio', 'verse', 'vers', 'extra', 'premium', 'classic', 'naturel',
  'original', 'origineel', 'groot', 'klein', 'mini', 'fresh',
]);

export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STRIP_WORDS.has(w))
    .slice(0, 4)
    .join(' ')
    .trim();
}

export interface PriceEntry {
  retailer: string;
  price: number;
  discountLabel?: string;
  originalPrice?: number;
  externalId: string;
  unitSize?: string;
  image?: string;
}

export interface CompareGroup {
  key: string;
  displayName: string;
  entries: PriceEntry[];
  cheapest: PriceEntry;
  mostExpensive: PriceEntry;
  priceDiff: number;
  savingsPct: number;
}

export function buildGroups(data: PromotionsResponse): CompareGroup[] {
  // Collect products keyed by normalized name
  const buckets = new Map<string, PriceEntry[]>();

  for (const [, products] of Object.entries(data)) {
    for (const p of products) {
      if (!p.name || p.price <= 0) continue;
      const key = normalizeName(p.name);
      if (key.length < 3) continue;
      if (!buckets.has(key)) buckets.set(key, []);
      const existing = buckets.get(key)!;
      // One entry per retailer – keep cheapest for that retailer
      const existingForRetailer = existing.find((e) => e.retailer === p.retailer);
      if (!existingForRetailer || p.price < existingForRetailer.price) {
        const filtered = existing.filter((e) => e.retailer !== p.retailer);
        filtered.push({
          retailer: p.retailer,
          price: p.price,
          discountLabel: p.discountLabel,
          originalPrice: p.originalPrice,
          externalId: p.externalId,
          unitSize: p.unitSize,
          image: p.image,
        });
        buckets.set(key, filtered);
      }
    }
  }

  // Only keep groups with 2+ retailers
  const groups: CompareGroup[] = [];
  for (const [key, entries] of buckets.entries()) {
    if (entries.length < 2) continue;
    const sorted = [...entries].sort((a, b) => a.price - b.price);
    const cheapest = sorted[0];
    const mostExpensive = sorted[sorted.length - 1];
    const priceDiff = mostExpensive.price - cheapest.price;
    const savingsPct = Math.round((priceDiff / mostExpensive.price) * 100);
    if (priceDiff < 0.01) continue; // skip identical prices
    // Best display name: longest product name among entries (usually most descriptive)
    const displayName = key;
    groups.push({ key, displayName: key, entries: sorted, cheapest, mostExpensive, priceDiff, savingsPct });
  }

  // Sort by price difference descending (biggest savings first)
  return groups.sort((a, b) => b.priceDiff - a.priceDiff);
}

// ─── Component ───────────────────────────────────────────────────────────────

function PriceRow({ entry, isCheapest, colors }: { entry: PriceEntry; isCheapest: boolean; colors: typeof Colors.light }) {
  const retailerColor = getRetailerColor(entry.retailer, colors.primary);
  return (
    <View style={[styles.priceRow, isCheapest && { backgroundColor: colors.savingsMuted, borderRadius: Radius.sm }]}>
      <View style={[styles.retailerDot, { backgroundColor: retailerColor }]} />
      <Text style={[styles.retailerName, { color: colors.onSurface }]} numberOfLines={1}>
        {getRetailerLabel(entry.retailer)}
      </Text>
      {entry.unitSize ? (
        <Text style={[styles.unitSize, { color: colors.onSurfaceVariant }]} numberOfLines={1}>{entry.unitSize}</Text>
      ) : null}
      <View style={styles.priceRowRight}>
        {entry.discountLabel ? (
          <View style={[styles.miniTag, { backgroundColor: colors.primaryContainer }]}>
            <Text style={[styles.miniTagText, { color: colors.onPrimaryContainer }]} numberOfLines={1}>
              {entry.discountLabel}
            </Text>
          </View>
        ) : null}
        <Text style={[styles.priceText, { color: isCheapest ? colors.savings : colors.onSurface }, isCheapest && styles.priceBold]}>
          €{entry.price.toFixed(2)}
        </Text>
        {isCheapest && (
          <MaterialIcons name="star" size={14} color={colors.savings} />
        )}
      </View>
    </View>
  );
}

function CompareCard({ group, colors }: { group: CompareGroup; colors: typeof Colors.light }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? group.entries : group.entries.slice(0, 3);

  return (
    <Pressable
      onPress={() => setExpanded((v) => !v)}
      style={[styles.compareCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleWrap}>
          <Text style={[styles.cardTitle, { color: colors.onSurface }]} numberOfLines={2}>
            {group.displayName.replace(/\b\w/g, (c) => c.toUpperCase())}
          </Text>
          <Text style={[styles.cardMeta, { color: colors.onSurfaceVariant }]}>
            {group.entries.length} supermarkten
          </Text>
        </View>
        <View style={styles.savingsBubble}>
          <Text style={[styles.savingsAmount, { color: colors.savings }]}>
            −€{group.priceDiff.toFixed(2)}
          </Text>
          <Text style={[styles.savingsPct, { color: colors.savings }]}>
            {group.savingsPct}% goedkoper
          </Text>
        </View>
      </View>

      {/* Price rows */}
      <View style={styles.priceList}>
        {shown.map((entry) => (
          <PriceRow
            key={entry.externalId}
            entry={entry}
            isCheapest={entry.retailer === group.cheapest.retailer}
            colors={colors}
          />
        ))}
      </View>

      {group.entries.length > 3 && (
        <View style={styles.expandRow}>
          <Text style={[styles.expandText, { color: colors.primary }]}>
            {expanded ? 'Minder tonen ▲' : `+${group.entries.length - 3} meer ▼`}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────
function StatsBar({ groups, colors }: { groups: CompareGroup[]; colors: typeof Colors.light }) {
  const avgSaving = groups.length > 0
    ? groups.reduce((s, g) => s + g.priceDiff, 0) / groups.length
    : 0;
  const topSaving = groups[0]?.priceDiff ?? 0;

  // Count cheapest wins per retailer
  const wins: Record<string, number> = {};
  for (const g of groups) {
    wins[g.cheapest.retailer] = (wins[g.cheapest.retailer] ?? 0) + 1;
  }
  const topRetailer = Object.entries(wins).sort((a, b) => b[1] - a[1])[0];

  return (
    <View style={[styles.statsBar, { backgroundColor: colors.surfaceContainer }]}>
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: colors.primary }]}>{groups.length}</Text>
        <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Matches</Text>
      </View>
      <View style={[styles.statDivider, { backgroundColor: colors.outlineVariant }]} />
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: colors.savings }]}>€{avgSaving.toFixed(2)}</Text>
        <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Gem. verschil</Text>
      </View>
      <View style={[styles.statDivider, { backgroundColor: colors.outlineVariant }]} />
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: colors.savings }]}>€{topSaving.toFixed(2)}</Text>
        <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Grootst verschil</Text>
      </View>
      {topRetailer && (
        <>
          <View style={[styles.statDivider, { backgroundColor: colors.outlineVariant }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: getRetailerColor(topRetailer[0], colors.primary) }]} numberOfLines={1}>
              {getRetailerLabel(topRetailer[0])}
            </Text>
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Meest goedkoop ({topRetailer[1]}×)</Text>
          </View>
        </>
      )}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function CompareScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const [data, setData] = useState<PromotionsResponse>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const result = await api.getPromotions();
      setData(result);
    } catch {
      setError('Kan producten niet laden.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const groups = useMemo(() => buildGroups(data), [data]);

  const filtered = useMemo(() => {
    let list = groups;
    if (onlyDiscounted) {
      list = list.filter((g) => g.entries.some((e) => e.discountLabel));
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((g) => g.displayName.includes(q));
    }
    return list;
  }, [groups, search, onlyDiscounted]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <AppBar
        title="Vergelijken"
        subtitle="Prijsvergelijking tussen supermarkten"
        backgroundColor={colors.primary}
      />

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant }]}>
        <MaterialIcons name="compare-arrows" size={20} color={colors.onSurfaceVariant} />
        <TextInput
          style={[styles.searchInput, { color: colors.onSurface }]}
          placeholder="Zoek product om te vergelijken..."
          placeholderTextColor={colors.onSurfaceVariant}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={12}>
            <MaterialIcons name="close" size={18} color={colors.onSurfaceVariant} />
          </Pressable>
        )}
      </View>

      {/* Filter toggle */}
      <View style={styles.toggleRow}>
        <Pressable
          onPress={() => setOnlyDiscounted((v) => !v)}
          style={[styles.toggleBtn, {
            backgroundColor: onlyDiscounted ? colors.savings : colors.surface,
            borderColor: onlyDiscounted ? colors.savings : colors.outlineVariant,
          }]}
        >
          <MaterialIcons name="local-offer" size={14} color={onlyDiscounted ? colors.onPrimary : colors.onSurfaceVariant} />
          <Text style={[styles.toggleText, { color: onlyDiscounted ? colors.onPrimary : colors.onSurface }]}>
            Alleen met kortingen
          </Text>
        </Pressable>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <MaterialIcons name="compare-arrows" size={40} color={colors.primary} />
          <Text style={[Typography.bodyMedium, { color: colors.onSurfaceVariant }]}>Producten vergelijken...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <MaterialIcons name="error-outline" size={48} color={colors.danger} />
          <Text style={[Typography.bodyLarge, { color: colors.danger }]}>{error}</Text>
          <Pressable style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={() => load()}>
            <Text style={[Typography.labelLarge, { color: colors.onPrimary }]}>Opnieuw</Text>
          </Pressable>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <MaterialIcons name="search-off" size={48} color={colors.onSurfaceVariant} />
          <Text style={[Typography.bodyLarge, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>
            Geen vergelijkingen gevonden
          </Text>
          <Text style={[Typography.bodySmall, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>
            {groups.length === 0
              ? 'Meer producten nodig van meerdere supermarkten.'
              : 'Probeer een andere zoekterm.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(g) => g.key}
          renderItem={({ item }) => <CompareCard group={item} colors={colors} />}
          ListHeaderComponent={
            <>
              <StatsBar groups={filtered} colors={colors} />
              <Text style={[Typography.labelMedium, { color: colors.onSurfaceVariant, marginBottom: Spacing.sm, marginTop: Spacing.md }]}>
                {filtered.length} producten gevonden in meerdere supermarkten
              </Text>
            </>
          }
          contentContainerStyle={[styles.listContent, { paddingBottom: SCREEN_PADDING_BOTTOM }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} />
          }
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: Spacing.lg, marginTop: Spacing.md,
    borderRadius: Radius.full, borderWidth: 1,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm,
  },
  searchInput: { flex: 1, ...Typography.bodyMedium, paddingVertical: 0 },
  toggleRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm, gap: Spacing.sm,
  },
  toggleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: Radius.full, borderWidth: 1.5,
  },
  toggleText: { ...Typography.labelMedium },
  statsBar: {
    flexDirection: 'row', marginHorizontal: Spacing.lg, marginTop: Spacing.sm,
    borderRadius: Radius.lg, padding: Spacing.md,
    flexWrap: 'wrap', gap: Spacing.sm,
  },
  statItem: { alignItems: 'center', flex: 1, minWidth: 70 },
  statValue: { ...Typography.titleMedium, fontSize: 15 },
  statLabel: { ...Typography.labelSmall, textAlign: 'center', marginTop: 2 },
  statDivider: { width: 1, height: 32, alignSelf: 'center' },
  listContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  compareCard: {
    borderRadius: Radius.lg, borderWidth: 1,
    marginBottom: Spacing.md, overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', padding: Spacing.md, paddingBottom: Spacing.sm,
  },
  cardTitleWrap: { flex: 1, marginRight: Spacing.md },
  cardTitle: { ...Typography.titleSmall },
  cardMeta: { ...Typography.labelSmall, marginTop: 2 },
  savingsBubble: { alignItems: 'flex-end' },
  savingsAmount: { ...Typography.titleSmall, fontWeight: '700' },
  savingsPct: { ...Typography.labelSmall, fontWeight: '600' },
  priceList: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, gap: 4 },
  priceRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 5, paddingHorizontal: Spacing.xs, gap: Spacing.sm,
  },
  retailerDot: { width: 8, height: 8, borderRadius: 4 },
  retailerName: { ...Typography.labelMedium, flex: 1 },
  unitSize: { ...Typography.labelSmall, maxWidth: 80 },
  priceRowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  miniTag: {
    paddingHorizontal: 5, paddingVertical: 1,
    borderRadius: Radius.xs,
  },
  miniTagText: { ...Typography.labelSmall, fontSize: 10 },
  priceText: { ...Typography.titleSmall },
  priceBold: { fontWeight: '700' },
  expandRow: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, alignItems: 'center' },
  expandText: { ...Typography.labelSmall },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.xxl },
  retryBtn: { paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.md, borderRadius: Radius.full },
});
