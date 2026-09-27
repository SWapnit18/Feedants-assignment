import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { LanguageToggle } from './LanguageToggle';
import { colors, fonts, spacing } from '../theme';
import { useI18n } from '../i18n';

export function ScreenHeader({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onBack}
        hitSlop={10}
        style={styles.back}
        accessibilityRole="button"
        accessibilityLabel={t('goBack')}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text} />
        <AppText style={styles.backText}>{t('goBack')}</AppText>
      </Pressable>
      <LanguageToggle />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  back: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  backText: { fontFamily: fonts.medium, fontSize: 17, color: colors.text },
});
