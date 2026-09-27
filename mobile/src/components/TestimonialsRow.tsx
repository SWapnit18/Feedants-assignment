import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { AppText } from './AppText';
import { colors, fonts, spacing } from '../theme';
import { useI18n } from '../i18n';

export function TestimonialsRow({ onPress }: { onPress: () => void }) {
  const { t } = useI18n();
  return (
    <Card padded={false}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
        accessibilityRole="button"
        accessibilityLabel={t('hearFromUsers')}
      >
        <View style={styles.iconWrap}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.text} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText style={styles.title}>{t('hearFromUsers')}</AppText>
          <AppText variant="tiny" style={{ fontFamily: fonts.regular }}>
            {t('hearFromUsersSub')}
          </AppText>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.text} />
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18, color: colors.text },
});
