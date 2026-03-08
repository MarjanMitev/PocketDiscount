/**
 * Tests for design tokens: Colors, Typography, Spacing, Radius, Elevation.
 * These are pure data objects — no rendering required.
 */

// Mock Platform.OS to test native elevation path
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  StyleSheet: { create: (s: unknown) => s },
}));

import { Colors, Typography, Spacing, Radius, Elevation, TAB_BAR_HEIGHT, SCREEN_PADDING_BOTTOM } from '../theme';

describe('Colors', () => {
  it('light theme has required color roles', () => {
    const required = [
      'primary', 'onPrimary', 'primaryContainer', 'onPrimaryContainer',
      'background', 'surface', 'onSurface', 'onSurfaceVariant',
      'outline', 'danger', 'savings',
    ];
    for (const key of required) {
      expect(Colors.light).toHaveProperty(key);
      expect(typeof (Colors.light as Record<string, unknown>)[key]).toBe('string');
    }
  });

  it('dark theme has same keys as light theme', () => {
    const lightKeys = Object.keys(Colors.light).sort();
    const darkKeys = Object.keys(Colors.dark).sort();
    expect(darkKeys).toEqual(lightKeys);
  });

  it('light primary is the brand green', () => {
    expect(Colors.light.primary).toBe('#16A34A');
  });

  it('dark primary is a lighter green for contrast', () => {
    expect(Colors.dark.primary).toBe('#4ADE80');
  });

  it('all color values are non-empty strings', () => {
    for (const [key, value] of Object.entries(Colors.light)) {
      expect(typeof value).toBe('string');
      expect((value as string).length).toBeGreaterThan(0);
    }
  });
});

describe('Typography', () => {
  it('bodyLarge has fontSize 16', () => {
    expect(Typography.bodyLarge.fontSize).toBe(16);
  });

  it('displayLarge has the largest fontSize', () => {
    const sizes = Object.values(Typography).map((t) => t.fontSize);
    expect(Typography.displayLarge.fontSize).toBe(Math.max(...sizes));
  });

  it('all scales have lineHeight greater than fontSize', () => {
    for (const [name, style] of Object.entries(Typography)) {
      expect(style.lineHeight).toBeGreaterThanOrEqual(style.fontSize);
    }
  });

  it('label variants have fontWeight 500', () => {
    expect(Typography.labelLarge.fontWeight).toBe('500');
    expect(Typography.labelMedium.fontWeight).toBe('500');
    expect(Typography.labelSmall.fontWeight).toBe('500');
  });
});

describe('Spacing', () => {
  it('values are positive numbers in ascending order', () => {
    const values = Object.values(Spacing);
    expect(values.every((v) => v > 0)).toBe(true);
    const sorted = [...values].sort((a, b) => a - b);
    expect(values).toEqual(sorted);
  });

  it('md is 12', () => {
    expect(Spacing.md).toBe(12);
  });
});

describe('Radius', () => {
  it('full is a very large number (pill shape)', () => {
    expect(Radius.full).toBeGreaterThan(100);
  });

  it('none is 0', () => {
    expect(Radius.none).toBe(0);
  });
});

describe('Elevation (native)', () => {
  it('level0 has elevation 0', () => {
    expect((Elevation.level0 as { elevation: number }).elevation).toBe(0);
  });

  it('elevation increases from level0 to level5', () => {
    const levels = [
      Elevation.level0, Elevation.level1, Elevation.level2,
      Elevation.level3, Elevation.level4, Elevation.level5,
    ] as Array<{ elevation: number }>;
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i].elevation).toBeGreaterThan(levels[i - 1].elevation);
    }
  });
});

describe('Layout constants', () => {
  it('TAB_BAR_HEIGHT is a positive number', () => {
    expect(TAB_BAR_HEIGHT).toBeGreaterThan(0);
  });

  it('SCREEN_PADDING_BOTTOM is at least TAB_BAR_HEIGHT', () => {
    expect(SCREEN_PADDING_BOTTOM).toBeGreaterThanOrEqual(TAB_BAR_HEIGHT);
  });
});
