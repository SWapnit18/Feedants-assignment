import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { AppText } from './AppText';
import { PlayButton } from './PlayButton';
import { colors, fonts, radius, spacing } from '../theme';
import { useI18n } from '../i18n';

/** Text wordmark for Razorpay (avoids shipping a trademark asset). */
function RazorpayMark() {
  return (
    <View style={styles.rzp} accessibilityLabel="Razorpay">
      <AppText style={styles.rzpSlash}>/</AppText>
      <AppText style={styles.rzpText}>Razorpay</AppText>
    </View>
  );
}

export interface PaymentInfoCardsProps {
  onWatchPrizeVideo?: () => void;
  onRefundPolicy: () => void;
  showRazorpay: boolean;
}

export function PaymentInfoCards({ onWatchPrizeVideo, onRefundPolicy, showRazorpay }: PaymentInfoCardsProps) {
  const { t } = useI18n();
  return (
    <View style={styles.row}>
      <Card style={styles.half} padded={false}>
        <Pressable
          onPress={onWatchPrizeVideo}
          disabled={!onWatchPrizeVideo}
          style={({ pressed }) => [styles.prize, pressed && { opacity: 0.75 }]}
          accessibilityRole="button"
        >
          <View style={styles.playTile}>
            <PlayButton size={30} variant="solid" />
          </View>
          <View style={{ flex: 1 }}>
            <AppText style={styles.prizeTitle}>{t('prizeMoneyTitle')}</AppText>
            <AppText variant="tiny" style={styles.prizeSub}>
              {t('watchVideo')}
            </AppText>
          </View>
        </Pressable>
      </Card>
      <Card style={[styles.half, styles.policy]}>
        <Pressable onPress={onRefundPolicy} style={styles.policyRow} accessibilityRole="button" hitSlop={6}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.text} />
          <AppText variant="caption" color={colors.text}>
            {t('refundPolicy')}
          </AppText>
        </Pressable>
        {showRazorpay ? (
          <View style={styles.policyRow}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.text} />
            <AppText variant="tiny" color={colors.text} style={{ flexShrink: 1 }}>
              {t('securePayments')}
            </AppText>
            <RazorpayMark />
          </View>
        ) : null}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
  prize: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, flex: 1 },
  playTile: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primaryTintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prizeTitle: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 17, color: colors.text },
  prizeSub: { marginTop: 3, fontFamily: fonts.regular },
  policy: { padding: spacing.md, gap: spacing.md, justifyContent: 'center' },
  policyRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  rzp: { flexDirection: 'row', alignItems: 'center' },
  rzpSlash: { fontFamily: fonts.bold, fontStyle: 'italic', color: colors.razorpayAccent, fontSize: 13 },
  rzpText: { fontFamily: fonts.bold, fontStyle: 'italic', color: colors.razorpay, fontSize: 12 },
});
