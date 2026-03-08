import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Radius, Spacing, Typography } from '@/constants/theme';
import AnimatedPressable from '@/components/AnimatedPressable';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
  selectedBackgroundColor?: string;
  selectedTextColor?: string;
  unselectedBackgroundColor?: string;
  unselectedTextColor?: string;
  borderColor?: string;
}

export function Chip({
  label,
  selected = false,
  onPress,
  style,
  selectedBackgroundColor,
  selectedTextColor = '#fff',
  unselectedBackgroundColor,
  unselectedTextColor,
  borderColor,
}: ChipProps) {
  return (
    <AnimatedPressable onPress={onPress} style={style}>
      <View
        style={[
          styles.base,
          {
            backgroundColor: selected ? selectedBackgroundColor : unselectedBackgroundColor,
            borderColor: borderColor ?? (selected ? selectedBackgroundColor : undefined),
          },
        ]}
      >
        <Text
          style={[
            styles.label,
            { color: selected ? selectedTextColor : unselectedTextColor },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
  label: {
    ...Typography.labelMedium,
  },
});
