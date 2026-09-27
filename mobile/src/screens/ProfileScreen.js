import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../theme';
import BottomNavBar from '../components/BottomNavBar';

import ProfileAvatar from '../components/ProfileAvatar';

export default function ProfileScreen({ navigation }) {
  const user = {
    name: 'Swapnit Patel',
    email: 'swapnit@feedants.com',
    profileImage: null, // Dynamic fallback to "S" initial
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
          <ProfileAvatar
            name={user.name}
            imageUrl={user.profileImage}
            size={72}
            fontSize={32}
            style={{ marginBottom: spacing(2) }}
          />
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.kycBadge}>
            <Text style={styles.kycText}>✓ KYC Verified</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statLabel}>Registered</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>₹10</Text>
            <Text style={styles.statLabel}>Referrals</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Won</Text>
          </View>
        </View>

        {/* Active Competitions Section */}
        <Text style={styles.sectionHeading}>My Active Competitions</Text>
        <TouchableOpacity
          style={styles.compCard}
          onPress={() => navigation?.navigate('CompetitionDetails')}
          activeOpacity={0.85}
        >
          <View style={styles.compCardHeader}>
            <Text style={styles.compCardTitle}>Feedants Classical Dance</Text>
            <View style={styles.registeredPill}>
              <Text style={styles.registeredText}>✓ Registered</Text>
            </View>
          </View>
          <Text style={styles.compCardSub}>Kathak & Classical Dance Showcase</Text>
          <Text style={styles.viewLink}>View Competition Page →</Text>
        </TouchableOpacity>
      </ScrollView>

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
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E2E8F0',
    marginBottom: spacing(2),
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
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
});
