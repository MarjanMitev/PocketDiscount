import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { api } from '@/services/api';
import { BasketResult, StoreGroup } from '@/services/types';
import { Colors, Elevation, Radius, Spacing, Typography, SCREEN_PADDING_BOTTOM } from '@/constants/theme';
import { getRetailerLabel } from '@/constants/retailers';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AnimatedPressable from '@/components/AnimatedPressable';
import { AppBar } from '@/components/ui/AppBar';
import { Surface } from '@/components/ui/Surface';

function StoreGroupCard({
  group,
  colors,
  index,
}: {
  group: StoreGroup;
  colors: typeof Colors.light;
  index: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
      <Surface
        elevation="level1"
        borderRadius={Radius.xl}
        padding={0}
        backgroundColor={colors.surface}
        style={[styles.storeCard, { borderWidth: 1, borderColor: colors.outlineVariant }]}
      >
        <View style={[styles.storeHeader, { backgroundColor: group.color }]}>
          <Text style={styles.storeName}>{getRetailerLabel(group.retailer)}</Text>
          <View style={styles.storeSubtotalBadge}>
            <Text style={styles.storeSubtotal}>€{group.subtotal.toFixed(2)}</Text>
          </View>
        </View>
        <View style={styles.itemsList}>
          {group.items.map((item, idx) => (
            <View
              key={idx}
              style={[
                styles.itemRow,
                { borderBottomColor: colors.outlineVariant },
                idx < group.items.length - 1 && styles.itemRowBorder,
              ]}
            >
              <View style={styles.itemLeft}>
                <Text style={[styles.itemQuery, { color: colors.onSurface }]}>{item.query}</Text>
                {item.bestMatch && (
                  <Text style={[styles.itemMatch, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
                    {item.bestMatch.name}
                  </Text>
                )}
              </View>
              <View style={styles.itemRight}>
                {item.bestMatch && (
                  <>
                    <Text style={[styles.itemPrice, { color: colors.primary }]}>
                      €{item.bestMatch.price.toFixed(2)}
                    </Text>
                    {item.savings > 0 && (
                      <View style={[styles.itemSavingsBadge, { backgroundColor: colors.primaryContainer }]}>
                        <Text style={[styles.itemSavings, { color: colors.primary }]}>
                          −€{item.savings.toFixed(2)}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>
          ))}
        </View>
      </Surface>
    </Animated.View>
  );
}

export default function BasketScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BasketResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOptimize = async () => {
    const items = input.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    if (items.length === 0) return;
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      const res = await api.optimizeBasket(items);
      setResult(res);
    } catch {
      setError('Optimalisatie mislukt. Controleer of de server actief is.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInput('');
    setResult(null);
    setError(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <AppBar
        title="Mandje optimaliseren"
        subtitle="Vind de goedkoopste combinatie van winkels"
        backgroundColor={colors.primary}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: SCREEN_PADDING_BOTTOM }]}
        keyboardShouldPersistTaps="handled"
      >
        <Surface
          elevation="level1"
          backgroundColor={colors.surface}
          style={[styles.inputCard, { borderWidth: 1, borderColor: colors.outlineVariant }]}
        >
          <View style={styles.inputHeader}>
            <MaterialIcons name="list-alt" size={22} color={colors.primary} />
            <Text style={[styles.inputLabel, { color: colors.onSurface }]}>Boodschappenlijst</Text>
          </View>
          <Text style={[styles.inputHint, { color: colors.onSurfaceVariant }]}>Eén product per regel</Text>
          <TextInput
            style={[
              styles.textArea,
              { color: colors.onSurface, backgroundColor: colors.surfaceContainer, borderColor: colors.outline },
            ]}
            placeholder={'bijv.\nmelk\nbrood\ncola\nbier\nkaas'}
            placeholderTextColor={colors.onSurfaceVariant}
            multiline
            numberOfLines={8}
            value={input}
            onChangeText={setInput}
            textAlignVertical="top"
          />
          <View style={styles.inputActions}>
            <AnimatedPressable onPress={handleClear}>
              <View style={[styles.clearBtn, { borderColor: colors.outline }]}>
                <Text style={[styles.clearBtnText, { color: colors.onSurfaceVariant }]}>Wissen</Text>
              </View>
            </AnimatedPressable>
            <AnimatedPressable onPress={handleOptimize}>
              <View style={[styles.optimizeBtn, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }, Elevation.level1]}>
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <MaterialIcons name="auto-awesome" size={20} color="#fff" />
                    <Text style={styles.optimizeBtnText}>Optimaliseer</Text>
                  </>
                )}
              </View>
            </AnimatedPressable>
          </View>
        </Surface>

        {error && (
          <Animated.View entering={FadeInUp.springify()}>
            <Surface
              elevation="level0"
              backgroundColor={colors.dangerContainer}
              style={[styles.errorCard, { borderWidth: 1, borderColor: colors.danger }]}
            >
              <MaterialIcons name="warning-amber" size={20} color={colors.danger} />
              <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            </Surface>
          </Animated.View>
        )}

        {result && (
          <>
            <Animated.View entering={FadeInUp.springify()}>
              <Surface
                elevation="level2"
                backgroundColor={colors.primary}
                style={styles.summaryCard}
              >
                <View style={styles.summaryHeader}>
                  <MaterialIcons name="savings" size={24} color={colors.onPrimary} />
                  <Text style={styles.summaryTitle}>Jouw besparingsplan</Text>
                </View>
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>€{result.totalCost.toFixed(2)}</Text>
                    <Text style={styles.summaryLabel}>Totale kosten</Text>
                  </View>
                  {result.totalSavings > 0 && (
                    <View style={styles.summaryItem}>
                      <Text style={[styles.summaryValue, { color: 'rgba(255,255,255,0.95)' }]}>
                        −€{result.totalSavings.toFixed(2)}
                      </Text>
                      <Text style={styles.summaryLabel}>Besparing</Text>
                    </View>
                  )}
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{result.plan.length}</Text>
                    <Text style={styles.summaryLabel}>Winkels</Text>
                  </View>
                </View>
              </Surface>
            </Animated.View>

            {result.plan.map((group, idx) => (
              <StoreGroupCard key={idx} group={group} colors={colors} index={idx} />
            ))}

            {result.itemsNotFound.length > 0 && (
              <Animated.View entering={FadeInDown.delay(result.plan.length * 100).springify()}>
                <Surface
                  elevation="level1"
                  backgroundColor={colors.surface}
                  style={[styles.notFoundCard, { borderWidth: 1, borderColor: colors.warning }]}
                >
                  <View style={styles.notFoundHeader}>
                    <MaterialIcons name="warning-amber" size={20} color={colors.warning} />
                    <Text style={[styles.notFoundTitle, { color: colors.warning }]}>
                      Niet gevonden ({result.itemsNotFound.length})
                    </Text>
                  </View>
                  <View style={styles.notFoundList}>
                    {result.itemsNotFound.map((item, idx) => (
                      <View key={idx} style={[styles.notFoundItem, { backgroundColor: colors.warningContainer }]}>
                        <Text style={[styles.notFoundItemText, { color: colors.warning }]}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </Surface>
              </Animated.View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: Spacing.lg, gap: Spacing.lg },
  inputCard: { borderRadius: Radius.xl, padding: Spacing.lg, gap: Spacing.md },
  inputHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  inputLabel: { ...Typography.titleLarge },
  inputHint: { ...Typography.bodySmall, marginTop: -Spacing.sm },
  textArea: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    padding: Spacing.md,
    ...Typography.bodyLarge,
    minHeight: 150,
  },
  inputActions: { flexDirection: 'row', gap: Spacing.md },
  clearBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  clearBtnText: { ...Typography.labelLarge },
  optimizeBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: 48,
  },
  optimizeBtnText: { color: '#fff', ...Typography.labelLarge, fontWeight: '700' },
  errorCard: { borderRadius: Radius.lg, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  errorText: { flex: 1, ...Typography.bodyMedium, fontWeight: '600' },
  summaryCard: { borderRadius: Radius.xl, padding: Spacing.xl, gap: Spacing.lg },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  summaryTitle: { color: '#fff', ...Typography.titleLarge, fontWeight: '800' },
  summaryGrid: { flexDirection: 'row', gap: Spacing.md },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  summaryValue: { color: '#fff', ...Typography.titleMedium, fontSize: 18, fontWeight: '800' },
  summaryLabel: { color: 'rgba(255,255,255,0.85)', ...Typography.labelSmall, marginTop: 2, textAlign: 'center' },
  storeCard: { overflow: 'hidden' },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  storeName: { color: '#fff', ...Typography.titleMedium, fontWeight: '700' },
  storeSubtotalBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  storeSubtotal: { color: '#fff', ...Typography.titleMedium, fontWeight: '800' },
  itemsList: { padding: Spacing.lg, gap: Spacing.md },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: Spacing.md },
  itemRowBorder: { borderBottomWidth: 1 },
  itemLeft: { flex: 1, gap: Spacing.xs },
  itemQuery: { ...Typography.bodyMedium, fontWeight: '600' },
  itemMatch: { ...Typography.bodySmall },
  itemRight: { alignItems: 'flex-end', gap: Spacing.xs },
  itemPrice: { ...Typography.titleSmall, fontWeight: '700' },
  itemSavingsBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.sm },
  itemSavings: { ...Typography.labelSmall, fontWeight: '700' },
  notFoundCard: { borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.md },
  notFoundHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  notFoundTitle: { ...Typography.labelLarge, fontWeight: '700' },
  notFoundList: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  notFoundItem: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2, borderRadius: Radius.full },
  notFoundItemText: { ...Typography.labelMedium, fontWeight: '600' },
});
