import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors, radius } from '../theme';

export function Chip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <AppText variant="caption" color={colors.text} style={styles.text}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  text: { fontSize: 12 },
});
