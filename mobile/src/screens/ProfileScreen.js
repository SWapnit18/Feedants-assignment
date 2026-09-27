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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../theme';
import BottomNavBar from '../components/BottomNavBar';
import ProfileAvatar from '../components/ProfileAvatar';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useCompetition } from '../hooks/useCompetition';

export default function ProfileScreen({ navigation }) {
  const { user, isLoading, updateUser, isUpdating } = useCurrentUser();
  const { data: compData } = useCompetition('feedants-classical-dance');

  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [saveError, setSaveError] = useState('');

  const displayName = user?.name || '';
  const displayEmail = user?.email || '';
  const isRegistered = compData?.user?.isRegistered ?? false;

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
                imageUrl={user?.profileImage || user?.photoUrl}
                size={76}
                fontSize={34}
                style={{ marginBottom: spacing(2.5) }}
              />
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{displayName || 'Feedants User'}</Text>
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
                <Text style={styles.kycText}>✓ KYC Verified</Text>
              </View>
            </>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{isRegistered ? 1 : 0}</Text>
            <Text style={styles.statLabel}>Registered</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>₹{user?.referralEarnings ?? 0}</Text>
            <Text style={styles.statLabel}>Referrals</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{user?.wonCount ?? 0}</Text>
            <Text style={styles.statLabel}>Won</Text>
          </View>
        </View>

        {/* Active Competitions Section */}
        <Text style={styles.sectionHeading}>My Active Competitions</Text>
        {isRegistered ? (
          <TouchableOpacity
            style={styles.compCard}
            onPress={() => navigation?.navigate('CompetitionDetails')}
            activeOpacity={0.85}
          >
            <View style={styles.compCardHeader}>
              <Text style={styles.compCardTitle}>{compData?.competition?.title || 'Feedants Classical Dance'}</Text>
              <View style={styles.registeredPill}>
                <Text style={styles.registeredText}>✓ Registered</Text>
              </View>
            </View>
            <Text style={styles.compCardSub}>
              {compData?.competition?.category || 'Classical Dance'} • Entry Fee: ₹{compData?.competition?.entryFee || 99}
            </Text>
            <Text style={styles.viewLink}>View Competition Page →</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No active registrations</Text>
            <Text style={styles.emptySub}>You have not registered for any competitions yet.</Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => navigation?.navigate('CompetitionDetails')}
              activeOpacity={0.8}
            >
              <Text style={styles.exploreBtnText}>Browse Live Competitions</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Edit Name Modal */}
      <Modal visible={isEditing} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Profile Name</Text>
            <Text style={styles.modalSub}>Changes will immediately sync to your account.</Text>

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
    marginBottom: spacing(4),
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  editBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  userEmail: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing(2),
  },
  kycBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: spacing(3),
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  kycText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing(3),
    marginBottom: spacing(4),
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing(3.5),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing(3),
  },
  compCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing(4),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  compCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  compCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  registeredPill: {
    backgroundColor: '#E6FFFA',
    paddingHorizontal: spacing(2),
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  registeredText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0D9488',
  },
  compCardSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing(2.5),
  },
  viewLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing(5),
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
});
