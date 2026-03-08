/**
 * Material Design 3–inspired design tokens for PocketDiscount.
 * Provides consistent color roles, type scale, elevation, and spacing
 * for an app-store quality, modern UI.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Primary (brand green – savings, CTAs)
    primary: '#16A34A',
    onPrimary: '#FFFFFF',
    primaryContainer: '#DCFCE7',
    onPrimaryContainer: '#052E16',
    primaryFixed: '#22C55E',
    onPrimaryFixed: '#00210B',

    // Secondary (optional accent)
    secondary: '#0F766E',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#CCFBF1',
    onSecondaryContainer: '#042F2E',

    // Surface (backgrounds)
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceContainer: '#F1F5F9',
    surfaceContainerHigh: '#E2E8F0',
    surfaceContainerHighest: '#CBD5E1',
    onSurface: '#0F172A',
    onSurfaceVariant: '#475569',
    outline: '#E2E8F0',
    outlineVariant: '#CBD5E1',

    // Legacy aliases (for gradual migration)
    text: '#0F172A',
    textSecondary: '#64748B',
    card: '#FFFFFF',
    tint: '#16A34A',
    tintLight: '#22C55E',
    tintDark: '#15803D',
    tintMuted: '#DCFCE7',
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#16A34A',
    border: '#E2E8F0',
    borderFocus: '#16A34A',
    danger: '#DC2626',
    dangerMuted: '#FEE2E2',
    dangerContainer: '#FEE2E2',
    onDanger: '#FFFFFF',
    warning: '#D97706',
    warningMuted: '#FEF3C7',
    warningContainer: '#FEF3C7',
    savings: '#16A34A',
    savingsMuted: '#DCFCE7',
    skeleton: '#E2E8F0',
    skeletonHighlight: '#F1F5F9',
    overlay: 'rgba(0,0,0,0.45)',
    surfaceDim: '#F1F5F9',
    surfaceBright: '#F8FAFC',
  },
  dark: {
    primary: '#4ADE80',
    onPrimary: '#003919',
    primaryContainer: '#005227',
    onPrimaryContainer: '#9EF7B4',
    primaryFixed: '#22C55E',
    onPrimaryFixed: '#00210B',

    secondary: '#5EEAD4',
    onSecondary: '#00382F',
    secondaryContainer: '#005045',
    onSecondaryContainer: '#CCFBF1',

    background: '#0A0A0A',
    surface: '#111111',
    surfaceContainer: '#1A1A1A',
    surfaceContainerHigh: '#262626',
    surfaceContainerHighest: '#333333',
    onSurface: '#F1F5F9',
    onSurfaceVariant: '#94A3B8',
    outline: '#475569',
    outlineVariant: '#334155',

    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    card: '#1A1A1A',
    tint: '#4ADE80',
    tintLight: '#86EFAC',
    tintDark: '#22C55E',
    tintMuted: '#14532D',
    icon: '#94A3B8',
    tabIconDefault: '#475569',
    tabIconSelected: '#4ADE80',
    border: '#1E293B',
    borderFocus: '#4ADE80',
    danger: '#F87171',
    dangerMuted: '#450A0A',
    dangerContainer: '#7F1D1D',
    onDanger: '#FFFFFF',
    warning: '#FBBF24',
    warningMuted: '#451A03',
    warningContainer: '#78350F',
    savings: '#4ADE80',
    savingsMuted: '#14532D',
    skeleton: '#1E293B',
    skeletonHighlight: '#273344',
    overlay: 'rgba(0,0,0,0.7)',
    surfaceDim: '#111111',
    surfaceBright: '#1A1A1A',
  },
};

export const Typography = {
  displayLarge: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5, lineHeight: 40 },
  displayMedium: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.25, lineHeight: 36 },
  displaySmall: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32 },
  headlineLarge: { fontSize: 22, fontWeight: '600' as const, lineHeight: 28 },
  headlineMedium: { fontSize: 20, fontWeight: '600' as const, lineHeight: 26 },
  headlineSmall: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  titleLarge: { fontSize: 17, fontWeight: '600' as const, lineHeight: 24 },
  titleMedium: { fontSize: 15, fontWeight: '600' as const, letterSpacing: 0.15, lineHeight: 22 },
  titleSmall: { fontSize: 14, fontWeight: '600' as const, letterSpacing: 0.1, lineHeight: 20 },
  bodyLarge: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMedium: { fontSize: 14, fontWeight: '400' as const, letterSpacing: 0.25, lineHeight: 20 },
  bodySmall: { fontSize: 12, fontWeight: '400' as const, letterSpacing: 0.4, lineHeight: 16 },
  labelLarge: { fontSize: 14, fontWeight: '500' as const, letterSpacing: 0.1, lineHeight: 20 },
  labelMedium: { fontSize: 12, fontWeight: '500' as const, letterSpacing: 0.5, lineHeight: 16 },
  labelSmall: { fontSize: 11, fontWeight: '500' as const, letterSpacing: 0.5, lineHeight: 16 },
};

/** Web uses boxShadow to avoid React Native Web shadow warnings; native uses shadow* + elevation. */
const elevationNative = {
  level0: { shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
  level1: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  level2: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 4 },
  level3: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 8 },
  level4: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 12 },
  level5: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 16 },
} as const;

const elevationWeb = {
  level0: { boxShadow: 'none' },
  level1: { boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  level2: { boxShadow: '0 2px 6px rgba(0,0,0,0.06)' },
  level3: { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
  level4: { boxShadow: '0 6px 16px rgba(0,0,0,0.1)' },
  level5: { boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
} as const;

export const Elevation = Platform.OS === 'web' ? elevationWeb : elevationNative;

export const Shadows = {
  sm: Elevation.level1,
  md: Elevation.level2,
  lg: Elevation.level3,
  xl: Elevation.level4,
  tinted: (color: string) =>
    Platform.OS === 'web'
      ? { boxShadow: `0 4px 12px ${color}40` }
      : {
          shadowColor: color,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 8,
        },
};

export const Radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const TAB_BAR_HEIGHT = 72;
export const TAB_BAR_BOTTOM = 20;
export const SCREEN_PADDING_BOTTOM = TAB_BAR_HEIGHT + TAB_BAR_BOTTOM + 8;
