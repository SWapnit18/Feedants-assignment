import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
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

export default function ExploreScreen({ navigation }) {
  const { user } = useCurrentUser();
  const { data: compData, isLoading } = useCompetition('feedants-classical-dance');
  const comp = compData?.competition;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Classical Dance', 'Bollywood', 'Contemporary', 'Folk', 'Vocals'];

  const spotsLeft = comp?.capacity?.spotsLeft ?? (comp ? comp.totalSpots - comp.spotsBooked : null);
  const totalSpots = comp?.capacity?.totalSpots ?? comp?.totalSpots ?? 20;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Explore Competitions</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation?.navigate('Profile')}
          activeOpacity={0.8}
          accessibilityLabel="View Profile"
        >
          <ProfileAvatar
            name={user?.name}
            imageUrl={user?.profileImage || user?.photoUrl}
            size={34}
            fontSize={15}
          />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchBoxWrapper}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by dance form, judge, or prize..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Pills */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterPill, activeCategory === cat && styles.filterPillActive]}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, activeCategory === cat && styles.filterTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing(6) }} />
        ) : comp ? (
          <TouchableOpacity
            style={styles.resultCard}
            onPress={() => navigation?.navigate('CompetitionDetails')}
            activeOpacity={0.85}
          >
            <View style={styles.cardTop}>
              <View style={{ flex: 1, paddingRight: spacing(2) }}>
                <Text style={styles.cardTitle}>{comp.title}</Text>
                <Text style={styles.judgeSubtitle}>
                  Judge: {comp.judge?.name || 'Verified Expert'} {comp.judge?.profession ? `(${comp.judge.profession})` : ''}
                </Text>
              </View>
              <View style={styles.feeBadge}>
                <Text style={styles.feeText}>₹{comp.entryFee} Fee</Text>
              </View>
            </View>
            <View style={styles.metricsRow}>
              <Text style={styles.metricText}>
                🏆 Prize: <Text style={styles.bold}>₹{comp.prizePool?.toLocaleString('en-IN')}</Text>
              </Text>
              {spotsLeft !== null && (
                <Text style={styles.metricText}>
                  👥 Spots Left: <Text style={styles.bold}>{spotsLeft}/{totalSpots}</Text>
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No competitions found.</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        activeTab="explore"
        onTabPress={(tab) => {
          if (tab === 'home') navigation?.navigate('Home');
          if (tab === 'explore') return;
          if (tab === 'create') navigation?.navigate('Create');
          if (tab === 'competitions') navigation?.navigate('CompetitionDetails');
          if (tab === 'profile') navigation?.navigate('Profile');
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
  searchBoxWrapper: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2.5),
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: radius.md,
    paddingHorizontal: spacing(3.5),
    paddingVertical: spacing(2),
    fontSize: 13,
    color: colors.text,
  },
  filterRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  filterScroll: {
    paddingHorizontal: spacing(4),
    paddingBottom: spacing(2.5),
    gap: spacing(2),
  },
  filterPill: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    borderRadius: radius.pill,
    backgroundColor: '#F1F5F9',
  },
  filterPillActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  content: {
    padding: spacing(4),
    backgroundColor: '#F8FAFC',
    flexGrow: 1,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing(4),
    borderWidth: 1.5,
    borderColor: '#0D9488',
    marginBottom: spacing(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing(2.5),
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  judgeSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  feeBadge: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: spacing(2.5),
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  feeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F766E',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: spacing(2),
  },
  metricText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  bold: {
    fontWeight: '700',
    color: colors.text,
  },
  emptyContainer: {
    paddingVertical: spacing(8),
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
