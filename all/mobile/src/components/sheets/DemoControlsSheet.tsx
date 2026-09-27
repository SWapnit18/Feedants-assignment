import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '../BottomSheet';
import { AppText } from '../AppText';
import { Avatar } from '../Avatar';
import { Button } from '../Button';
import { useToast } from '../Toast';
import { colors, fonts, radius, spacing } from '../../theme';
import { useI18n } from '../../i18n';
import { useAuth } from '../../auth/AuthProvider';
import { useDemoUsers } from '../../api/hooks';
import { API_BASE_URL } from '../../api/client';
import type { DemoUser } from '../../api/types';

export const DEMO_COMPETITIONS: { slug: string; note: string }[] = [
  { slug: 'feedants-classical-dance', note: 'Main · registration + submission open' },
  { slug: 'feedants-bharatanatyam-open', note: 'Full (20/20)' },
  { slug: 'feedants-folk-fest', note: 'Registration closed / judging' },
  { slug: 'feedants-kathak-finals', note: 'Results announced' },
  { slug: 'feedants-free-freestyle', note: 'Free entry (₹0)' },
];

/** Seeded personas shown first; the backend also returns filler users (participant1..20) for load demos. */
const NAMED_EMAILS = ['amit@feedants.dev', 'priya@feedants.dev', 'rahul@feedants.dev', 'sneha@feedants.dev'];

export interface DemoControlsSheetProps {
  visible: boolean;
  onClose: () => void;
  currentSlug: string;
  onSelectSlug: (slug: string) => void;
}

/** Reviewer tool: switch between seeded users (multi-user concurrency) and seeded competitions (all states). */
export function DemoControlsSheet({ visible, onClose, currentSlug, onSelectSlug }: DemoControlsSheetProps) {
  const { t, errorMessage } = useI18n();
  const toast = useToast();
  const auth = useAuth();
  const users = useDemoUsers(visible);
  const [switching, setSwitching] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const all = users.data?.users ?? [];
  const named = NAMED_EMAILS.map((e) => all.find((u) => u.email === e)).filter((u): u is DemoUser => !!u);
  const others = all.filter((u) => !NAMED_EMAILS.includes(u.email));
  // Always keep the current user visible even if it's a filler account.
  const visibleUsers = showAll ? [...named, ...others] : [...named, ...others.filter((u) => u.email === auth.email)];

  const switchTo = async (email: string, name: string) => {
    if (switching || email === auth.email) return;
    setSwitching(email);
    try {
      await auth.login(email);
      toast(t('switchedTo', { name }), 'success');
      onClose();
    } catch (e) {
      toast(errorMessage(e), 'error');
    } finally {
      setSwitching(null);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={t('demoTitle')}
      subtitle={auth.user ? t('signedInAs', { name: auth.user.name }) : t('notSignedIn')}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppText style={styles.section}>{t('switchUser')}</AppText>
        {users.isPending ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
        ) : users.isError ? (
          <View style={styles.errorRow}>
            <AppText variant="label" style={{ flex: 1 }}>
              {errorMessage(users.error)}
            </AppText>
            <Button label={t('retry')} variant="outline" size="sm" onPress={() => users.refetch()} />
          </View>
        ) : (
          visibleUsers.map((u) => {
            const current = u.email === auth.email;
            return (
              <Pressable
                key={u.id}
                onPress={() => switchTo(u.email, u.name)}
                style={({ pressed }) => [styles.row, current && styles.rowActive, pressed && { opacity: 0.7 }]}
                accessibilityRole="button"
                accessibilityState={{ selected: current, busy: switching === u.email }}
              >
                <Avatar uri={u.avatarUrl} name={u.name} size={36} />
                <View style={{ flex: 1 }}>
                  <AppText style={styles.name}>{u.name}</AppText>
                  <AppText variant="caption">{u.email}</AppText>
                </View>
                {switching === u.email ? (
                  <ActivityIndicator color={colors.primary} />
                ) : current ? (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                ) : null}
              </Pressable>
            );
          })
        )}

        {others.length > 0 ? (
          <Pressable onPress={() => setShowAll((v) => !v)} style={styles.more} accessibilityRole="button">
            <AppText style={styles.moreText}>
              {showAll ? t('hideMoreUsers') : t('showMoreUsers', { n: others.length })}
            </AppText>
            <Ionicons name={showAll ? 'chevron-up' : 'chevron-down'} size={16} color={colors.primaryText} />
          </Pressable>
        ) : null}

        <AppText style={[styles.section, { marginTop: spacing.lg }]}>{t('switchCompetition')}</AppText>
        {DEMO_COMPETITIONS.map((c) => {
          const current = c.slug === currentSlug;
          return (
            <Pressable
              key={c.slug}
              onPress={() => {
                onSelectSlug(c.slug);
                onClose();
              }}
              style={({ pressed }) => [styles.row, current && styles.rowActive, pressed && { opacity: 0.7 }]}
              accessibilityRole="button"
              accessibilityState={{ selected: current }}
            >
              <Ionicons name="trophy-outline" size={20} color={colors.primaryText} />
              <View style={{ flex: 1 }}>
                <AppText style={styles.name}>{c.slug}</AppText>
                <AppText variant="caption">{c.note}</AppText>
              </View>
              {current ? <Ionicons name="checkmark-circle" size={22} color={colors.primary} /> : null}
            </Pressable>
          );
        })}
        <AppText variant="tiny" style={styles.api}>
          API: {API_BASE_URL}
        </AppText>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  section: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textSecondary, marginBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  rowActive: { borderColor: colors.primary, backgroundColor: colors.primaryTint },
  name: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  more: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: spacing.xs },
  moreText: { fontFamily: fonts.medium, fontSize: 13, color: colors.primaryText },
  api: { textAlign: 'center', marginTop: spacing.md, fontFamily: fonts.regular },
});
