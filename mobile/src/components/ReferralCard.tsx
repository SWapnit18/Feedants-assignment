import React, { useEffect, useState } from 'react';
import { Pressable, Share, StyleSheet, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from './Card';
import { AppText } from './AppText';
import { Button } from './Button';
import { SkeletonBlock } from './Skeleton';
import { colors, fonts, radius, spacing } from '../theme';
import { useI18n } from '../i18n';
import { useToast } from './Toast';
import { formatCurrency } from '../utils/format';
import type { ReferralResponse } from '../api/types';

export interface ReferralCardProps {
  referral: ReferralResponse | undefined;
  loading: boolean;
  competitionTitle: string;
  onLoginPress?: () => void;
}

export function ReferralCard({ referral, loading, competitionTitle, onLoginPress }: ReferralCardProps) {
  const { t } = useI18n();
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  const copy = async () => {
    if (!referral) return;
    await Clipboard.setStringAsync(referral.link);
    setCopied(true);
    toast(t('linkCopied'), 'success');
  };

  const share = async () => {
    if (!referral) return;
    try {
      await Share.share({
        message: t('shareMessage', { title: competitionTitle, link: referral.link }),
        url: referral.link,
      });
    } catch {
      // user dismissed / share unavailable – nothing to do
    }
  };

  return (
    <Card tone="mint" style={styles.card}>
      <MaterialCommunityIcons name="bullhorn-outline" size={40} color={colors.primary} style={styles.icon} />
      <View style={styles.main}>
        <AppText style={styles.title} numberOfLines={2}>
          {t('referTitle')}
        </AppText>
        {loading ? (
          <SkeletonBlock height={30} />
        ) : referral ? (
          <View style={styles.linkBox}>
            <AppText style={styles.link} numberOfLines={1} ellipsizeMode="middle" selectable>
              {referral.link}
            </AppText>
            <Pressable onPress={copy} style={styles.copyBtn} accessibilityRole="button" accessibilityLabel={t('copyLink')}>
              <AppText style={styles.copyText}>{copied ? t('copied') : t('copyLink')}</AppText>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={onLoginPress} accessibilityRole="button">
            <AppText variant="caption" color={colors.primaryText}>
              {t('referralLoginHint')}
            </AppText>
          </Pressable>
        )}
      </View>
      <View style={styles.side}>
        <Button label={t('referNow')} size="sm" onPress={share} disabled={!referral} style={styles.referBtn} />
        {referral ? (
          <AppText variant="tiny" color={colors.primaryText} style={styles.earn} numberOfLines={2}>
            {t('youEarn')}{' '}
            <AppText style={styles.earnAmount}>{formatCurrency(referral.rewardPerSignup)}</AppText> {t('forEverySignup')}
          </AppText>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md },
  icon: { transform: [{ rotate: '-12deg' }] },
  main: { flex: 1, gap: 6 },
  title: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18, color: colors.text },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    paddingLeft: spacing.sm,
    minHeight: 32,
  },
  link: { flex: 1, fontFamily: fonts.regular, fontSize: 11, color: colors.textSecondary },
  copyBtn: {
    borderLeftWidth: 1,
    borderLeftColor: colors.borderStrong,
    paddingHorizontal: spacing.sm,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  copyText: { fontFamily: fonts.semibold, fontSize: 11, color: colors.primaryText },
  side: { width: 112, alignItems: 'center', gap: 4 },
  referBtn: { alignSelf: 'stretch' },
  earn: { textAlign: 'center', fontFamily: fonts.regular },
  earnAmount: { fontFamily: fonts.semibold, fontSize: 12, color: colors.primaryText },
});
