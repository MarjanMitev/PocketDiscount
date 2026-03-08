import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Props {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export default function SkeletonCard({ width = '100%', height = 120, borderRadius = 12, style }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1500 }), -1, false);
  }, []);

  const animStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmer.value, [0, 1], [-300, 300]);
    return { transform: [{ translateX }] };
  });

  return (
    <View
      style={[
        { width, height, borderRadius, backgroundColor: colors.skeleton, overflow: 'hidden' },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors.skeletonHighlight, opacity: 0.5 },
          animStyle,
        ]}
      />
    </View>
  );
}
