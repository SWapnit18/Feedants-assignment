import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { Chip } from './Chip';
import { AppText } from './AppText';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';
import { colors, fonts, spacing } from '../theme';
import { useI18n } from '../i18n';
import { formatCurrency } from '../utils/format';
import type { Availability, Competition, ViewerRegistration } from '../api/types';

export interface CompetitionSummaryCardProps {
  competition: Competition;
  availability: Availability;
  registration: ViewerRegistration | null | undefined;
  onLongPressTitle?: () => void;
}

/** Title, badges, chips, prize pool / entry fee and live seat availability. */
export function CompetitionSummaryCard({ competition, availability, registration, onLongPressTitle }: CompetitionSummaryCardProps) {
  const { t } = useI18n();
  const { remaining, capacity, booked, isFull } = availability;
  const spotsText = isFull || remaining <= 0 ? t('noSpotsLeft') : remaining === 1 ? t('spotLeft') : t('spotsLeft', { n: remaining });

  let badge: React.ReactNode = null;
  if (competition.status === 'cancelled') badge = <StatusBadge label={t('cancelledBadge')} tone="danger" />;
  else if (registration?.status === 'confirmed') badge = <StatusBadge label={t('registered')} />;
  else if (registration?.status === 'pending_payment') badge = <StatusBadge label={t('pendingPayment')} tone="warning" />;

  return (
    <Card style={styles.card}>
      <View style={styles.titleRow}>
        <Pressable onLongPress={onLongPressTitle} delayLongPress={500} style={{ flex: 1 }}>
          <AppText variant="title" style={styles.title} accessibilityRole="header">
            {competition.title}
          </AppText>
        </Pressable>
        {badge}
      </View>

      <View style={styles.chips}>
        {competition.tags.map((tag) => (
          <Chip key={tag} label={tag} />
        ))}
        {competition.certificate ? (
          <View style={styles.cert}>
            <Ionicons name="trophy-outline" size={17} color={colors.primaryText} />
            <AppText variant="label" color={colors.primaryText} style={styles.certText}>
              {t('winnersGetCertificate')}
            </AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <AppText variant="label" color={colors.textMuted}>
            {t('prizePool')}
          </AppText>
          <AppText style={styles.bigValue} adjustsFontSizeToFit numberOfLines={1}>
            {formatCurrency(competition.prizePool, { spaced: true })}
          </AppText>
        </View>
        <View style={styles.stat}>
          <AppText variant="label" color={colors.textMuted}>
            {t('entryFee')}
          </AppText>
          <AppText style={styles.bigValue} adjustsFontSizeToFit numberOfLines={1}>
            {competition.entryFee > 0 ? formatCurrency(competition.entryFee, { spaced: true }) : t('free')}
          </AppText>
        </View>
        <View style={styles.seats}>
          <View style={styles.seatsLabel}>
            <Ionicons name="people-outline" size={16} color={isFull ? colors.danger : colors.primaryText} />
            <AppText
              variant="bodyMedium"
              color={isFull ? colors.danger : colors.primaryText}
              style={styles.seatsText}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {spotsText}
            </AppText>
          </View>
          <ProgressBar value={capacity > 0 ? booked / capacity : 0} minVisible={0.12} style={styles.progress} />
          <AppText variant="caption">{t('booked', { booked, capacity })}</AppText>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { paddingTop: spacing.lg, gap: spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  title: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 28 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  cert: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: spacing.xs },
  certText: { fontFamily: fonts.medium },
  statsRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.xs },
  stat: { flex: 1.05, paddingRight: spacing.sm },
  bigValue: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 34, color: colors.primaryText },
  seats: { flex: 1.5, gap: 6, paddingTop: 2 },
  seatsLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  seatsText: { fontSize: 13, flexShrink: 1 },
  progress: { marginTop: 4 },
});
