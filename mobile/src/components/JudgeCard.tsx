import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card } from './Card';
import { Avatar } from './Avatar';
import { AppText } from './AppText';
import { PlayButton } from './PlayButton';
import { colors, fonts, spacing } from '../theme';
import { useI18n } from '../i18n';
import type { Judge } from '../api/types';

export function JudgeCard({ judge, onPlayIntro }: { judge: Judge; onPlayIntro: () => void }) {
  const { t } = useI18n();
  return (
    <Card style={styles.card}>
      <Avatar uri={judge.avatarUrl} name={judge.name} size={86} />
      <View style={styles.info}>
        <AppText variant="caption">{t('judge')}</AppText>
        <AppText style={styles.name} numberOfLines={1}>
          {judge.name}
        </AppText>
        <AppText variant="label" numberOfLines={2}>
          {judge.title}
        </AppText>
        <AppText variant="label">{t('yearsExperience', { n: judge.experienceYears })}</AppText>
      </View>
      {judge.introVideoUrl ? (
        <Pressable
          onPress={onPlayIntro}
          style={({ pressed }) => [styles.intro, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel={`${t('introVideo')} – ${judge.name}`}
          hitSlop={8}
        >
          <PlayButton size={46} />
          <AppText variant="label">{t('introVideo')}</AppText>
        </Pressable>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, paddingVertical: spacing.md + 2 },
  info: { flex: 1, gap: 1 },
  name: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 23, color: colors.text },
  intro: { alignItems: 'center', gap: 6, paddingLeft: spacing.xs },
});
