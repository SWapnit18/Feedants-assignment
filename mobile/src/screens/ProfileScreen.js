import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../theme';
import BottomNavBar from '../components/BottomNavBar';
import ProfileAvatar from '../components/ProfileAvatar';
import EnhancedVideoPlayer from '../components/EnhancedVideoPlayer';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useCompetitions } from '../hooks/useCompetitionDetails';
import { retrieveSubmissionVideoUrl } from '../utils/videoStorage';

export default function ProfileScreen({ navigation }) {
  const { user, isLoading, updateUser, isUpdating } = useCurrentUser();
  const { data: allComps = [] } = useCompetitions();

  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [saveError, setSaveError] = useState('');
  const [activePlaybackVideo, setActivePlaybackVideo] = useState(null);

  const displayName = user?.name || 'Feedants User';
  const displayEmail = user?.email || 'user@feedants.dev';

  const registeredComps = allComps.filter((c) => c.isRegistered);
  const registeredCount = user?.registeredCount ?? registeredComps.length;

  // Extract real user submissions from backend/database
  const userSubmissions = Array.isArray(user?.submissions) ? user.submissions : [];

  const handleStartEdit = () => {
    setNameInput(displayName);
    setSaveError('');
    setIsEditing(true);
  };

  const handleSaveName = async () => {
    if (!nameInput.trim()) {
      setSaveError('Name cannot be empty');
      return;
    }
    try {
      setSaveError('');
      await updateUser({ name: nameInput.trim() });
      setIsEditing(false);
    } catch (err) {
      setSaveError(err.message || 'Failed to update name');
    }
  };

  const handlePlaySubmissionVideo = async (sub) => {
    const compKey = sub.competitionId || sub.competitionSlug || 'featured';
    const localBlobUrl = await retrieveSubmissionVideoUrl(compKey);
    const finalUri = localBlobUrl || sub.videoUrl || sub.mediaUrl;

    if (!finalUri) {
      alert('Submitted video is unavailable');
      return;
    }
    
    setActivePlaybackVideo({
      title: sub.competitionTitle || 'My Performance Entry',
      uri: finalUri,
      fileName: sub.videoFileName || sub.fileName || 'performance_video.mp4',
      status: sub.status || 'Submitted',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile & Submissions</Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          {isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing(4) }} />
          ) : (
            <>
              <ProfileAvatar
                name={displayName}
                size={72}
                style={{ marginBottom: spacing(2.5) }}
              />
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{displayName}</Text>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={handleStartEdit}
                  activeOpacity={0.7}
                >
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.userEmail}>{displayEmail}</Text>
              <View style={styles.kycBadge}>
                <Text style={styles.kycText}>✓ KYC Verified Participant</Text>
              </View>
            </>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{registeredCount}</Text>
            <Text style={styles.statLabel}>Registered</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{userSubmissions.length}</Text>
            <Text style={styles.statLabel}>Submissions</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              ₹{Math.round((user?.referralEarnings ?? 0) / 100)}
            </Text>
            <Text style={styles.statLabel}>Referrals</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{user?.wonCount ?? 0}</Text>
            <Text style={styles.statLabel}>Contests Won</Text>
          </View>
        </View>

        {/* 🎬 1. My Video Submissions Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>🎬 My Submitted Videos ({userSubmissions.length})</Text>
        </View>

        {userSubmissions.length > 0 ? (
          userSubmissions.map((sub, idx) => (
            <View key={sub.id || idx} style={styles.submissionCard}>
              <View style={styles.subCardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.subCompTitle}>{sub.competitionTitle}</Text>
                  <Text style={styles.subCategoryText}>
                    {sub.competitionCategory || 'Dance Competition'}
                  </Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>✓ {sub.status || 'Submitted'}</Text>
                </View>
              </View>

              <View style={styles.subVideoInfoRow}>
                <View style={styles.subFileBox}>
                  <Text style={styles.subFileIcon}>🎥</Text>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.subFileName} numberOfLines={1}>
                      {sub.fileName || 'performance_video.mp4'}
                    </Text>
                    <Text style={styles.subFileMeta}>
                      {sub.fileSize ? `${sub.fileSize} • ` : ''}{(() => {
                        if (!sub.submittedAt) return 'Today';
                        try {
                          const d = new Date(sub.submittedAt);
                          if (!isNaN(d.getTime())) {
                            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                          }
                        } catch (e) {}
                        return sub.submittedAt;
                      })()}
                    </Text>
                  </View>
                </View>

                {/* Watch Video Button */}
                <TouchableOpacity
                  style={styles.vlcPlaySubmissionBtn}
                  onPress={() => handlePlaySubmissionVideo(sub)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.vlcPlaySubmissionIcon}>▶</Text>
                  <Text style={styles.vlcPlaySubmissionText}>Watch Video</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.subActionsFooter}>
                <TouchableOpacity
                  style={styles.subFooterLink}
                  onPress={() =>
                    navigation?.navigate('CompetitionDetails', {
                      competitionId: sub.competitionSlug || 'feedants-classical-dance',
                    })
                  }
                >
                  <Text style={styles.subFooterLinkText}>View Competition Page →</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.subResubmitBtn}
                  onPress={() =>
                    navigation?.navigate('CompetitionDetails', {
                      competitionId: sub.competitionSlug || 'feedants-classical-dance',
                      openSubmission: true,
                    })
                  }
                >
                  <Text style={styles.subResubmitText}>Resubmit Video</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🎬</Text>
            <Text style={styles.emptyTitle}>No video submissions yet</Text>
            <Text style={styles.emptySubtext}>
              Once you register for a competition and upload your video performance, your submitted entry will appear here.
            </Text>
          </View>
        )}

        {/* 🏆 2. Active Registrations Section */}
        <Text style={[styles.sectionHeading, { marginTop: spacing(4) }]}>
          🏆 My Registered Competitions
        </Text>
        {registeredCount > 0 ? (
          registeredComps.map((comp) => (
            <TouchableOpacity
              key={comp.id || comp.slug}
              style={styles.compCard}
              onPress={() =>
                navigation?.navigate('CompetitionDetails', {
                  competitionId: comp.slug || comp.id,
                })
              }
              activeOpacity={0.85}
            >
              <View style={styles.compCardHeader}>
                <Text style={styles.compCardTitle}>{comp.title}</Text>
                <View style={styles.registeredPill}>
                  <Text style={styles.registeredText}>✓ Registered</Text>
                </View>
              </View>
              <Text style={styles.compCardSub}>
                {comp.category} • Prize Pool: ₹{comp.prizePool?.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.viewLink}>View Competition & Submit Video →</Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No active registrations</Text>
            <Text style={styles.emptySub}>You have not registered for any competitions yet.</Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => navigation?.navigate('Explore')}
              activeOpacity={0.8}
            >
              <Text style={styles.exploreBtnText}>Browse Live Competitions</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 🔐 3. Account & Authentication Section */}
        <Text style={[styles.sectionHeading, { marginTop: spacing(4) }]}>
          🔐 Account & Authentication
        </Text>
        <View style={styles.authCard}>
          <View style={styles.authCardHeader}>
            <View style={styles.authStatusBadge}>
              <Text style={styles.authStatusDot}>●</Text>
              <Text style={styles.authStatusText}>Active Session: {displayEmail}</Text>
            </View>
          </View>
          <View style={styles.authButtonsRow}>
            <TouchableOpacity
              style={styles.authActionBtn}
              onPress={() => navigation?.navigate('Auth', { mode: 'signin' })}
              activeOpacity={0.8}
            >
              <Text style={styles.authActionBtnText}>Sign In / Switch Account</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.authActionBtn, styles.authActionBtnSecondary]}
              onPress={() => navigation?.navigate('Auth', { mode: 'signup' })}
              activeOpacity={0.8}
            >
              <Text style={styles.authActionBtnSecondaryText}>Create New Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* VLC Video Playback Modal for Submitted Performance */}
      <Modal
        visible={!!activePlaybackVideo}
        animationType="fade"
        transparent={false}
        onRequestClose={() => setActivePlaybackVideo(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContentBox}>
            <View style={styles.modalTopHeader}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.modalHeaderTitle} numberOfLines={1}>
                  🎬 {activePlaybackVideo?.title}
                </Text>
                <Text style={styles.modalHeaderSubtitle}>
                  File: {activePlaybackVideo?.fileName} • Status: {activePlaybackVideo?.status}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setActivePlaybackVideo(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCloseBtnText}>✕ Close</Text>
              </TouchableOpacity>
            </View>

            {activePlaybackVideo?.uri && (
              <EnhancedVideoPlayer
                videoUri={activePlaybackVideo.uri}
                title={activePlaybackVideo.title}
                initialOrientation="landscape"
                allowFullscreen={true}
                allowMinimize={false}
                allowOrientationToggle={true}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Edit Name Modal */}
      <Modal visible={isEditing} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Profile Name</Text>
            <Text style={styles.modalSub}>Changes will immediately sync across your account.</Text>

            <TextInput
              style={styles.modalInput}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Enter your full name"
              placeholderTextColor={colors.textMuted}
              autoFocus
            />

            {saveError ? <Text style={styles.modalError}>{saveError}</Text> : null}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsEditing(false)}
                disabled={isUpdating}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveName}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        activeTab="profile"
        onTabPress={(tab) => {
          if (tab === 'home') navigation?.navigate('Home');
          if (tab === 'explore') navigation?.navigate('Explore');
          if (tab === 'create') navigation?.navigate('Create');
          if (tab === 'competitions') navigation?.navigate('CompetitionDetails');
          if (tab === 'profile') return;
        }}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    paddingRight: spacing(3),
  },
  backArrow: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  content: {
    padding: spacing(4),
    backgroundColor: '#F8FAFC',
    flexGrow: 1,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing(5),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  editBtn: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  userEmail: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing(2.5),
  },
  kycBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  kycText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing(2),
    marginBottom: spacing(4),
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing(3),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(2.5),
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing(2.5),
  },
  submissionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing(4),
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    marginBottom: spacing(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  subCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing(2.5),
  },
  subCompTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  subCategoryText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  statusBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#047857',
  },
  subVideoInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    padding: spacing(2.5),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing(3),
    gap: 8,
  },
  subFileBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subFileIcon: {
    fontSize: 20,
  },
  subFileName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  subFileMeta: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  vlcPlaySubmissionBtn: {
    backgroundColor: colors.primary || '#004D40',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md || 8,
    gap: 5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  vlcPlaySubmissionIcon: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  vlcPlaySubmissionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  subActionsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: spacing(2),
  },
  subFooterLink: {
    paddingVertical: 2,
  },
  subFooterLinkText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0284C7',
  },
  subResubmitBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  subResubmitText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  compCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing(3.5),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing(2.5),
  },
  compCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  compCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: spacing(2),
  },
  registeredPill: {
    backgroundColor: '#E6FFFA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  registeredText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0D9488',
  },
  compCardSub: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginBottom: spacing(2),
  },
  viewLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing(6),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing(3),
  },
  exploreBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: radius.md,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing(4),
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing(5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing(4),
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: radius.md,
    paddingHorizontal: spacing(3.5),
    paddingVertical: spacing(2.5),
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing(3),
  },
  modalError: {
    fontSize: 12,
    color: '#EF4444',
    marginBottom: spacing(3),
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing(2.5),
  },
  cancelBtn: {
    paddingHorizontal: spacing(3.5),
    paddingVertical: spacing(2),
    borderRadius: radius.md,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: radius.md,
    minWidth: 70,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
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
    backgroundColor: '#0A0F1D',
    borderRadius: radius.lg,
    padding: spacing(4),
    borderWidth: 1.5,
    borderColor: '#FF5500',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  modalTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingBottom: spacing(2.5),
  },
  modalHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  modalHeaderSubtitle: {
    color: '#FED7AA',
    fontSize: 11,
    marginTop: 2,
  },
  modalCloseBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  authCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing(4),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  authCardHeader: {
    marginBottom: spacing(3),
  },
  authStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  authStatusDot: {
    color: '#16A34A',
    fontSize: 10,
    marginRight: 6,
  },
  authStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  authButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  authActionBtn: {
    flex: 1,
    backgroundColor: '#004D40',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  authActionBtnSecondary: {
    backgroundColor: '#E6FFFA',
    borderWidth: 1,
    borderColor: '#0D9488',
  },
  authActionBtnSecondaryText: {
    color: '#004D40',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
});
