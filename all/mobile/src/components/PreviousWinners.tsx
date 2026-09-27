import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Card } from './Card';
import { AppText } from './AppText';
import { SectionHeader } from './SectionHeader';
import { PlayButton } from './PlayButton';
import { colors, fonts, radius, spacing } from '../theme';
import { useI18n } from '../i18n';
import { resolveMediaUrl } from '../api/client';
import type { PreviousWinner } from '../api/types';

function WinnerItem({ winner, onPress }: { winner: PreviousWinner; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.item, pressed && { opacity: 0.8 }]}
      accessibilityRole="button"
      accessibilityLabel={`${winner.name}, ${winner.positionLabel}. Play video`}
    >
      <View>
        <Image source={{ uri: resolveMediaUrl(winner.thumbnailUrl) }} style={styles.thumb} contentFit="cover" transition={150} />
        <View style={styles.play}>
          <PlayButton size={24} variant="overlay" />
        </View>
      </View>
      <View style={styles.meta}>
        <AppText style={styles.name} numberOfLines={1}>
          {winner.name}
        </AppText>
        <AppText variant="caption" color={colors.primaryText} numberOfLines={1}>
          {winner.positionLabel}
        </AppText>
      </View>
    </Pressable>
  );
}

export function PreviousWinners({ winners, onPlay }: { winners: PreviousWinner[]; onPlay: (w: PreviousWinner) => void }) {
  const { t } = useI18n();
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <SectionHeader title={t('previousWinners')} />
      </View>
      {winners.length === 0 ? (
        <AppText variant="label" style={styles.empty}>
          {t('noPreviousWinners')}
        </AppText>
      ) : (
        <FlatList
          horizontal
          data={winners}
          keyExtractor={(w) => w.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <WinnerItem winner={item} onPress={() => onPlay(item)} />}
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { paddingHorizontal: 0, paddingBottom: spacing.md },
  header: { paddingHorizontal: spacing.lg },
  list: { paddingHorizontal: spacing.md, gap: spacing.sm },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    width: 158,
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  thumb: { width: 80, height: 76, borderRadius: radius.md, backgroundColor: colors.border },
  play: { position: 'absolute', right: 6, bottom: 6 },
  meta: { flex: 1, gap: 2 },
  name: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 17, color: colors.text },
  empty: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xs },
});
