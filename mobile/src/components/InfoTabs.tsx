import React, { useState } from 'react';
import { LayoutAnimation, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { AppText } from './AppText';
import { colors, fonts, spacing } from '../theme';
import { useI18n, type TranslationKey } from '../i18n';
import type { CompetitionTabs } from '../api/types';

type TabKey = 'about' | 'judgingParameters' | 'rulesAndEligibility';
const TABS: { key: TabKey; label: TranslationKey }[] = [
  { key: 'about', label: 'tabAbout' },
  { key: 'judgingParameters', label: 'tabJudging' },
  { key: 'rulesAndEligibility', label: 'tabRules' },
];

const COLLAPSED_LINES = 3;

/** "About / Judging Parameters / Rules & Eligibility" with a shared "View more" expander. */
export function InfoTabs({ tabs }: { tabs: CompetitionTabs }) {
  const { t } = useI18n();
  const [active, setActive] = useState<TabKey>('about');
  const [expanded, setExpanded] = useState(false);

  const lines: string[] =
    active === 'about'
      ? tabs.about.split('\n').map((l) => l.trim()).filter(Boolean)
      : tabs[active].map((item) => `•  ${item}`);
  const aboutChars = active === 'about' ? tabs.about.length : 0;
  const canExpand = lines.length > COLLAPSED_LINES || aboutChars > 180;
  const visible = expanded ? lines : lines.slice(0, COLLAPSED_LINES);

  const select = (key: TabKey) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActive(key);
    setExpanded(false);
  };
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  return (
    <Card style={styles.card}>
      <View style={styles.tabBar} accessibilityRole="tablist">
        {TABS.map((tab) => {
          const selected = tab.key === active;
          return (
            <Pressable
              key={tab.key}
              onPress={() => select(tab.key)}
              style={[styles.tab, selected && styles.tabActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
            >
              <AppText
                style={[styles.tabText, selected && styles.tabTextActive]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {t(tab.label)}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.body}>
        {lines.length === 0 ? (
          <AppText variant="body">{t('nothingHere')}</AppText>
        ) : active === 'about' ? (
          <AppText variant="body" numberOfLines={expanded ? undefined : COLLAPSED_LINES}>
            {lines.join('\n')}
          </AppText>
        ) : (
          visible.map((line, i) => (
            <AppText key={`${active}-${i}`} variant="body">
              {line}
            </AppText>
          ))
        )}
      </View>

      {canExpand ? (
        <Pressable onPress={toggle} style={styles.more} hitSlop={8} accessibilityRole="button">
          <AppText style={styles.moreText}>{expanded ? t('viewLess') : t('viewMore')}</AppText>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.primaryText} />
        </Pressable>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { paddingTop: spacing.xs },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: 2,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.textSecondary },
  tabTextActive: { fontFamily: fonts.semibold, color: colors.primaryText },
  body: { paddingTop: spacing.md, gap: 2 },
  more: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center', gap: 4, marginTop: spacing.sm },
  moreText: { fontFamily: fonts.medium, fontSize: 13, color: colors.primaryText },
});
