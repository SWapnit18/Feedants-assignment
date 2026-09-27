import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useQueryClient } from '@tanstack/react-query';
import {
  AdSlot,
  BottomTabBar,
  CompetitionSkeleton,
  CompetitionSummaryCard,
  CountdownBanner,
  DemoControlsSheet,
  DisclaimerBar,
  ErrorState,
  ImportantDates,
  InfoTabs,
  JudgeCard,
  PaymentInfoCards,
  PaymentSheet,
  PreviousWinners,
  PrimaryCTA,
  ReferralCard,
  RewardsList,
  ScreenHeader,
  SubmissionSheet,
  TestimonialsRow,
  TestimonialsSheet,
  VideoModal,
  useToast,
  type MediaItem,
} from '../components';
import { invalidateCompetition, useAvailability, useCompetition, useReferral } from '../api/hooks';
import { useCompetitionActions } from '../hooks/useCompetitionActions';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n';
import { colors, spacing } from '../theme';
import type { PrimaryAction } from '../api/types';

const FALLBACK_ACTION: PrimaryAction = { type: 'login', enabled: true, label: '', subLabel: null };

export function CompetitionDetailsScreen({
  slug,
  onChangeSlug,
}: {
  slug: string;
  onChangeSlug: (slug: string) => void;
}) {
  const { t, lang, errorMessage, hydrated } = useI18n();
  const auth = useAuth();
  const toast = useToast();
  const qc = useQueryClient();

  const competitionQuery = useCompetition(slug, lang);
  const data = competitionQuery.data;
  const availabilityQuery = useAvailability(data?.competition.id, slug, lang);
  const referralQuery = useReferral();

  const [media, setMedia] = useState<MediaItem | null>(null);
  const [testimonialsOpen, setTestimonialsOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const actions = useCompetitionActions(data, setMedia);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        competitionQuery.refetch(),
        availabilityQuery.refetch(),
        auth.user ? referralQuery.refetch() : Promise.resolve(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [competitionQuery, availabilityQuery, referralQuery, auth.user]);

  const onDeadlineElapsed = useCallback(() => {
    void invalidateCompetition(qc);
  }, [qc]);

  const onBack = () => Alert.alert(t('goBack'), t('goBackHint'));
  const comingSoon = () => toast(t('comingSoon'), 'info');

  let body: React.ReactNode;
  if (!hydrated || !auth.ready || (competitionQuery.isPending && !data)) {
    body = <CompetitionSkeleton />;
  } else if (!data) {
    body = (
      <ErrorState
        title={t('loadErrorTitle')}
        message={errorMessage(competitionQuery.error)}
        retryLabel={t('retry')}
        retrying={competitionQuery.isFetching}
        onRetry={() => void competitionQuery.refetch()}
      />
    );
  } else {
    const { competition, availability, lifecycle, viewer } = data;
    body = (
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
      >
        <CompetitionSummaryCard
          competition={competition}
          availability={availability}
          registration={viewer?.registration}
          onLongPressTitle={() => setDemoOpen(true)}
        />
        <JudgeCard
          judge={competition.judge}
          onPlayIntro={() =>
            setMedia({ url: competition.judge.introVideoUrl, title: competition.judge.name, subtitle: t('introVideo') })
          }
        />
        <CountdownBanner
          nextDeadline={lifecycle.nextDeadline}
          clockOffsetMs={data.clockOffsetMs}
          onElapsed={onDeadlineElapsed}
        />
        <ImportantDates dates={competition.dates} />
        <PreviousWinners
          winners={competition.previousWinners}
          onPlay={(w) => setMedia({ url: w.videoUrl, title: w.name, subtitle: w.positionLabel })}
        />
        <InfoTabs key={`${competition.id}-${lang}`} tabs={competition.tabs} />
        <RewardsList rewards={competition.rewards} />
        <DisclaimerBar text={competition.disclaimer} />
        <PaymentInfoCards
          onWatchPrizeVideo={
            competition.prizeInfoVideoUrl
              ? () => setMedia({ url: competition.prizeInfoVideoUrl, title: t('prizeMoneyTitle') })
              : undefined
          }
          onRefundPolicy={() => Alert.alert(t('refundPolicy'), competition.refundPolicy)}
          showRazorpay={competition.paymentProvider === 'razorpay'}
        />
        <ReferralCard
          referral={referralQuery.data}
          loading={!!auth.user && referralQuery.isPending}
          competitionTitle={competition.title}
          onLoginPress={() => void auth.login().catch((e: unknown) => toast(errorMessage(e), 'error'))}
        />
        <TestimonialsRow onPress={() => setTestimonialsOpen(true)} />
        <AdSlot ad={competition.ad} />
      </ScrollView>
    );
  }

  const primaryAction = data ? data.viewer?.primaryAction ?? data.anonymousAction ?? FALLBACK_ACTION : null;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <ScreenHeader onBack={onBack} />
      <View style={styles.body}>{body}</View>
      {data && primaryAction ? (
        <PrimaryCTA
          action={primaryAction}
          entryFee={data.competition.entryFee}
          busy={actions.ctaBusy}
          onPress={actions.onPrimaryAction}
        />
      ) : null}
      <BottomTabBar
        active="competitions"
        avatarUrl={auth.user?.avatarUrl}
        userName={auth.user?.name}
        onTabPress={(tab) => (tab === 'profile' ? setDemoOpen(true) : tab === 'competitions' ? undefined : comingSoon())}
        onCreatePress={comingSoon}
      />

      {data ? (
        <>
          <PaymentSheet {...actions.payment} competitionTitle={data.competition.title} clockOffsetMs={data.clockOffsetMs} />
          <SubmissionSheet {...actions.submission} />
          <TestimonialsSheet
            visible={testimonialsOpen}
            competitionId={data.competition.id}
            onClose={() => setTestimonialsOpen(false)}
          />
        </>
      ) : null}
      <DemoControlsSheet visible={demoOpen} onClose={() => setDemoOpen(false)} currentSlug={slug} onSelectSlug={onChangeSlug} />
      <VideoModal media={media} onClose={() => setMedia(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs, paddingBottom: spacing.lg, gap: spacing.md },
});
