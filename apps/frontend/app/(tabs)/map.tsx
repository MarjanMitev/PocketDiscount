import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Location from 'expo-location';
import { api } from '@/services/api';
import { StoreLocation } from '@/services/types';
import { Colors, Elevation, Radius, Spacing, Typography, SCREEN_PADDING_BOTTOM } from '@/constants/theme';
import { getRetailerLabel } from '@/constants/retailers';
import { useColorScheme } from '@/hooks/use-color-scheme';
import StoreMapView from '@/components/StoreMapView';
import AnimatedPressable from '@/components/AnimatedPressable';
import { AppBar } from '@/components/ui/AppBar';
import { Chip } from '@/components/ui/Chip';
import { Surface } from '@/components/ui/Surface';

const ALL_RETAILERS = 'Alle';

function StoreCard({
  store,
  colors,
  onNavigate,
  index,
}: {
  store: StoreLocation & { distance?: number };
  colors: typeof Colors.light;
  onNavigate: (store: StoreLocation) => void;
  index: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <Surface
        elevation="level1"
        borderRadius={Radius.xl}
        padding={0}
        backgroundColor={colors.surface}
        style={[styles.storeCard, { borderWidth: 1, borderColor: colors.outlineVariant }]}
      >
        <View style={[styles.storeColorBar, { backgroundColor: store.color }]} />
        <View style={styles.storeCardBody}>
          <View style={styles.storeCardTop}>
            <View style={styles.storeCardInfo}>
              <Text style={[styles.storeCardName, { color: colors.onSurface }]} numberOfLines={1}>
                {store.name}
              </Text>
              <Text style={[styles.storeCardAddress, { color: colors.onSurfaceVariant }]}>
                {store.address}, {store.city}
              </Text>
              {store.openingHours && (
                <View style={[styles.hoursRow, { backgroundColor: colors.primaryContainer }]}>
                  <MaterialIcons name="schedule" size={14} color={colors.primary} />
                  <Text style={[styles.storeCardHours, { color: colors.primary }]}>
                    {store.openingHours}
                  </Text>
                </View>
              )}
            </View>
            {store.distance !== undefined && (
              <View style={[styles.distanceBadge, { backgroundColor: colors.primary }, Elevation.level0]}>
                <Text style={styles.distanceText}>
                  {store.distance < 1
                    ? `${Math.round(store.distance * 1000)} m`
                    : `${store.distance.toFixed(1)} km`}
                </Text>
              </View>
            )}
          </View>
          <AnimatedPressable onPress={() => onNavigate(store)}>
            <View style={[styles.navBtn, { backgroundColor: colors.primary }, Elevation.level1]}>
              <MaterialIcons name="directions" size={20} color={colors.onPrimary} />
              <Text style={[styles.navBtnText, { color: colors.onPrimary }]}>Navigeer</Text>
            </View>
          </AnimatedPressable>
        </View>
      </Surface>
    </Animated.View>
  );
}

