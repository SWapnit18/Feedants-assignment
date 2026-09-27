import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '../BottomSheet';
import { AppText } from '../AppText';
import { Avatar } from '../Avatar';
import { Button } from '../Button';
import { colors, fonts, radius, spacing } from '../../theme';
import { useI18n } from '../../i18n';
import { useTestimonials } from '../../api/hooks';

function Stars({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 1 }} accessibilityLabel={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={rating >= i ? 'star' : rating >= i - 0.5 ? 'star-half' : 'star-outline'}
          size={13}
          color={colors.gold}
        />
      ))}
    </View>
  );
}

export function TestimonialsSheet({ visible, competitionId, onClose }: { visible: boolean; competitionId?: string; onClose: () => void }) {
  const { t, lang, errorMessage } = useI18n();
  const q = useTestimonials(competitionId, lang, visible);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t('hearFromUsers')} subtitle={t('hearFromUsersSub')}>
      {q.isPending ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.xxl }} />
      ) : q.isError ? (
        <View style={styles.center}>
          <AppText variant="label">{errorMessage(q.error)}</AppText>
          <Button label={t('retry')} variant="outline" size="sm" onPress={() => q.refetch()} />
        </View>
      ) : (
        <FlatList
          data={q.data.items}
          keyExtractor={(i) => i.id}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          ListEmptyComponent={<AppText variant="label" style={styles.emptyText}>{t('noTestimonials')}</AppText>}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.head}>
                <Avatar uri={item.avatarUrl} name={item.name} size={36} />
                <View style={{ flex: 1 }}>
                  <AppText style={styles.name}>{item.name}</AppText>
                  <Stars rating={item.rating} />
                </View>
              </View>
              <AppText variant="body">{item.text}</AppText>
            </View>
          )}
        />
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  emptyText: { textAlign: 'center', paddingVertical: spacing.xl },
  item: { backgroundColor: colors.background, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  name: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text },
});
