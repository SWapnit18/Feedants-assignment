import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';

import { useCompetitionDetails, useRegister, useUploadSubmission, useMySubmission } from '../hooks/useCompetitionDetails';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { fetchReviews } from '../api/competitionApi';
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
import EnhancedVideoPlayer from '../components/EnhancedVideoPlayer';

export default function CompetitionDetailsScreen({ route, navigation }) {
  const competitionId = route?.params?.competitionId;
  const { user: currentUser } = useCurrentUser();
  const { data: competition, isLoading, isError, refetch } = useCompetitionDetails(competitionId);
  const { data: mySubmission } = useMySubmission(competitionId || competition?.id || competition?.slug);

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', competitionId || competition?.slug],
    queryFn: () => fetchReviews(competitionId || competition?.slug),
    staleTime: 30000,
  });

  const registerMutation = useRegister(competitionId || competition?.id);
  const submitMutation = useUploadSubmission(competitionId || competition?.id);

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
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submittedVideoPlayback, setSubmittedVideoPlayback] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Reset state when competition changes (Requirement #6)
  useEffect(() => {
    setSelectedSubmission(null);
    setSubmittedVideoPlayback(null);
    setSubmissionModalVisible(false);
  }, [competitionId]);

  useEffect(() => {
    if (route?.params?.openSubmission) {
      setSubmissionModalVisible(true);
    }
  }, [route?.params?.openSubmission]);

  const serverOffsetMs = useMemo(
    () => (competition?.dates?.serverTime ? computeServerOffsetMs(competition.dates.serverTime) : 0),
    [competition?.dates?.serverTime]
  );

  const handleAction = async (actionType) => {
    React.startTransition(() => {
      if (actionType === 'REGISTER') {
        setRegistrationModalVisible(true);
      } else if (actionType === 'SUBMIT' || actionType === 'RESUBMIT') {
        setSubmissionModalVisible(true);
      } else if (actionType === 'VIEW_RESULTS') {
        showToast('🏆 Winners announced on the Leaderboard tab!');
      }
    });
  };


  const handleConfirmRegistration = async (paymentMethod) => {
    try {
      setBusyAction('REGISTER');
      await registerMutation.mutateAsync({ paymentMethod });
      setRegistrationModalVisible(false);
      showToast("Registration successful. Your status is updating.");
      refetch();
    } catch (err) {
      // Real API Error Handling (Requirement #7, #8, #18)
      showToast(err.message || 'Registration failed. Please try again.');
      setRegistrationModalVisible(false);
    } finally {
      setBusyAction(null);
    }
  };

  const handleModalSubmit = async (submissionData) => {
    try {
      setBusyAction('SUBMITTING');
      const res = await submitMutation.mutateAsync({
        mediaUrl: submissionData.mediaUrl,
        videoUrl: submissionData.videoUrl || submissionData.mediaUrl,
        mediaType: submissionData.mediaType,
        title: submissionData.title,
        description: submissionData.description,
        file: submissionData.file,
        duration: submissionData.duration,
        videoName: submissionData.videoName,
        fileName: submissionData.fileName || submissionData.videoName,
        videoFileName: submissionData.videoFileName || submissionData.videoName,
        fileSize: submissionData.fileSize,
      });

      if (res?.submission) {
        setSelectedSubmission(res.submission);
      } else if (submissionData.mediaUrl) {
        setSelectedSubmission({
          competitionId: competitionId || competition?.id,
          userId: currentUser?.id || currentUser?.user?.id,
          mediaUrl: submissionData.mediaUrl,
          videoUrl: submissionData.mediaUrl,
          videoFileName: submissionData.videoName || 'performance.mp4',
          fileName: submissionData.videoName || 'performance.mp4',
          status: 'submitted',
          submittedAt: new Date().toISOString(),
        });
      }

      setSubmissionModalVisible(false);
      showToast('🌟 Entry Submitted! Your performance was sent for judging.');
      refetch();
    } catch (err) {
      // Real API Error Handling (Requirement #18)
      showToast(err.message || 'Submission failed. Please check the file and try again.');
      setSubmissionModalVisible(false);
    } finally {
      setBusyAction(null);
    }
  };

  const handleBottomNav = (tabKey) => {
    React.startTransition(() => {
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
    });
  };

  // Loading State
  if (isLoading && !competition) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading competition details...</Text>
      </SafeAreaView>
    );
  }

  // Error / Unavailable State (Requirement #20)
  if (!competition) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Text style={styles.emptyScreenTitle}>Competition information is currently unavailable.</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()} activeOpacity={0.8}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const activeSubmission = selectedSubmission || mySubmission || competition.viewer?.submission;

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

        {/* 🎬 Active Submission Banner if User has Submitted */}
        {(activeSubmission || competition.viewer?.hasSubmission || competition.action?.action === 'RESUBMIT' || competition.action?.label?.toLowerCase().includes('resubmit') || competition.action?.label?.toLowerCase().includes('submitted')) && (
          <View style={styles.mySubmissionBanner}>
            <View style={styles.mySubHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.mySubHeading}>
                  {selectedLanguage === 'हिंदी' ? '🎬 आपकी प्रस्तुत वीडियो' : '🎬 Your Submitted Video'}
                </Text>
                <Text style={styles.mySubSubtitle}>
                  {selectedLanguage === 'हिंदी'
                    ? 'स्थिति: ✓ सबमिट किया गया • मूल्यांकन जारी'
                    : 'Status: ✓ Submitted • Under Jury Evaluation'}
                </Text>
              </View>
              <View style={styles.mySubBadge}>
                <Text style={styles.mySubBadgeText}>
                  {selectedLanguage === 'हिंदी' ? '✓ सक्रिय प्रविष्टि' : '✓ Active Entry'}
                </Text>
              </View>
            </View>

            <View style={styles.mySubActionsRow}>
              <TouchableOpacity
                style={styles.mySubPlayBtn}
                onPress={() => {
                  const sub = activeSubmission;
                  const targetVideoUrl = sub?.videoUrl || sub?.mediaUrl;

                  console.log("Current Competition:", competitionId || competition?.id);
                  console.log("Current User:", currentUser?.id || currentUser?.user?.id);
                  console.log("Submission:", sub);
                  console.log("Submission Competition:", sub?.competitionId);
                  console.log("Submission User:", sub?.userId);
                  console.log("Submission Video:", targetVideoUrl);
                  console.log("Selected Video:", targetVideoUrl);

                  if (!targetVideoUrl) {
                    showToast(selectedLanguage === 'हिंदी' ? 'प्रस्तुत वीडियो अनुपलब्ध है' : 'Submitted video is unavailable');
                    return;
                  }

                  setSubmittedVideoPlayback({
                    title: `${typeof competition.title === 'string' ? competition.title : competition.title?.en || 'Performance Entry'} – My Submission`,
                    uri: targetVideoUrl,
                    fileName: sub?.videoFileName || sub?.fileName || 'performance_video.mp4',
                    status: sub?.status || 'Submitted',
                    submissionId: sub?.id || sub?.submissionId,
                  });
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.mySubPlayIcon}>▶</Text>
                <Text style={styles.mySubPlayText}>
                  {selectedLanguage === 'हिंदी' ? 'वीडियो देखें' : 'Watch Video'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mySubChangeBtn}
                onPress={() => setSubmissionModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.mySubChangeText}>
                  {selectedLanguage === 'हिंदी' ? 'पुनः सबमिट करें' : 'Resubmit Video'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

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

        {/* 5. Previous Winners Horizontal Showcase (Real empty state if none) */}
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
          testimonials={reviews}
          lang={selectedLanguage}
          onOpenAll={() => showToast('Displaying participant reviews')}
        />

        {/* 11. Dashed Border Ad Banner */}
        <AdBanner lang={selectedLanguage} />

        <View style={{ height: spacing(4) }} />
      </ScrollView>

      {/* Floating Bottom Action Button (Upload Submission / Registered / Register Now) */}
      <BottomActionBar
        action={competition.action}
        isSubmitting={!!busyAction}
        onPress={handleAction}
        lang={selectedLanguage}
      />

      {/* Slide-Up Interactive Modals */}
      <RegistrationModal
        visible={registrationModalVisible}
        competition={competition}
        isRegistering={busyAction === 'REGISTER'}
        onConfirm={handleConfirmRegistration}
        onClose={() => setRegistrationModalVisible(false)}
        lang={selectedLanguage}
      />

      <SubmissionModal
        visible={submissionModalVisible}
        competitionId={competition.id}
        entryFee={competition.entryFee}
        isSubmitting={busyAction === 'SUBMITTING'}
        onSubmit={handleModalSubmit}
        onClose={() => setSubmissionModalVisible(false)}
        lang={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
      />

      <PolicyModal
        visible={policyModalVisible}
        policyType={activePolicyType}
        onClose={() => setPolicyModalVisible(false)}
        lang={selectedLanguage}
      />

      <NavigationSheet
        visible={navigationSheetVisible}
        selectedTab={selectedNavTab}
        onSelectTab={(tab) => {
          setSelectedNavTab(tab);
          setNavigationSheetVisible(false);
          handleBottomNav(tab);
        }}
        onClose={() => setNavigationSheetVisible(false)}
      />

      {/* VLC Video Playback Modal for Submitted Video */}
      <Modal
        visible={!!submittedVideoPlayback}
        animationType="fade"
        transparent={false}
        onRequestClose={() => setSubmittedVideoPlayback(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContentBox}>
            <View style={styles.modalTopHeader}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.modalHeaderTitle} numberOfLines={1}>
                  🎬 {submittedVideoPlayback?.title}
                </Text>
                <Text style={styles.modalHeaderSubtitle}>
                  {selectedLanguage === 'हिंदी'
                    ? 'प्रदर्शन वीडियो पूर्वावलोकन • जूरी मूल्यांकन हेतु'
                    : 'Performance Video Preview • Under Jury Evaluation'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSubmittedVideoPlayback(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCloseBtnText}>✕ Close</Text>
              </TouchableOpacity>
            </View>

            {submittedVideoPlayback?.uri && (
              <EnhancedVideoPlayer
                videoUri={submittedVideoPlayback.uri}
                title={submittedVideoPlayback.title}
                initialOrientation="landscape"
                allowFullscreen={true}
                allowMinimize={false}
                allowOrientationToggle={true}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Bottom Sticky Tab Navigation Bar */}
      <BottomNavBar
        activeTab={activeBottomNavTab}
        onTabPress={handleBottomNav}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing(4),
  },
  loadingText: {
    marginTop: spacing(3),
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
  emptyScreenTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing(3),
  },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: radius.md,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  toastBanner: {
    position: 'absolute',
    top: 50,
    left: spacing(4),
    right: spacing(4),
    zIndex: 9999,
    backgroundColor: '#075A4E',
    borderRadius: radius.md,
    paddingVertical: spacing(2.5),
    paddingHorizontal: spacing(3.5),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing(2),
  },
  toastClose: {
    padding: 4,
  },
  toastCloseText: {
    color: '#A7F3D0',
    fontSize: 14,
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
  mySubmissionBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl || 16,
    padding: spacing(4),
    marginHorizontal: spacing(4),
    marginTop: spacing(3),
    borderWidth: 1,
    borderColor: '#99F6E4',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  mySubHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing(3),
  },
  mySubHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  mySubSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  mySubBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  mySubBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
  },
  mySubActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  mySubPlayBtn: {
    flex: 1.2,
    backgroundColor: colors.primary || '#004D40',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing(2.5),
    borderRadius: radius.md,
    gap: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  mySubPlayIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  mySubPlayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  mySubChangeBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingVertical: spacing(2.5),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mySubChangeText: {
    color: colors.textSecondary,
    fontSize: 11.5,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing(4),
    ...(Platform.OS === 'web'
      ? {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 999999,
        }
      : {}),
  },
  modalContentBox: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl || 16,
    padding: spacing(4),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  modalTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: spacing(2.5),
  },
  modalHeaderTitle: {
    color: colors.text || '#0F172A',
    fontSize: 14.5,
    fontWeight: '800',
  },
  modalHeaderSubtitle: {
    color: colors.textMuted || '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  modalCloseBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill || 999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalCloseBtnText: {
    color: colors.text || '#0F172A',
    fontSize: 11.5,
    fontWeight: '700',
  },
});