export default function MapScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationGranted, setLocationGranted] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activeFilter, setActiveFilter] = useState(ALL_RETAILERS);

  const requestLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationGranted(true);
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const lat = loc.coords.latitude;
        const lng = loc.coords.longitude;
        setUserLocation({ lat, lng });
        const nearby = await api.getNearestStores(lat, lng, 20);
        setStores(nearby);
      } else {
        const allStores = await api.getStores();
        setStores(allStores);
      }
    } catch {
      const allStores = await api.getStores();
      setStores(allStores);
    }
  }, []);

  const loadStores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await requestLocation();
    } catch {
      setError('Kan winkels niet laden. Controleer of de server actief is.');
    } finally {
      setLoading(false);
    }
  }, [requestLocation]);

  useEffect(() => { loadStores(); }, [loadStores]);

  const handleNavigate = (store: StoreLocation) => {
    const url = Platform.select({
      ios: `maps://app?daddr=${store.lat},${store.lng}&q=${encodeURIComponent(store.name)}`,
      android: `geo:${store.lat},${store.lng}?q=${encodeURIComponent(store.name)}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`,
    });
    if (url) Linking.openURL(url);
  };

  const retailers = [ALL_RETAILERS, ...Array.from(new Set(stores.map((s) => s.retailer))).sort()];
  const filteredStores =
    activeFilter === ALL_RETAILERS ? stores : stores.filter((s) => s.retailer === activeFilter);

  const mapCenter = userLocation
    ? { latitude: userLocation.lat, longitude: userLocation.lng }
    : { latitude: 52.3676, longitude: 4.9041 };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <AppBar
        title="Winkels in de buurt"
        subtitle={
          locationGranted ? 'Dichtste winkels op afstand' : 'Winkels in Nederland'
        }
        backgroundColor={colors.primary}
      />

      {!loading && stores.length > 0 && (
        <View style={[styles.mapContainer, Elevation.level2]}>
          <StoreMapView
            filteredStores={filteredStores}
            locationGranted={locationGranted}
            center={mapCenter}
            onNavigate={handleNavigate}
          />
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {retailers.map((r) => (
          <Chip
            key={r}
            label={r === ALL_RETAILERS ? 'Alle' : getRetailerLabel(r)}
            selected={activeFilter === r}
            onPress={() => setActiveFilter(r)}
            selectedBackgroundColor={colors.primary}
            selectedTextColor={colors.onPrimary}
            unselectedBackgroundColor={colors.surface}
            unselectedTextColor={colors.onSurface}
            borderColor={activeFilter === r ? colors.primary : colors.outline}
            style={styles.chipWrap}
          />
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[Typography.bodyMedium, { color: colors.onSurfaceVariant }]}>
            Winkels laden...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <MaterialIcons name="location-off" size={48} color={colors.danger} />
          <Text style={[Typography.titleLarge, { color: colors.onSurface }]}>Oeps!</Text>
          <Text style={[Typography.bodyMedium, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>
            {error}
          </Text>
          <AnimatedPressable onPress={loadStores}>
            <View style={[styles.retryBtn, { backgroundColor: colors.primary }, Elevation.level1]}>
              <Text style={[Typography.labelLarge, { color: colors.onPrimary }]}>Opnieuw</Text>
            </View>
          </AnimatedPressable>
        </View>
      ) : (
        <FlatList
          data={filteredStores}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <StoreCard store={item} colors={colors} onNavigate={handleNavigate} index={index} />
          )}
          contentContainerStyle={[styles.listContent, { paddingBottom: SCREEN_PADDING_BOTTOM }]}
          ListHeaderComponent={
            <Text style={[Typography.labelMedium, { color: colors.onSurfaceVariant }]}>
              {filteredStores.length} winkel{filteredStores.length !== 1 ? 's' : ''}
              {locationGranted ? ' in de buurt' : ''}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: {
    marginHorizontal: Spacing.lg,
    marginTop: -Spacing.lg,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    height: 200,
  },
  filterScroll: { marginTop: Spacing.md },
  filterContent: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  listContent: { padding: Spacing.lg, gap: Spacing.md },
  storeCard: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  storeColorBar: { width: 5 },
  storeCardBody: { flex: 1, padding: Spacing.lg, gap: Spacing.lg },
  storeCardTop: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  storeCardInfo: { flex: 1, gap: Spacing.xs },
  storeCardName: { ...Typography.titleMedium },
  storeCardAddress: { ...Typography.bodySmall },
  chipWrap: { marginRight: Spacing.sm },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
  },
  storeCardHours: { ...Typography.labelSmall, fontWeight: '600' },
  distanceBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    alignSelf: 'flex-start',
  },
  distanceText: { color: '#fff', ...Typography.labelMedium, fontWeight: '700' },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
  navBtnText: { ...Typography.labelLarge, fontWeight: '700' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
    gap: Spacing.md,
  },
  retryBtn: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
  },
});
