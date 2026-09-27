import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { Card } from './Card';

export function SkeletonBlock({
  width = '100%',
  height = 14,
  round,
  style,
}: {
  width?: DimensionValue;
  height?: number;
  round?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const pulse = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return (
    <Animated.View
      style={[
        { width, height, borderRadius: round ? height / 2 : radius.sm, backgroundColor: '#E4EAEB', opacity: pulse },
        style,
      ]}
    />
  );
}

/** Placeholder shaped like the real screen so the layout doesn't jump when data arrives. */
export function CompetitionSkeleton() {
  return (
    <View style={styles.wrap} accessibilityLabel="Loading" accessibilityRole="progressbar">
      <Card style={styles.gap}>
        <SkeletonBlock width="70%" height={22} />
        <View style={styles.row}>
          <SkeletonBlock width={60} height={22} />
          <SkeletonBlock width={70} height={22} />
          <SkeletonBlock width={140} height={22} />
        </View>
        <View style={styles.row}>
          <SkeletonBlock width={90} height={40} />
          <SkeletonBlock width={60} height={40} />
          <SkeletonBlock width={120} height={40} />
        </View>
      </Card>
      <Card style={[styles.gap, styles.rowCenter]}>
        <SkeletonBlock width={84} height={84} round />
        <View style={{ flex: 1, gap: 8 }}>
          <SkeletonBlock width="30%" />
          <SkeletonBlock width="60%" height={18} />
          <SkeletonBlock width="80%" />
        </View>
      </Card>
      <SkeletonBlock height={44} style={styles.gap} />
      <Card style={styles.gap}>
        <SkeletonBlock width="40%" />
        <SkeletonBlock height={130} style={{ marginTop: spacing.md }} />
      </Card>
      <Card style={[styles.row, styles.gap]}>
        {[0, 1, 2].map((i) => (
          <SkeletonBlock key={i} width={150} height={76} />
        ))}
      </Card>
      <Card>
        {[0, 1, 2, 3].map((i) => (
          <SkeletonBlock key={i} height={20} style={{ marginBottom: 10 }} />
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, gap: spacing.md },
  gap: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.sm, overflow: 'hidden' },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
});
