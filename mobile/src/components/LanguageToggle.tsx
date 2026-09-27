import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors, fonts, radius } from '../theme';
import { useI18n } from '../i18n';
import type { Lang } from '../api/types';

/** ENG / हिंदी segmented control. Persists choice and drives both UI strings and ?lang= on the API. */
export function LanguageToggle() {
  const { lang, setLang, t } = useI18n();
  const options: { value: Lang; label: string }[] = [
    { value: 'en', label: t('langEn') },
    { value: 'hi', label: t('langHi') },
  ];
  return (
    <View style={styles.track} accessibilityRole="tablist">
      {options.map((o) => {
        const active = o.value === lang;
        return (
          <Pressable
            key={o.value}
            onPress={() => setLang(o.value)}
            style={[styles.segment, active && styles.active]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <AppText style={styles.label} color={active ? colors.white : colors.textSecondary}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    padding: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  segment: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: radius.pill, minWidth: 56, alignItems: 'center' },
  active: { backgroundColor: colors.primary },
  label: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18 },
});
