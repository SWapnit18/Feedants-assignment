import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors, fonts, radius, spacing } from '../theme';
import { useI18n } from '../i18n';

export function DisclaimerBar({ text }: { text: string }) {
  const { t } = useI18n();
  if (!text) return null;
  return (
    <View style={styles.bar}>
      <Ionicons name="information-circle-outline" size={20} color={colors.primaryText} />
      <AppText variant="caption" color={colors.text} style={{ flex: 1 }}>
        <AppText variant="caption" style={styles.strong}>
          {t('disclaimer')}{' '}
        </AppText>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryTint,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  strong: { fontFamily: fonts.semibold, color: colors.primaryText },
});
