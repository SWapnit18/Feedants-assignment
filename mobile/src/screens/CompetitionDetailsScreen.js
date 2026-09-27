import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCompetitionDetails, useRegister, useUploadSubmission } from '../hooks/useCompetitionDetails';
import { computeServerOffsetMs } from '../utils/dateUtils';
import { colors, radius, spacing } from '../theme';

import CompetitionHeaderCard from '../components/CompetitionHeaderCard';
import JudgeCard from '../components/JudgeCard';
import CountdownBanner from '../components/CountdownBanner';
import ImportantDatesCard from '../components/ImportantDatesCard';
import PreviousWinners from '../components/PreviousWinners';
import TabsSection from '../components/TabsSection';
import RewardsList from '../components/RewardsList';
import AssuranceCard from '../components/AssuranceCard';
import ReferEarnCard from '../components/ReferEarnCard';
import UserFeedbackCard from '../components/UserFeedbackCard';
import AdBanner from '../components/AdBanner';
import BottomActionBar from '../components/BottomActionBar';
import BottomNavBar from '../components/BottomNavBar';
import SubmissionModal from '../components/SubmissionModal';
import PolicyModal from '../components/PolicyModal';

export default function CompetitionDetailsScreen({ route, navigation }) {
  const competitionId = route?.params?.competitionId;
  const { data: competition, isLoading, isError, error, refetch, isRefetching } =
    useCompetitionDetails(competitionId);

  const registerMutation = useRegister(competitionId);
  const submitMutation = useUploadSubmission(competitionId);

  const [busyAction, setBusyAction] = useState(null);
  const [submissionModalVisible, setSubmissionModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('ENG');
  const [activeBottomNavTab, setActiveBottomNavTab] = useState('competitions');
  const [policyModalVisible, setPolicyModalVisible] = useState(false);
  const [activePolicyType, setActivePolicyType] = useState('refund');

  const serverOffsetMs = useMemo(
    () => (competition ? computeServerOffsetMs(competition.dates.serverTime) : 0),
    [competition?.dates?.serverTime]
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading competition details...</Text>
      </SafeAreaView>
    );
  }

  if (isError || !competition) {
    return (
      <SafeAreaView style={styles.centered}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Text style={styles.errorTitle}>Unable to load competition</Text>
        <Text style={styles.errorText}>
          {error?.message || 'Please check your connection and try again.'}
        </Text>
        <TouchableOpacity onPress={refetch} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleAction = async (actionType) => {
    try {
      if (actionType === 'REGISTER') {
        setBusyAction('REGISTER');
        await registerMutation.mutateAsync({});
        Alert.alert('Registration Successful! 🎉', "You're registered for Feedants Classical Dance!");
      } else if (actionType === 'SUBMIT' || actionType === 'RESUBMIT') {
        setSubmissionModalVisible(true);
      } else if (actionType === 'VIEW_RESULTS') {
        Alert.alert('Results Declared', 'Winners have been announced on the leaderboard!');
      }
    } catch (err) {
      Alert.alert('Notice', err.message || 'Please try again.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleModalSubmit = async (submissionData) => {
    try {
      setBusyAction('SUBMITTING');
      await submitMutation.mutateAsync({
        mediaUrl: submissionData.mediaUrl,
        mediaType: submissionData.mediaType,
      });
      setSubmissionModalVisible(false);
      Alert.alert('Entry Submitted! 🌟', 'Your performance entry has been successfully submitted for judging.');
    } catch (err) {
      Alert.alert('Submission Error', err.message || 'Could not upload submission.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleBottomNav = (tabKey) => {
    setActiveBottomNavTab(tabKey);
    if (tabKey !== 'competitions') {
      Alert.alert(
        tabKey.toUpperCase(),
        `Navigating to ${tabKey} tab.`
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header with Back Button and Language Pill Toggle */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack?.()}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>Go back</Text>
        </TouchableOpacity>

        {/* Language selector toggle: ENG | हिंदी */}
        <View style={styles.languageToggle}>
          <TouchableOpacity
            style={[
              styles.langOption,
              selectedLanguage === 'ENG' && styles.langOptionActive,
            ]}
            onPress={() => setSelectedLanguage('ENG')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.langText,
                selectedLanguage === 'ENG' && styles.langTextActive,
              ]}
            >
              ENG
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.langOption,
              selectedLanguage === 'हिंदी' && styles.langOptionActive,
            ]}
            onPress={() => setSelectedLanguage('हिंदी')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.langText,
                selectedLanguage === 'हिंदी' && styles.langTextActive,
              ]}
            >
              हिंदी
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content matching design cards */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header Card with Title, Tags, Prize Pool, Entry Fee & Spots */}
        <CompetitionHeaderCard competition={competition} />

        {/* 2. Judge Card with photo, credentials & Intro Video button */}
        <JudgeCard judge={competition.judge} />

        {/* 3. Live Countdown Banner */}
        <CountdownBanner
          state={competition.state}
          targetAt={competition.countdownTargetAt}
          serverOffsetMs={serverOffsetMs}
          onExpire={refetch}
        />

        {/* 4. Important Dates 2x2 Grid */}
        <ImportantDatesCard dates={competition.dates} />

        {/* 5. Previous Winners Horizontal Showcase */}
        <PreviousWinners winners={competition.previousWinners} />

        {/* 6. Tabs Section (About / Judging / Rules) */}
        <TabsSection
          about={competition.about}
          judgingParameters={competition.judgingParameters}
          rulesAndEligibility={competition.rulesAndEligibility}
        />

        {/* 7. Rewards Breakdown (All 6 Positions) + Disclaimer */}
        <RewardsList
          rewards={competition.rewards}
          currency={competition.currency}
          disclaimerText={competition.disclaimerText}
        />

        {/* 8. Assurance Card: Prize Money Video & Razorpay Security */}
        <AssuranceCard
          videoUrl={competition.prizeMoneyInfoVideoUrl}
          onOpenPolicy={(policyKey) => {
            setActivePolicyType(policyKey);
            setPolicyModalVisible(true);
          }}
        />

        {/* 9. Refer & Earn More Discount Card */}
        {competition.referral && <ReferEarnCard referral={competition.referral} />}

        {/* 10. Hear From Our Users Testimonials Banner */}
        <UserFeedbackCard />

        {/* 11. Dashed Border Ad Banner */}
        <AdBanner />

        <View style={{ height: spacing(4) }} />
      </ScrollView>

      {/* Floating Bottom Action Button (Upload Submission / Registered) */}
      <BottomActionBar
        action={competition.action}
        isSubmitting={!!busyAction}
        onPress={handleAction}
      />

      {/* Bottom Navigation Bar (Home | Explore | (+) | Competitions | Profile) */}
      <BottomNavBar
        activeTab={activeBottomNavTab}
        onTabPress={handleBottomNav}
      />

      {/* Submission Modal */}
      <SubmissionModal
        visible={submissionModalVisible}
        onClose={() => setSubmissionModalVisible(false)}
        onSubmit={handleModalSubmit}
        isSubmitting={busyAction === 'SUBMITTING'}
      />

      {/* Policy & Compliance Modal */}
      <PolicyModal
        visible={policyModalVisible}
        policyType={activePolicyType}
        onClose={() => setPolicyModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2.5),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginRight: 6,
  },
  backText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  languageToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: radius.pill,
    padding: 2,
  },
  langOption: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1),
    borderRadius: radius.pill,
  },
  langOptionActive: {
    backgroundColor: colors.primary,
  },
  langText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  langTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    backgroundColor: '#F8FAFC',
    paddingBottom: spacing(2),
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing(6),
  },
  loadingText: {
    marginTop: spacing(3),
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing(1.5),
  },
  errorText: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing(4),
    textAlign: 'center',
    lineHeight: 18,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing(6),
    paddingVertical: spacing(3),
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});
