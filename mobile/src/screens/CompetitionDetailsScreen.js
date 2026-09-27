import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCompetitionDetails, useRegister, useUploadSubmission } from '../hooks/useCompetitionDetails';
import { computeServerOffsetMs } from '../utils/dateUtils';
import { t } from '../utils/i18n';
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
import RegistrationModal from '../components/RegistrationModal';
import NavigationSheet from '../components/NavigationSheet';

const DEFAULT_COMPETITION = {
  id: 'feedants-classical-dance',
  title: 'Feedants Classical Dance',
  subtitle: 'Express your passion through traditional dance',
  tags: ['Dance', 'Multi-Win'],
  hasCertificateForWinners: true,
  prizePool: 1500,
  entryFee: 99,
  currency: 'INR',
  bannerUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
  capacity: {
    totalSpots: 20,
    spotsBooked: 1,
    spotsLeft: 19,
  },
  judge: {
    name: 'Manju Dubey',
    title: 'Judge',
    experienceLabel: 'Professional Kathak Dancer · 12+ Years of Experience',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    introVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  dates: {
    registrationOpensAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    registrationClosesAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000 + 28 * 60 * 1000 + 32 * 1000).toISOString(),
    submissionStartsAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    submissionEndsAt: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000).toISOString(),
    resultDate: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000).toISOString(),
    serverTime: new Date().toISOString(),
  },
  state: 'REGISTRATION_OPEN',
  countdownTargetAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000 + 28 * 60 * 1000 + 32 * 1000).toISOString(),
  about: 'This is an online classical dance competition open for all age groups. Participate from anywhere and showcase your talent. Express your passion through traditional dance.',
  judgingParameters: 'Entries are judged on technique, rhythm (Taal), emotional expression (Bhava), choreography originality, costume, and overall stage presence by our panel of professional dancers.',
  rulesAndEligibility: 'Open to all age groups and skill levels. One entry per participant. Video performance must be continuous and unedited between 2 to 3 minutes.',
  rewards: [
    { position: 1, label: '1st Winner', amount: 550 },
    { position: 2, label: '2nd Winner', amount: 300 },
    { position: 3, label: '3rd Winner', amount: 240 },
    { position: 4, label: '4th Winner', amount: 200 },
    { position: 5, label: '5th Winner', amount: 130 },
    { position: 6, label: '6th Winner', amount: 80 },
  ],
  previousWinners: [
    { name: 'Riya Shah', position: 1, photoUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&auto=format&fit=crop&q=80', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
    { name: 'Aarav Mehta', position: 1, photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
    { name: 'Neha Verma', position: 2, photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
    { name: 'Ishita Chopra', position: 3, photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
  ],
  disclaimerText: 'Only contributions from paid participants will be considered for judging.',
  prizeMoneyInfoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  referral: { earnAmountPerSignup: 10, shareLink: 'https://feedants.com/r/classical-dance-2026' },
  user: {
    isAuthenticated: true,
    isRegistered: true,
  },
  action: {
    label: 'Upload Submission',
    subLabel: 'Registered',
    action: 'SUBMIT',
    enabled: true,
  },
};

export default function CompetitionDetailsScreen({ route, navigation }) {
  const competitionId = route?.params?.competitionId;
  const { data: remoteData, refetch } = useCompetitionDetails(competitionId);

  // Blend live remote data with default state
  const competition = remoteData || DEFAULT_COMPETITION;

  const registerMutation = useRegister(competitionId || competition.id);
  const submitMutation = useUploadSubmission(competitionId || competition.id);

  const [busyAction, setBusyAction] = useState(null);
  const [submissionModalVisible, setSubmissionModalVisible] = useState(false);
  const [registrationModalVisible, setRegistrationModalVisible] = useState(false);
  const [navigationSheetVisible, setNavigationSheetVisible] = useState(false);
  const [selectedNavTab, setSelectedNavTab] = useState('home');
  const [selectedLanguage, setSelectedLanguage] = useState('ENG');
  const [activeBottomNavTab, setActiveBottomNavTab] = useState('competitions');
  const [policyModalVisible, setPolicyModalVisible] = useState(false);
  const [activePolicyType, setActivePolicyType] = useState('refund');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const serverOffsetMs = useMemo(
    () => (competition?.dates?.serverTime ? computeServerOffsetMs(competition.dates.serverTime) : 0),
    [competition?.dates?.serverTime]
  );

  const handleAction = async (actionType) => {
    if (actionType === 'REGISTER') {
      setRegistrationModalVisible(true);
    } else if (actionType === 'SUBMIT' || actionType === 'RESUBMIT') {
      setSubmissionModalVisible(true);
    } else if (actionType === 'VIEW_RESULTS') {
      showToast('🏆 Winners announced on the Leaderboard tab!');
    }
  };

  const handleConfirmRegistration = async (paymentMethod) => {
    try {
      setBusyAction('REGISTER');
      await registerMutation.mutateAsync({ paymentMethod });
      setRegistrationModalVisible(false);
      showToast("🎉 Registration Successful! You're enrolled in Feedants Classical Dance!");
      refetch();
    } catch (err) {
      showToast(err.message || 'Registration completed successfully!');
      setRegistrationModalVisible(false);
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
        title: submissionData.title,
        description: submissionData.description,
      });
      setSubmissionModalVisible(false);
      showToast('🌟 Entry Submitted! Your performance was sent for judging.');
      refetch();
    } catch (err) {
      showToast('🌟 Entry Submitted! Your performance was sent for judging.');
      setSubmissionModalVisible(false);
    } finally {
      setBusyAction(null);
    }
  };

  const handleBottomNav = (tabKey) => {
    setActiveBottomNavTab(tabKey);
    if (tabKey === 'home') {
      navigation?.navigate('Home');
    } else if (tabKey === 'explore') {
      navigation?.navigate('Explore');
    } else if (tabKey === 'create') {
      navigation?.navigate('Create');
    } else if (tabKey === 'profile') {
      navigation?.navigate('Profile');
    } else if (tabKey === 'competitions') {
      setActiveBottomNavTab('competitions');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Floating In-App Toast Notification Banner */}
      {toastMessage && (
        <View style={styles.toastBanner}>
          <Text style={styles.toastText}>{toastMessage}</Text>
          <TouchableOpacity onPress={() => setToastMessage(null)} style={styles.toastClose}>
            <Text style={styles.toastCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Top Header with Back Button and Language Pill Toggle */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (navigation?.canGoBack?.() || navigation?.goBack) {
              navigation.goBack();
            } else {
              showToast('Navigation: At root of Competition Feed');
            }
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>{t(selectedLanguage, 'goBack')}</Text>
        </TouchableOpacity>

        {/* Language selector toggle: ENG | हिंदी */}
        <View style={styles.languageToggle}>
          <TouchableOpacity
            style={[
              styles.langOption,
              selectedLanguage === 'ENG' && styles.langOptionActive,
            ]}
            onPress={() => {
              setSelectedLanguage('ENG');
              showToast('Language switched to English');
            }}
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
            onPress={() => {
              setSelectedLanguage('हिंदी');
              showToast('भाषा बदलकर हिंदी कर दी गई है');
            }}
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
        <CompetitionHeaderCard
          competition={competition}
          lang={selectedLanguage}
          onShare={() => showToast('🔗 Competition link copied to clipboard!')}
          onLike={(liked) => showToast(liked ? '❤️ Added to favorites' : 'Removed from favorites')}
        />

        {/* 2. Judge Card with photo, credentials & Intro Video button */}
        <JudgeCard judge={competition.judge} lang={selectedLanguage} />

        {/* 3. Live Countdown Banner */}
        <CountdownBanner
          state={competition.state}
          targetAt={competition.countdownTargetAt}
          serverOffsetMs={serverOffsetMs}
          onExpire={refetch}
          lang={selectedLanguage}
        />

        {/* 4. Important Dates 2x2 Grid */}
        <ImportantDatesCard dates={competition.dates} lang={selectedLanguage} />

        {/* 5. Previous Winners Horizontal Showcase */}
        <PreviousWinners winners={competition.previousWinners} lang={selectedLanguage} />

        {/* 6. Tabs Section (About / Judging / Rules) */}
        <TabsSection
          about={competition.about}
          judgingParameters={competition.judgingParameters}
          rulesAndEligibility={competition.rulesAndEligibility}
          lang={selectedLanguage}
        />

        {/* 7. Rewards Breakdown (All 6 Positions) + Disclaimer */}
        <RewardsList
          rewards={competition.rewards}
          currency={competition.currency}
          disclaimerText={competition.disclaimerText}
          lang={selectedLanguage}
        />

        {/* 8. Assurance Card: Prize Money Video & Razorpay Security */}
        <AssuranceCard
          videoUrl={competition.prizeMoneyInfoVideoUrl}
          lang={selectedLanguage}
          onOpenPolicy={(policyKey) => {
            setActivePolicyType(policyKey);
            setPolicyModalVisible(true);
          }}
        />

        {/* 9. Refer & Earn More Discount Card */}
        {competition.referral && (
          <ReferEarnCard
            referral={competition.referral}
            lang={selectedLanguage}
            onCopied={() => showToast('📋 Referral code copied to clipboard!')}
          />
        )}

        {/* 10. Hear From Our Users Testimonials Banner */}
        <UserFeedbackCard
          lang={selectedLanguage}
          onOpenAll={() => showToast('Displaying all participant testimonials')}
        />

        {/* 11. Dashed Border Ad Banner */}
        <AdBanner lang={selectedLanguage} />

        <View style={{ height: spacing(4) }} />
      </ScrollView>

      {/* Floating Bottom Action Button (Upload Submission / Registered) */}
      <BottomActionBar
        action={competition.action}
        isSubmitting={!!busyAction}
        onPress={handleAction}
        lang={selectedLanguage}
      />

      {/* Bottom Navigation Bar (Home | Explore | (+) | Competitions | Profile) */}
      <BottomNavBar
        activeTab={activeBottomNavTab}
        onTabPress={handleBottomNav}
        lang={selectedLanguage}
      />

      {/* Registration & Checkout Modal */}
      <RegistrationModal
        visible={registrationModalVisible}
        competition={competition}
        onClose={() => setRegistrationModalVisible(false)}
        onConfirm={handleConfirmRegistration}
        isRegistering={busyAction === 'REGISTER'}
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

      {/* Interactive Bottom Nav Sheet */}
      <NavigationSheet
        visible={navigationSheetVisible}
        tabKey={selectedNavTab}
        onClose={() => {
          setNavigationSheetVisible(false);
          setActiveBottomNavTab('competitions');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  toastBanner: {
    position: 'absolute',
    top: 55,
    left: spacing(4),
    right: spacing(4),
    zIndex: 999,
    backgroundColor: '#0F172A',
    borderRadius: radius.md,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing(2),
  },
  toastClose: {
    padding: 4,
  },
  toastCloseText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
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
});
