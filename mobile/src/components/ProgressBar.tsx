import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, radius } from '../theme';

export interface ProgressBarProps {
  /** 0..1 */
  value: number;
  height?: number;
  color?: string;
  trackColor?: string;
  style?: ViewStyle;
  /** show a small minimum sliver so "1 / 20" is visible like in the design */
  minVisible?: number;
}

export function ProgressBar({
  value,
  height = 5,
  color = colors.primary,
  trackColor = colors.primaryTintStrong,
  style,
  minVisible = 0,
}: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, value));
  const shown = clamped > 0 ? Math.max(clamped, minVisible) : 0;
  const anim = useRef(new Animated.Value(shown)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: shown, duration: 400, useNativeDriver: false }).start();
  }, [anim, shown]);

  return (
    <View
      style={[styles.track, { height, backgroundColor: trackColor }, style]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
    >
      <Animated.View
        style={[
          styles.fill,
          { backgroundColor: color, width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
});
