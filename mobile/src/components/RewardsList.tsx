import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from './Card';
import { AppText } from './AppText';
import { SectionHeader } from './SectionHeader';
import { colors, fonts, radius, spacing } from '../theme';
import { useI18n } from '../i18n';
import { formatCurrency } from '../utils/format';
import type { Reward } from '../api/types';

function RewardIcon({ position }: { position: number }) {
  if (position === 1) return <Ionicons name="trophy" size={20} color={colors.gold} />;
  if (position === 2) return <MaterialCommunityIcons name="medal" size={21} color={colors.silver} />;
  if (position === 3) return <MaterialCommunityIcons name="medal" size={21} color={colors.bronze} />;
  return <Ionicons name="star-outline" size={19} color={colors.primaryText} />;
}

export function RewardsList({ rewards }: { rewards: Reward[] }) {
  const { t } = useI18n();
  const sorted = [...rewards].sort((a, b) => a.position - b.position);
  return (
    <Card>
      <SectionHeader title={t('rewards')} suffix={t('allPositions')} />
      {sorted.length === 0 ? (
        <AppText variant="label">{t('noRewards')}</AppText>
      ) : (
        <View style={styles.list}>
          {sorted.map((r) => (
            <View key={r.position} style={styles.row} accessible accessibilityLabel={`${r.label}: ${formatCurrency(r.amount)}`}>
              <View style={styles.icon}>
                <RewardIcon position={r.position} />
              </View>
              <AppText style={styles.label}>{r.label}</AppText>
              <AppText style={styles.amount}>{formatCurrency(r.amount, { spaced: true })}</AppText>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  list: { gap: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
  },
  icon: { width: 32, alignItems: 'center' },
  label: { flex: 1, fontFamily: fonts.medium, fontSize: 13, color: colors.text, marginLeft: spacing.sm },
  amount: { fontFamily: fonts.semibold, fontSize: 16, color: colors.primaryText },
});
