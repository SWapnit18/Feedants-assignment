import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors, spacing } from '../theme';

export function SectionHeader({ title, suffix, right }: { title: string; suffix?: string; right?: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <AppText variant="subheading" accessibilityRole="header">
        {title}
        {suffix ? (
          <AppText variant="label" color={colors.textSecondary}>
            {'   '}
            {suffix}
          </AppText>
        ) : null}
      </AppText>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
});
