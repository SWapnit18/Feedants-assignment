import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { Avatar } from './Avatar';
import { colors, fonts, radius, spacing } from '../theme';
import { useI18n, type TranslationKey } from '../i18n';

type TabId = 'home' | 'explore' | 'competitions' | 'profile';

export interface BottomTabBarProps {
  active: TabId;
  avatarUrl?: string | null;
  userName?: string;
  onTabPress: (tab: TabId) => void;
  onCreatePress: () => void;
}

const TABS: { id: Exclude<TabId, 'profile'>; label: TranslationKey; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'home', label: 'tabHome', icon: 'home', activeIcon: 'home' },
  { id: 'explore', label: 'tabExplore', icon: 'search-outline', activeIcon: 'search' },
  { id: 'competitions', label: 'tabCompetitions', icon: 'trophy-outline', activeIcon: 'trophy' },
];

export function BottomTabBar({ active, avatarUrl, userName, onTabPress, onCreatePress }: BottomTabBarProps) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  const renderTab = (tab: (typeof TABS)[number]) => {
    const selected = tab.id === active;
    return (
      <Pressable
        key={tab.id}
        style={styles.tab}
        onPress={() => onTabPress(tab.id)}
        accessibilityRole="tab"
        accessibilityState={{ selected }}
      >
        <Ionicons name={selected ? tab.activeIcon : tab.icon} size={24} color={selected ? colors.primary : colors.textFaint} />
        <AppText style={[styles.label, selected && styles.labelActive]} numberOfLines={1}>
          {t(tab.label)}
        </AppText>
      </Pressable>
    );
  };

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]} accessibilityRole="tablist">
      {renderTab(TABS[0])}
      {renderTab(TABS[1])}
      <View style={styles.tab}>
        <Pressable onPress={onCreatePress} style={styles.create} accessibilityRole="button" accessibilityLabel="Create">
          <Ionicons name="add-circle-outline" size={30} color={colors.white} />
        </Pressable>
      </View>
      {renderTab(TABS[2])}
      <Pressable
        style={styles.tab}
        onPress={() => onTabPress('profile')}
        accessibilityRole="tab"
        accessibilityLabel={t('tabProfile')}
        accessibilityHint={t('switchUser')}
      >
        <Avatar uri={avatarUrl} name={userName ?? '?'} size={28} ring={active === 'profile'} />
        <AppText style={styles.label}>{t('tabProfile')}</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  label: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 14, color: colors.textMuted },
  labelActive: { color: colors.primary, fontFamily: fonts.semibold },
  create: {
    width: 56,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
});
