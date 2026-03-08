import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors, Elevation, Radius, Spacing, Typography, SCREEN_PADDING_BOTTOM } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api } from '@/services/api';
import AnimatedPressable from '@/components/AnimatedPressable';
import { AppBar } from '@/components/ui/AppBar';
import { Surface } from '@/components/ui/Surface';

interface ParsedReceiptItem {
  name: string;
  price: number;
  raw: string;
}

function parseReceiptText(text: string): ParsedReceiptItem[] {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const items: ParsedReceiptItem[] = [];
  const priceRegex = /(\d+[,.]?\d{0,2})\s*$/;
  for (const line of lines) {
    const match = line.match(priceRegex);
    if (match) {
      const price = parseFloat(match[1].replace(',', '.'));
      const name = line.replace(match[0], '').trim();
      if (name.length > 1 && price > 0 && price < 1000) {
        items.push({ name, price, raw: line });
      }
    }
  }
  return items;
}

function ReceiptItem({
  item,
  colors,
  index,
}: {
  item: ParsedReceiptItem;
  colors: typeof Colors.light;
  index: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
      <View style={[styles.receiptItem, { backgroundColor: colors.surfaceContainer, borderColor: colors.outline }]}>
        <Text style={[styles.receiptItemName, { color: colors.onSurface }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.receiptItemPrice, { color: colors.primary }]}>
          €{item.price.toFixed(2)}
        </Text>
      </View>
    </Animated.View>
  );
}

