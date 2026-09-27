import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { Button } from './Button';
import { colors, spacing } from '../theme';

export function ErrorState({
  title,
  message,
  retryLabel,
  onRetry,
  retrying,
}: {
  title: string;
  message: string;
  retryLabel: string;
  onRetry: () => void;
  retrying?: boolean;
}) {
  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <View style={styles.icon}>
        <Ionicons name="cloud-offline-outline" size={36} color={colors.primary} />
      </View>
      <AppText variant="title" align="center">
        {title}
      </AppText>
      <AppText variant="body" align="center">
        {message}
      </AppText>
      <Button label={retryLabel} onPress={onRetry} loading={retrying} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxxl, gap: spacing.md },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  button: { minWidth: 160, marginTop: spacing.sm },
});
