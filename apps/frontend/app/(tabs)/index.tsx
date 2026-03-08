import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
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
import { Product, PromotionsResponse } from '@/services/types';
import { Colors, Elevation, Radius, Spacing, Typography, SCREEN_PADDING_BOTTOM } from '@/constants/theme';
import { getRetailerColor, getRetailerLabel } from '@/constants/retailers';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppBar } from '@/components/ui/AppBar';
import { Surface } from '@/components/ui/Surface';
import SkeletonCard from '@/components/SkeletonCard';

const FILTER_ALL = 'Alle';
const FILTER_DISCOUNTS = '__discounts__';

const ProductCard = React.memo(function ProductCard({ product }: { product: Product }) {
  const [imageError, setImageError] = useState(false);
  useEffect(() => { setImageError(false); }, [product.externalId, product.image]);
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const retailerColor = getRetailerColor(product.retailer, colors.primary);
  const hasDiscount = product.originalPrice != null && product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.originalPrice!) * 100)
    : 0;
  const showPlaceholder = !product.image || imageError;

  return (
    <Surface
      elevation="level1"
      borderRadius={Radius.lg}
      padding={0}
      backgroundColor={colors.surface}
      style={[styles.card, { borderWidth: 1, borderColor: colors.outlineVariant }]}
    >
      {showPlaceholder ? (
        <View style={[styles.cardImagePlaceholder, { backgroundColor: retailerColor + '18' }]}>
          <MaterialIcons name="shopping-basket" size={32} color={retailerColor} />
        </View>
      ) : (
        <Image
          source={{ uri: product.image }}
          style={styles.cardImage}
          resizeMode="contain"
          onError={() => setImageError(true)}
        />
      )}
      <View style={styles.cardBody}>
        <Text style={[styles.cardName, { color: colors.onSurface }]} numberOfLines={2}>
          {product.name}
        </Text>
        {product.unitSize ? (
          <Text style={[styles.cardUnit, { color: colors.onSurfaceVariant }]}>{product.unitSize}</Text>
        ) : null}
        <View style={styles.cardPriceRow}>
          <Text style={[styles.cardPrice, { color: colors.primary }]}>
            €{product.price.toFixed(2)}
          </Text>
          {hasDiscount && (
            <Text style={[styles.cardOriginalPrice, { color: colors.onSurfaceVariant }]}>
              €{product.originalPrice!.toFixed(2)}
            </Text>
          )}
        </View>
        {product.discountLabel ? (
          <View style={[styles.discountBadge, { backgroundColor: colors.primaryContainer }]}>
            <Text style={[styles.discountBadgeText, { color: colors.onPrimaryContainer }]} numberOfLines={1}>
              {product.discountLabel}
            </Text>
          </View>
        ) : null}
        {hasDiscount && (
          <Text style={[styles.savingsText, { color: colors.savings }]}>
            −{discountPct}% besparing
          </Text>
        )}
      </View>
      <View style={[styles.retailerTag, { backgroundColor: retailerColor }]}>
        <Text style={styles.retailerTagText} numberOfLines={1}>
          {getRetailerLabel(product.retailer)}
        </Text>
      </View>
    </Surface>
  );
});

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  color: string;
  onColor: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
}
function FilterChip({ label, selected, onPress, color, onColor, icon }: FilterChipProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? color : colors.surface,
          borderColor: selected ? color : colors.outlineVariant,
        },
      ]}
    >
      {icon && (
        <MaterialIcons
          name={icon}
          size={13}
          color={selected ? onColor : colors.onSurfaceVariant}
          style={{ marginRight: 3 }}
        />
      )}
      <Text style={[styles.chipText, { color: selected ? onColor : colors.onSurface }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const [data, setData] = useState<PromotionsResponse>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeRetailer, setActiveRetailer] = useState(FILTER_ALL);
  const [onlyDiscounts, setOnlyDiscounts] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const result = await api.getPromotions();
      setData(result);
    } catch {
      setError('Kan aanbiedingen niet laden. Controleer of de server actief is.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const retailers = useMemo(() => [FILTER_ALL, ...Object.keys(data)], [data]);

  const allProducts = useMemo(() => {
    return Object.entries(data)
      .filter(([retailer]) => activeRetailer === FILTER_ALL || retailer === activeRetailer)
      .flatMap(([, products]) => products)
      .filter((p) => {
        if (onlyDiscounts && !p.discountLabel && !(p.originalPrice && p.originalPrice > p.price)) return false;
        if (search.trim()) return p.name.toLowerCase().includes(search.toLowerCase().trim());
        return true;
      });
  }, [data, activeRetailer, onlyDiscounts, search]);

  const discountCount = useMemo(() =>
    Object.values(data).flat().filter((p) => p.discountLabel || (p.originalPrice && p.originalPrice > p.price)).length,
    [data]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <AppBar
        title="PocketDiscount"
        subtitle="Beste aanbiedingen van 9 supermarkten"
        backgroundColor={colors.primary}
      />

      {/* Search bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant }]}>
        <MaterialIcons name="search" size={20} color={colors.onSurfaceVariant} />
        <TextInput
          style={[styles.searchInput, { color: colors.onSurface }]}
          placeholder="Zoek producten..."
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

      {/* Filter bar — ScrollView avoids FlatList height measurement issues */}
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
          style={styles.filterScroll}
        >
          {/* Discount-only toggle */}
          <FilterChip
            label={`Kortingen${discountCount > 0 ? ` (${discountCount})` : ''}`}
            selected={onlyDiscounts}
            onPress={() => setOnlyDiscounts((v) => !v)}
            color={colors.savings}
            onColor={colors.onPrimary}
            icon="local-offer"
          />
          <View style={styles.filterDivider} />
          {/* Retailer filters */}
          {retailers.map((r) => (
            <FilterChip
              key={r}
              label={r === FILTER_ALL ? 'Alle' : getRetailerLabel(r)}
              selected={activeRetailer === r}
              onPress={() => setActiveRetailer(r)}
              color={colors.primary}
              onColor={colors.onPrimary}
            />
          ))}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <View style={styles.gridWrap}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} height={220} borderRadius={Radius.lg} style={styles.skeletonCard} />
          ))}
        </View>
      ) : error ? (
        <View style={styles.center}>
          <MaterialIcons name="error-outline" size={48} color={colors.danger} />
          <Text style={[Typography.bodyLarge, { color: colors.danger, textAlign: 'center' }]}>{error}</Text>
          <Pressable style={[styles.retryBtn, { backgroundColor: colors.primary }, Elevation.level1]} onPress={() => load()}>
            <Text style={[Typography.labelLarge, { color: colors.onPrimary }]}>Opnieuw proberen</Text>
          </Pressable>
        </View>
      ) : allProducts.length === 0 ? (
        <View style={styles.center}>
          <MaterialIcons name="search-off" size={48} color={colors.onSurfaceVariant} />
          <Text style={[Typography.bodyLarge, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>
            Geen producten gevonden
          </Text>
          <Text style={[Typography.bodySmall, { color: colors.onSurfaceVariant, textAlign: 'center', marginTop: Spacing.xs }]}>
            {Object.keys(data).length === 0
              ? 'Zorg dat de backend draait op http://localhost:3000 en tik op Vernieuwen.'
              : 'Probeer een andere filter of zoekterm.'}
          </Text>
          <Pressable style={[styles.retryBtn, { backgroundColor: colors.primary }, Elevation.level1]} onPress={() => load(true)}>
            <Text style={[Typography.labelLarge, { color: colors.onPrimary }]}>Vernieuwen</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={allProducts}
          keyExtractor={(item, idx) => `${item.externalId}-${idx}`}
          renderItem={({ item }) => <ProductCard product={item} />}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[styles.listContent, { paddingBottom: SCREEN_PADDING_BOTTOM }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} />
          }
          ListHeaderComponent={
            <Text style={[Typography.labelMedium, { color: colors.onSurfaceVariant, marginBottom: Spacing.sm }]}>
              {allProducts.length} product{allProducts.length !== 1 ? 'en' : ''}
              {onlyDiscounts ? ' met korting' : ''}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  searchInput: { flex: 1, ...Typography.bodyMedium, paddingVertical: 0 },
  filterBar: { height: 52, justifyContent: 'center' },
  filterScroll: { flexGrow: 0 },
  filterContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    alignItems: 'center',
    flexDirection: 'row',
  },
  filterDivider: { width: 1, height: 20, backgroundColor: '#E2E8F0', marginHorizontal: Spacing.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
  chipText: { ...Typography.labelMedium },
  listContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  row: { gap: Spacing.md, marginBottom: Spacing.md },
  card: { flex: 1 },
  cardImage: { width: '100%', height: 110, backgroundColor: '#f8fafc' },
  cardImagePlaceholder: { width: '100%', height: 110, alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: Spacing.md, gap: 4 },
  cardName: { ...Typography.titleSmall, lineHeight: 18 },
  cardUnit: { ...Typography.labelSmall },
  cardPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  cardPrice: { ...Typography.titleMedium, fontSize: 16 },
  cardOriginalPrice: { ...Typography.bodySmall, textDecorationLine: 'line-through' },
  discountBadge: { alignSelf: 'flex-start', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.sm, marginTop: 2 },
  discountBadgeText: { ...Typography.labelSmall },
  savingsText: { ...Typography.labelSmall, fontWeight: '600' },
  retailerTag: { paddingHorizontal: Spacing.sm, paddingVertical: 4, alignItems: 'center' },
  retailerTagText: { color: '#fff', ...Typography.labelSmall, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.xxl },
  retryBtn: { paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.md, borderRadius: Radius.full },
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, gap: Spacing.md, paddingTop: Spacing.md },
  skeletonCard: { width: '47%' },
});
