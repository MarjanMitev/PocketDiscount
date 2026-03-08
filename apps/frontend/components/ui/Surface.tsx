import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { Elevation, Radius, Spacing } from '@/constants/theme';

type ElevationLevel = keyof typeof Elevation;

interface SurfaceProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  elevation?: ElevationLevel;
  borderRadius?: number;
  padding?: keyof typeof Spacing | number;
  backgroundColor?: string;
}

export function Surface({
  children,
  style,
  elevation = 'level1',
  borderRadius = Radius.lg,
  padding,
  backgroundColor,
}: SurfaceProps) {
  const paddingValue = typeof padding === 'number' ? padding : padding ? Spacing[padding] : undefined;
  return (
    <View
      style={[
        styles.base,
        { borderRadius, backgroundColor },
        paddingValue !== undefined && { padding: paddingValue },
        Elevation[elevation],
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden' },
});