export default function ScannerScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [scannedItems, setScannedItems] = useState<ParsedReceiptItem[]>([]);
  const [scannedTotal, setScannedTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const handleScan = async () => {
    if (!cameraRef.current) return;
    try {
      setProcessing(true);
      setError(null);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });
      if (!photo) throw new Error('Foto mislukt');

      setScanning(false);
      await new Promise((res) => setTimeout(res, 400));

      let text: string;
      if (photo.base64) {
        try {
          const result = await api.receiptOcr(photo.base64);
          text = result.text || '';
        } catch {
          text = '';
        }
      } else {
        text = '';
      }

      if (!text.trim()) {
        setError('Geen tekst herkend. Zorg voor goede belichting en een scherpe foto, of controleer of de server bereikbaar is.');
        setScannedItems([]);
        setScannedTotal(0);
        setProcessing(false);
        return;
      }

      const items = parseReceiptText(text);
      const total = items.reduce((sum, i) => sum + i.price, 0);
      setScannedItems(items);
      setScannedTotal(total);
    } catch {
      setError('Scannen mislukt. Probeer opnieuw.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setScannedItems([]);
    setScannedTotal(0);
    setError(null);
    setScanning(false);
  };

  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <AppBar
          title="Bon Scanner"
          subtitle="Scan je kassabon voor inzicht in je uitgaven"
          backgroundColor={colors.primary}
        />
        <View style={styles.center}>
          <MaterialIcons name="phonelink-setup" size={64} color={colors.primary} />
          <Text style={[Typography.headlineSmall, { color: colors.onSurface }]}>Alleen op mobiel</Text>
          <Text style={[Typography.bodyMedium, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>
            De bonscanner is beschikbaar in de mobiele app (iOS/Android).
          </Text>
          <Surface elevation="level1" backgroundColor={colors.surface} style={styles.featureList}>
            <Text style={[Typography.titleMedium, { color: colors.onSurface }]}>Functies</Text>
            {[
              'Scan kassabonnen',
              'Analyseer uitgaven',
              'Volg prijsinflatie',
              'Voorspel aanbiedingen',
            ].map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <MaterialIcons name="check-circle" size={20} color={colors.primary} />
                <Text style={[Typography.bodyMedium, { color: colors.onSurfaceVariant }]}>{f}</Text>
              </View>
            ))}
          </Surface>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <AppBar
          title="Bon Scanner"
          subtitle="Scan je kassabon voor inzicht in je uitgaven"
          backgroundColor={colors.primary}
        />
        <View style={styles.center}>
          <MaterialIcons name="photo-camera" size={64} color={colors.primary} />
          <Text style={[Typography.headlineSmall, { color: colors.onSurface }]}>Camera toegang vereist</Text>
          <Text style={[Typography.bodyMedium, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>
            PocketDiscount heeft toegang tot je camera nodig om kassabonnen te scannen.
          </Text>
          <AnimatedPressable onPress={requestPermission}>
            <View style={[styles.permBtn, { backgroundColor: colors.primary }, Elevation.level2]}>
              <Text style={[Typography.labelLarge, { color: colors.onPrimary, fontWeight: '700' }]}>
                Toegang verlenen
              </Text>
            </View>
          </AnimatedPressable>
        </View>
      </SafeAreaView>
    );
  }

  if (scanning) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back">
          <LinearGradient
            colors={['rgba(0,0,0,0.65)', 'transparent', 'rgba(0,0,0,0.65)']}
            locations={[0, 0.4, 1]}
            style={styles.cameraOverlay}
          >
            <SafeAreaView style={styles.cameraInner} edges={['top', 'bottom']}>
              <View style={styles.cameraHeader}>
                <Text style={styles.cameraTitle}>Richt op je kassabon</Text>
                <Text style={styles.cameraHint}>Zorg voor goede belichting</Text>
              </View>

              <View style={styles.scanFrameWrapper}>
                <View style={[styles.scanCorner, styles.scanCornerTL, { borderColor: colors.primary }]} />
                <View style={[styles.scanCorner, styles.scanCornerTR, { borderColor: colors.primary }]} />
                <View style={[styles.scanCorner, styles.scanCornerBL, { borderColor: colors.primary }]} />
                <View style={[styles.scanCorner, styles.scanCornerBR, { borderColor: colors.primary }]} />
              </View>

              <View style={styles.cameraActions}>
                <AnimatedPressable onPress={() => setScanning(false)}>
                  <View style={styles.cancelBtn}>
                    <Text style={styles.cancelBtnText}>Annuleren</Text>
                  </View>
                </AnimatedPressable>

                <AnimatedPressable onPress={handleScan}>
                  <View style={[styles.captureBtn, { backgroundColor: colors.primary, opacity: processing ? 0.6 : 1 }, Elevation.level3]}>
                    {processing ? (
                      <ActivityIndicator color="#fff" size="large" />
                    ) : (
                      <MaterialIcons name="camera-alt" size={36} color="#fff" />
                    )}
                  </View>
                </AnimatedPressable>

                <View style={styles.capturePlaceholder} />
              </View>
            </SafeAreaView>
          </LinearGradient>
        </CameraView>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <AppBar
        title="Bon Scanner"
        subtitle="Scan je kassabon voor inzicht in je uitgaven"
        backgroundColor={colors.primary}
      />

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: SCREEN_PADDING_BOTTOM }]}>
        {error && (
          <Animated.View entering={FadeIn}>
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

        {scannedItems.length === 0 ? (
          <Animated.View entering={FadeIn} style={styles.emptyState}>
            <MaterialIcons name="receipt-long" size={80} color={colors.primary} />
            <Text style={[Typography.headlineSmall, { color: colors.onSurface }]}>Scan een kassabon</Text>
            <Text style={[Typography.bodyMedium, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>
              Gebruik je camera om een kassabon te scannen. We analyseren je aankopen en houden je uitgaven bij.
            </Text>

            <AnimatedPressable onPress={() => setScanning(true)}>
              <View style={[styles.startScanBtn, { backgroundColor: colors.primary }, Elevation.level2]}>
                <MaterialIcons name="camera-alt" size={22} color="#fff" />
                <Text style={styles.startScanBtnText}>Begin met scannen</Text>
              </View>
            </AnimatedPressable>

            <Surface elevation="level1" backgroundColor={colors.surface} style={styles.tipsCard}>
              <View style={styles.tipsHeader}>
                <MaterialIcons name="lightbulb-outline" size={20} color={colors.primary} />
                <Text style={[Typography.titleSmall, { color: colors.onSurface }]}>Tips voor beste resultaten</Text>
              </View>
              {[
                'Zorg voor goede belichting',
                'Houd de bon vlak en stil',
                'Scan de volledige bon',
                'Vermijd schaduwen op de bon',
              ].map((tip, i) => (
                <View key={i} style={[styles.tipRow, { borderTopColor: colors.outlineVariant }]}>
                  <View style={[styles.tipDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.tipItem, { color: colors.onSurfaceVariant }]}>{tip}</Text>
                </View>
              ))}
            </Surface>
          </Animated.View>
        ) : (
          <>
            <Animated.View entering={FadeIn}>
              <Surface
                elevation="level2"
                backgroundColor={colors.primary}
                style={styles.resultSummaryCard}
              >
                <View style={styles.resultHeader}>
                  <MaterialIcons name="check-circle" size={24} color={colors.onPrimary} />
                  <Text style={styles.resultTitle}>Bon gescand!</Text>
                </View>
                <View style={styles.resultStats}>
                  <View style={styles.resultStat}>
                    <Text style={styles.resultStatValue}>{scannedItems.length}</Text>
                    <Text style={styles.resultStatLabel}>Producten</Text>
                  </View>
                  <View style={[styles.resultStatDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                  <View style={styles.resultStat}>
                    <Text style={styles.resultStatValue}>€{scannedTotal.toFixed(2)}</Text>
                    <Text style={styles.resultStatLabel}>Totaal</Text>
                  </View>
                </View>
              </Surface>
            </Animated.View>

            <Surface elevation="level1" backgroundColor={colors.surface} style={styles.itemsCard}>
              <Text style={[Typography.titleSmall, { color: colors.onSurface }]}>Gescande producten</Text>
              <View style={styles.itemsList}>
                {scannedItems.map((item, idx) => (
                  <ReceiptItem key={idx} item={item} colors={colors} index={idx} />
                ))}
              </View>
            </Surface>

            <View style={styles.resultActions}>
              <AnimatedPressable onPress={() => setScanning(true)}>
                <View style={[styles.rescanBtn, { borderColor: colors.primary, borderWidth: 1.5 }]}>
                  <MaterialIcons name="camera-alt" size={20} color={colors.primary} />
                  <Text style={[styles.rescanBtnText, { color: colors.primary }]}>Opnieuw scannen</Text>
                </View>
              </AnimatedPressable>
              <AnimatedPressable onPress={handleReset}>
                <View style={[styles.resetBtn, { backgroundColor: colors.danger }, Elevation.level1]}>
                  <MaterialIcons name="delete-outline" size={20} color="#fff" />
                  <Text style={styles.resetBtnText}>Wissen</Text>
                </View>
              </AnimatedPressable>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  featureList: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    width: '100%',
    gap: Spacing.sm,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  permBtn: {
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.md + 2,
    borderRadius: Radius.full,
  },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1 },
  cameraInner: {
    flex: 1,
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  cameraHeader: { alignItems: 'center', paddingTop: Spacing.lg, gap: Spacing.xs },
  cameraTitle: { color: '#fff', ...Typography.titleLarge, textAlign: 'center' },
  cameraHint: { color: 'rgba(255,255,255,0.9)', ...Typography.bodySmall },
  scanFrameWrapper: {
    width: 260,
    height: 380,
    alignSelf: 'center',
    position: 'relative',
  },
  scanCorner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderWidth: 3,
  },
  scanCornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 6 },
  scanCornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 6 },
  scanCornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 6 },
  scanCornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 6 },
  cameraActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.lg,
  },
  cancelBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cancelBtnText: { color: '#fff', ...Typography.labelLarge },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  capturePlaceholder: { width: 80 },
  scrollContent: { padding: Spacing.lg, gap: Spacing.lg },
  errorCard: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  errorText: { flex: 1, ...Typography.bodyMedium, fontWeight: '600' },
  emptyState: { alignItems: 'center', gap: Spacing.lg, paddingTop: Spacing.xl },
  startScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.md + 2,
    borderRadius: Radius.full,
    width: '100%',
  },
  startScanBtnText: { color: '#fff', ...Typography.labelLarge, fontWeight: '700' },
  tipsCard: { borderRadius: Radius.xl, padding: Spacing.lg, width: '100%', gap: Spacing.sm },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  tipDot: { width: 6, height: 6, borderRadius: 3 },
  tipItem: { ...Typography.bodyMedium, flex: 1 },
  resultSummaryCard: { borderRadius: Radius.xl, padding: Spacing.xl, gap: Spacing.lg },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  resultTitle: { color: '#fff', ...Typography.titleLarge, fontWeight: '800' },
  resultStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  resultStat: { flex: 1, alignItems: 'center', gap: Spacing.xs },
  resultStatValue: { color: '#fff', ...Typography.headlineSmall, fontWeight: '800' },
  resultStatLabel: { color: 'rgba(255,255,255,0.85)', ...Typography.labelSmall },
  resultStatDivider: { width: 1, marginHorizontal: Spacing.md },
  itemsCard: { borderRadius: Radius.xl, padding: Spacing.lg, gap: Spacing.md },
  itemsList: { gap: Spacing.sm },
  receiptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  receiptItemName: { ...Typography.bodyMedium, fontWeight: '600', flex: 1 },
  receiptItemPrice: { ...Typography.titleSmall, fontWeight: '700', marginLeft: Spacing.md },
  resultActions: { flexDirection: 'row', gap: Spacing.md },
  rescanBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
  },
  rescanBtnText: { ...Typography.labelLarge, fontWeight: '700' },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.full,
  },
  resetBtnText: { color: '#fff', ...Typography.labelLarge, fontWeight: '700' },
});
