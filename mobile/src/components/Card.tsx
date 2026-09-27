import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { colors, radius, shadow, spacing } from '../theme';

export interface CardProps extends ViewProps {
  padded?: boolean;
  tone?: 'surface' | 'tint' | 'mint';
}

/** White rounded card with hairline border + soft shadow (the building block of the whole screen). */
export function Card({ padded = true, tone = 'surface', style, ...rest }: CardProps) {
  return (
    <View
      {...rest}
      style={[
        styles.card,
        padded && styles.padded,
        tone === 'tint' && styles.tint,
        tone === 'mint' && styles.mint,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadow,
  },
  padded: { padding: spacing.lg },
  tint: { backgroundColor: colors.primaryTint, borderColor: colors.primaryTintStrong },
  mint: { backgroundColor: colors.mint, borderColor: '#D6EEDF' },
});
