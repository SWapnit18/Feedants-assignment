import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from './Button';
import { colors, spacing } from '../theme';
import { useI18n, type TranslationKey } from '../i18n';
import { formatCurrency } from '../utils/format';
import type { PrimaryAction } from '../api/types';

export interface PrimaryCTAProps {
  action: PrimaryAction;
  entryFee: number;
  busy: boolean;
  busyLabel?: string;
  onPress: (action: PrimaryAction) => void;
}

/**
 * Sticky bottom CTA. Its type/enabled/label come entirely from the API (`viewer.primaryAction` or
 * `anonymousAction`); the client never decides what the user may do.
 */
export function PrimaryCTA({ action, entryFee, busy, busyLabel, onPress }: PrimaryCTAProps) {
  const { t } = useI18n();
  // The server already localizes label/subLabel for ?lang=; the dictionary is only a fallback.
  const label = action.label || t(`cta_${action.type}` as TranslationKey, { fee: formatCurrency(entryFee) });
  const sub = action.subLabel;

  return (
    <View style={styles.wrap}>
      <Button
        label={busy ? busyLabel ?? t('ctaWorking') : label}
        subLabel={busy ? null : sub}
        size="lg"
        disabled={!action.enabled || busy}
        loading={false}
        onPress={() => onPress(action)}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  button: { borderRadius: 10, minHeight: 50 },
});
