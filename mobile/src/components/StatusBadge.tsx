import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors, fonts, radius } from '../theme';

type Tone = 'success' | 'warning' | 'danger';
const TONES: Record<Tone, { bg: string; fg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  success: { bg: colors.primaryTint, fg: colors.primaryText, icon: 'checkmark-circle' },
  warning: { bg: '#FFF4E0', fg: '#B26A00', icon: 'time' },
  danger: { bg: colors.dangerTint, fg: colors.danger, icon: 'close-circle' },
};

export function StatusBadge({ label, tone = 'success' }: { label: string; tone?: Tone }) {
  const t = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]} accessibilityRole="text">
      <Ionicons name={t.icon} size={17} color={t.fg} />
      <AppText style={styles.text} color={t.fg}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primaryTintStrong,
  },
  text: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
});
