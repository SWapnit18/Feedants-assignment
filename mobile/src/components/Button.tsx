import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { colors, fonts, radius } from '../theme';

export interface ButtonProps {
  label: string;
  subLabel?: string | null;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}

/** Shared button. Disabled while loading so double taps can’t fire a mutation twice. */
export function Button({
  label,
  subLabel,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  icon,
  style,
  accessibilityHint,
}: ButtonProps) {
  const inactive = disabled || loading;
  const isPrimary = variant === 'primary' || variant === 'danger';
  const fg = isPrimary ? colors.white : variant === 'outline' ? colors.primaryText : colors.primaryText;

  return (
    <Pressable
      onPress={inactive ? undefined : onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      accessibilityLabel={subLabel ? `${label}, ${subLabel}` : label}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        variant === 'primary' && styles.primary,
        variant === 'danger' && styles.danger,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        disabled && isPrimary && styles.primaryDisabled,
        disabled && !isPrimary && styles.dim,
        pressed && !inactive && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.content}>
          {icon}
          <View style={styles.labels}>
            <AppText
              style={[styles.label, size === 'sm' && styles.labelSm, size === 'lg' && styles.labelLg]}
              color={fg}
              numberOfLines={1}
            >
              {label}
            </AppText>
            {subLabel ? (
              <AppText variant="caption" color={isPrimary ? 'rgba(255,255,255,0.85)' : colors.textMuted} numberOfLines={1}>
                {subLabel}
              </AppText>
            ) : null}
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  sm: { minHeight: 32, paddingHorizontal: 10, borderRadius: radius.sm },
  md: { minHeight: 42 },
  lg: { minHeight: 52 },
  primary: { backgroundColor: colors.primary },
  danger: { backgroundColor: colors.danger },
  primaryDisabled: { backgroundColor: colors.primaryDisabled },
  outline: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong },
  ghost: { backgroundColor: 'transparent' },
  dim: { opacity: 0.5 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  labels: { alignItems: 'center' },
  label: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
  labelSm: { fontSize: 12, lineHeight: 16 },
  labelLg: { fontSize: 15, lineHeight: 21 },
});
