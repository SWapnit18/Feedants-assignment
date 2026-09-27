import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors, fonts, radius, spacing } from '../theme';
import { useI18n, type TranslationKey } from '../i18n';
import { useCountdown } from '../hooks/useServerClock';
import { formatCountdown } from '../utils/format';
import type { Lifecycle } from '../api/types';

const HURRY_THRESHOLD_MS = 3 * 24 * 3600 * 1000;

export interface CountdownBannerProps {
  nextDeadline: Lifecycle['nextDeadline'];
  clockOffsetMs: number;
  /** Fired once when the countdown reaches zero → caller refetches lifecycle / CTA. */
  onElapsed: () => void;
}

/** Live "Registration closes in 01d : 06h : 28m : 32s" banner, ticking on the server clock. */
export function CountdownBanner({ nextDeadline, clockOffsetMs, onElapsed }: CountdownBannerProps) {
  const { t } = useI18n();
  const { remainingMs, elapsed } = useCountdown(nextDeadline?.at, clockOffsetMs, onElapsed);
  if (!nextDeadline) return null;

  const label = t(`deadline_${nextDeadline.type}` as TranslationKey);
  const urgent =
    !elapsed &&
    remainingMs < HURRY_THRESHOLD_MS &&
    (nextDeadline.type === 'registration_closes' || nextDeadline.type === 'submission_ends');

  return (
    <View style={styles.banner} accessibilityRole="timer" accessibilityLabel={`${label} ${formatCountdown(remainingMs)}`}>
      <MaterialCommunityIcons name="timer-sand" size={22} color={colors.primaryText} />
      <AppText variant="bodyMedium" style={styles.label} numberOfLines={2}>
        {label}
      </AppText>
      <AppText style={styles.time} numberOfLines={1} adjustsFontSizeToFit>
        {elapsed ? t('updating') : formatCountdown(remainingMs)}
      </AppText>
      {urgent ? (
        <View style={styles.hurry}>
          <Ionicons name="timer-outline" size={18} color={colors.primaryText} />
          <AppText style={styles.hurryText}>{t('hurryUp')}</AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryTint,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primaryTintStrong,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  label: { flexShrink: 1, maxWidth: 110, fontSize: 12, lineHeight: 16, color: colors.text },
  time: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.primaryText,
    fontVariant: ['tabular-nums'],
  },
  hurry: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hurryText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.primaryText },
});
