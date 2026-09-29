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

  // Deduplicate submissions by competition so only 1 latest submission is shown per contest
  const uniqueSubmissionsMap = React.useMemo(() => {
    const map = new Map();
    for (const sub of userSubmissions) {
      const key = sub.competitionId || sub.competitionSlug || 'feedants-classical-dance';
      if (!map.has(key)) {
        map.set(key, sub);
      }
    }
    return map;
  }, [userSubmissions]);

  // Combine registered competitions and submissions into a single clean list
  const activeEntries = React.useMemo(() => {
    const entries = [];
    const processedComps = new Set();

    // Add registered competitions with their submission if present
    for (const comp of registeredComps) {
      const compKey = comp.id || comp.slug || 'feedants-classical-dance';
      processedComps.add(compKey);
      const sub = uniqueSubmissionsMap.get(compKey);
      entries.push({
        id: compKey,
        slug: comp.slug || compKey,
        title: typeof comp.title === 'string' ? comp.title : comp.title?.en || 'Feedants Classical Dance',
        category: comp.category || 'Classical Dance',
        prizePool: comp.prizePool || 1500,
        submission: sub || null,
        isRegistered: true,
      });
    }

    // Add any submissions whose comp isn't in registeredComps list
    for (const [key, sub] of uniqueSubmissionsMap.entries()) {
      if (!processedComps.has(key)) {
        processedComps.add(key);
        entries.push({
          id: key,
          slug: sub.competitionSlug || key,
          title: sub.competitionTitle || 'Classical Dance Competition',
          category: sub.competitionCategory || 'Classical Dance',
          prizePool: 1500,
          submission: sub,
          isRegistered: true,
        });
      }
    }

    return entries;
  }, [registeredComps, uniqueSubmissionsMap]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
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
                size={68}
                style={{ marginBottom: spacing(2) }}
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
                <Text style={styles.kycText}>✓ Verified Participant</Text>
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
            <Text style={styles.statNumber}>{uniqueSubmissionsMap.size}</Text>
            <Text style={styles.statLabel}>Submissions</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>₹{Math.round((user?.referralEarnings ?? 0) / 100)}</Text>
            <Text style={styles.statLabel}>Referrals</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{user?.wonCount ?? 0}</Text>
            <Text style={styles.statLabel}>Contests Won</Text>
          </View>
        </View>

        {/* Unified My Competitions & Entries */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>My Competitions & Entries</Text>
        </View>

        {activeEntries.length > 0 ? (
          activeEntries.map((item) => {
            const sub = item.submission;
            const cleanFileName = sub?.fileName && sub.fileName !== 'performance_video.mp4'
              ? sub.fileName
              : (item.title ? `${item.title} Performance.mp4` : 'dance_routine.mp4');

            const formattedDate = (() => {
              if (!sub?.submittedAt) return 'Today';
              try {
                const d = new Date(sub.submittedAt);
                if (!isNaN(d.getTime())) {
                  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                }
              } catch (e) {}
              return sub.submittedAt;
            })();

            return (
              <View key={item.id} style={styles.cleanCard}>
                <View style={styles.cleanCardHeader}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.cleanCardTitle}>{item.title}</Text>
                    <Text style={styles.cleanCardSubtitle}>{item.category} • Prize Pool: ₹{item.prizePool?.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={sub ? styles.badgeSubmitted : styles.badgeRegistered}>
                    <Text style={sub ? styles.badgeTextSubmitted : styles.badgeTextRegistered}>
                      {sub ? '✓ Submitted' : '✓ Registered'}
                    </Text>
                  </View>
                </View>

                {sub ? (
                  <View style={styles.videoPreviewRow}>
                    <View style={styles.videoInfoLeft}>
                      <Text style={styles.videoIcon}>🎥</Text>
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={styles.videoTitleText} numberOfLines={1}>{cleanFileName}</Text>
                        <Text style={styles.videoMetaText}>
                          {sub.fileSize && sub.fileSize !== '34.8 MB' && sub.fileSize !== '35.0 MB' ? `${sub.fileSize} • ` : ''}{formattedDate}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.watchVideoBtn}
                      onPress={() => handlePlaySubmissionVideo(sub)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.watchVideoIcon}>▶</Text>
                      <Text style={styles.watchVideoText}>Watch Video</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                <View style={styles.cleanCardFooter}>
                  <TouchableOpacity
                    style={styles.footerLink}
                    onPress={() => navigation?.navigate('CompetitionDetails', { competitionId: item.slug })}
                  >
                    <Text style={styles.footerLinkText}>View Contest Details →</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.footerActionBtn}
                    onPress={() => navigation?.navigate('CompetitionDetails', { competitionId: item.slug, openSubmission: true })}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.footerActionText}>
                      {sub ? 'Resubmit Video' : 'Upload Video'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🏆</Text>
            <Text style={styles.emptyTitle}>No active entries yet</Text>
            <Text style={styles.emptySub}>Explore live competitions and submit your performance.</Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => navigation?.navigate('Explore')}
              activeOpacity={0.85}
            >
              <Text style={styles.exploreBtnText}>Browse Competitions</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Account Section */}
        <View style={[styles.sectionHeaderRow, { marginTop: spacing(4) }]}>
          <Text style={styles.sectionHeading}>Account</Text>
        </View>

        <View style={styles.cleanAccountCard}>
          <View style={styles.accountInfoRow}>
            <View style={styles.accountStatusDot} />
            <Text style={styles.accountEmailText} numberOfLines={1}>{displayEmail}</Text>
          </View>
          <TouchableOpacity
            style={styles.accountSwitchBtn}
            onPress={() => navigation?.navigate('Auth', { mode: 'signin' })}
            activeOpacity={0.8}
          >
            <Text style={styles.accountSwitchText}>Switch Account</Text>
          </TouchableOpacity>
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
  cleanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg || 16,
    padding: spacing(4),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cleanCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing(3),
  },
  cleanCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.2,
  },
  cleanCardSubtitle: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  badgeSubmitted: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: radius.pill || 999,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  badgeTextSubmitted: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  badgeRegistered: {
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: radius.pill || 999,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  badgeTextRegistered: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D9488',
  },
  videoPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md || 10,
    padding: spacing(2.5),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: spacing(3),
    gap: 8,
  },
  videoInfoLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoIcon: {
    fontSize: 20,
  },
  videoTitleText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.text,
  },
  videoMetaText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  watchVideoBtn: {
    backgroundColor: colors.primary || '#004D40',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.md || 8,
    gap: 5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  watchVideoIcon: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  watchVideoText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  cleanCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: spacing(2),
  },
  footerLink: {
    paddingVertical: 4,
  },
  footerLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
  footerActionBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  footerActionText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  cleanAccountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg || 16,
    padding: spacing(3.5),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing(3),
  },
  accountInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  accountStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginRight: 8,
  },
  accountEmailText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.text,
  },
  accountSwitchBtn: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  accountSwitchText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing(6),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIcon: {
    fontSize: 28,
    marginBottom: 8,
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
});
