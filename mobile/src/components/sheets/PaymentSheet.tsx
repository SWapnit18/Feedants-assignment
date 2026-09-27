import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '../BottomSheet';
import { AppText } from '../AppText';
import { Button } from '../Button';
import { colors, fonts, radius, spacing } from '../../theme';
import { useI18n } from '../../i18n';
import { useCountdown } from '../../hooks/useServerClock';
import { formatCurrency, formatMinSec } from '../../utils/format';
import type { PaymentOrder } from '../../api/types';

export type PaymentStage = 'idle' | 'paying' | 'verifying' | 'releasing';

export interface PaymentSheetProps {
  visible: boolean;
  competitionTitle: string;
  payment: PaymentOrder | null;
  holdExpiresAt: string | null;
  clockOffsetMs: number;
  stage: PaymentStage;
  error: string | null;
  onPay: () => void;
  onRelease: () => void;
  onClose: () => void;
  onHoldExpired: () => void;
}

/** Mock Razorpay checkout: amount, live "Seat held for 09:59" countdown, Pay → checkout → verify. */
export function PaymentSheet({
  visible,
  competitionTitle,
  payment,
  holdExpiresAt,
  clockOffsetMs,
  stage,
  error,
  onPay,
  onRelease,
  onClose,
  onHoldExpired,
}: PaymentSheetProps) {
  const { t } = useI18n();
  const { remainingMs, elapsed } = useCountdown(visible ? holdExpiresAt : null, clockOffsetMs, onHoldExpired);
  const busy = stage !== 'idle';
  const amount = payment ? formatCurrency(payment.amount) : '';
  const urgent = remainingMs > 0 && remainingMs < 60_000;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      dismissable={!busy}
      title={t('paymentTitle')}
      subtitle={t('paymentSubtitle', { title: competitionTitle })}
    >
      <View style={styles.amountBox}>
        <AppText variant="label">{t('entryFee')}</AppText>
        <AppText style={styles.amount}>{formatCurrency(payment?.amount ?? 0, { spaced: true })}</AppText>
      </View>

      {holdExpiresAt ? (
        <View style={[styles.hold, (elapsed || urgent) && styles.holdUrgent]} accessibilityRole="timer">
          <Ionicons name="time-outline" size={18} color={elapsed || urgent ? colors.danger : colors.primaryText} />
          <AppText style={[styles.holdText, (elapsed || urgent) && { color: colors.danger }]}>
            {elapsed ? t('holdExpired') : `${t('seatHeldFor')} ${formatMinSec(remainingMs)}`}
          </AppText>
        </View>
      ) : null}

      {error ? (
        <View style={styles.error} accessibilityRole="alert">
          <Ionicons name="alert-circle" size={18} color={colors.danger} />
          <AppText variant="label" color={colors.danger} style={{ flex: 1 }}>
            {error}
          </AppText>
        </View>
      ) : null}

      <Button
        label={
          stage === 'paying' ? t('paying') : stage === 'verifying' ? t('verifying') : t('pay', { amount })
        }
        size="lg"
        onPress={onPay}
        loading={false}
        disabled={busy || elapsed || !payment}
        style={styles.pay}
        icon={busy && stage !== 'releasing' ? <Ionicons name="sync" size={18} color={colors.white} /> : <Ionicons name="lock-closed" size={16} color={colors.white} />}
      />
      <Button
        label={t('releaseSeat')}
        variant="ghost"
        size="sm"
        onPress={onRelease}
        disabled={busy || elapsed}
        loading={stage === 'releasing'}
        style={styles.release}
      />
      <View style={styles.mock}>
        <Ionicons name="shield-checkmark-outline" size={14} color={colors.textMuted} />
        <AppText variant="tiny">{payment?.mock ? t('mockNotice') : `${t('securePayments')} Razorpay`}</AppText>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  amountBox: {
    backgroundColor: colors.primaryTint,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  amount: { fontFamily: fonts.bold, fontSize: 32, lineHeight: 42, color: colors.primaryText },
  hold: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  holdUrgent: { backgroundColor: colors.dangerTint },
  holdText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.primaryText, fontVariant: ['tabular-nums'] },
  error: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.dangerTint,
  },
  pay: { marginTop: spacing.lg },
  release: { marginTop: spacing.xs, alignSelf: 'center' },
  mock: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: spacing.sm },
});
