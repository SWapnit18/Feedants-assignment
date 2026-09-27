import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

export default function AdBanner() {
  return (
    <View style={styles.banner}>
      <Text style={styles.icon}>📢</Text>
      <Text style={styles.text}>Ad Here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFBFD',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: radius.md,
    paddingVertical: spacing(2.5),
    marginHorizontal: spacing(4),
    marginTop: spacing(3),
  },
  icon: {
    fontSize: 13,
    marginRight: 6,
    opacity: 0.6,
  },
  text: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
