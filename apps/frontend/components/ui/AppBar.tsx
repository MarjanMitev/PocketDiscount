import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography, Spacing } from '@/constants/theme';

interface AppBarProps {
  title: string;
  subtitle?: string;
  backgroundColor: string;
  titleColor?: string;
  subtitleColor?: string;
  style?: ViewStyle | ViewStyle[];
}

export function AppBar({
  title,
  subtitle,
  backgroundColor,
  titleColor = '#fff',
  subtitleColor = 'rgba(255,255,255,0.9)',
  style,
}: AppBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.container,
        { backgroundColor, paddingTop: insets.top + Spacing.md, paddingBottom: Spacing.lg },
        style,
      ]}
    >
      <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: subtitleColor }]} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
  },
  title: {
    ...Typography.headlineLarge,
  },
  subtitle: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
});
