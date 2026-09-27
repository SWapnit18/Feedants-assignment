import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

/** Round play glyph used on the judge card, winner thumbnails and the prize-info card. */
export function PlayButton({ size = 44, variant = 'tint' }: { size?: number; variant?: 'tint' | 'solid' | 'overlay' }) {
  const bg = variant === 'solid' ? colors.primary : variant === 'overlay' ? colors.white : colors.primaryTint;
  const fg = variant === 'solid' ? colors.white : colors.primary;
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
        variant === 'overlay' && styles.overlayBorder,
      ]}
    >
      <Ionicons name="play" size={size * 0.45} color={fg} style={{ marginLeft: size * 0.06 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  overlayBorder: { borderWidth: 2, borderColor: colors.primary },
});
