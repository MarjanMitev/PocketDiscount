import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Radius, Spacing, Typography } from '@/constants/theme';
import AnimatedPressable from '@/components/AnimatedPressable';

type Variant = 'filled' | 'tonal' | 'outlined' | 'text';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'filled',
  disabled = false,
  loading = false,
  leftIcon,
  style,
  textStyle,
  fullWidth,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={isDisabled}
      style={[fullWidth && styles.fullWidth, style]}
    >
      <View
        style={[
          styles.base,
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
        ]}
      >
        {loading ? (
          <Text style={[styles.label, textStyle]}>...</Text>
        ) : (
          <>
            {leftIcon}
            <Text style={[styles.label, textStyle]}>{title}</Text>
          </>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
    minHeight: 48,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
  label: {
    ...Typography.labelLarge,
  },
});
