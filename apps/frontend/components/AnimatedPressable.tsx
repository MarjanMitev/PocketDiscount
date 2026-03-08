import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

interface Props {
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  children: React.ReactNode;
  haptic?: boolean;
  scaleAmount?: number;
  disabled?: boolean;
}

export default function AnimatedPressable({
  onPress,
  onLongPress,
  style,
  children,
  haptic = true,
  scaleAmount = 0.96,
  disabled = false,
}: Props) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(scaleAmount, { damping: 20, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
  };

  const handlePress = () => {
    if (haptic && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  return (
    <Animated.View style={[animStyle, style]}>
      <Pressable
        onPress={handlePress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={{ flex: 1 }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
