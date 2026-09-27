import React from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors, fonts, radius, spacing } from '../theme';
import { useI18n } from '../i18n';
import { resolveMediaUrl } from '../api/client';
import type { Ad } from '../api/types';

/** Renders the sponsor creative when the API returns one, otherwise the dashed "Ad Here" placeholder. */
export function AdSlot({ ad }: { ad: Ad | null }) {
  const { t } = useI18n();
  if (ad) {
    return (
      <Pressable
        onPress={() => Linking.openURL(ad.targetUrl).catch(() => undefined)}
        style={styles.ad}
        accessibilityRole="link"
        accessibilityLabel={ad.label}
      >
        <Image source={{ uri: resolveMediaUrl(ad.imageUrl) }} style={styles.image} contentFit="cover" />
        <View style={styles.tag}>
          <AppText variant="tiny" color={colors.white}>
            {t('sponsored')}
          </AppText>
        </View>
      </Pressable>
    );
  }
  return (
    <View style={styles.placeholder} accessibilityLabel={t('adHere')}>
      <MaterialCommunityIcons name="bullhorn-outline" size={20} color={colors.textMuted} />
      <AppText style={styles.text}>{t('adHere')}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  text: { fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted },
  ad: { borderRadius: radius.md, overflow: 'hidden', height: 90, backgroundColor: colors.border },
  image: { width: '100%', height: '100%' },
  tag: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
});
