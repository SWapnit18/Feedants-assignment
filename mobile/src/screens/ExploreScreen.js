import React, { useState, useMemo } from 'react';
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
import { useCompetitions } from '../hooks/useCompetitionDetails';

export default function ExploreScreen({ navigation }) {
  const { user } = useCurrentUser();
  const { data: competitions = [], isLoading, refetch } = useCompetitions();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Classical Dance', 'Bollywood', 'Contemporary', 'Folk', 'Vocals'];

  const filteredCompetitions = useMemo(() => {
    return competitions.filter((comp) => {
      // Category match
      const categoryMatch =
        activeCategory === 'All' ||
        (comp.category && comp.category.toLowerCase().includes(activeCategory.toLowerCase())) ||
        (comp.tags && comp.tags.some((t) => t.toLowerCase().includes(activeCategory.toLowerCase())));

      // Search query match
      const q = searchQuery.trim().toLowerCase();
      const searchMatch =
        !q ||
        (comp.title && comp.title.toLowerCase().includes(q)) ||
        (comp.category && comp.category.toLowerCase().includes(q)) ||
        (comp.judge?.name && comp.judge.name.toLowerCase().includes(q)) ||
        (comp.tags && comp.tags.some((t) => t.toLowerCase().includes(q))) ||
        (comp.prizePool && String(comp.prizePool).includes(q));

      return categoryMatch && searchMatch;
    });
  }, [competitions, activeCategory, searchQuery]);

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
              onPress={() => {
                React.startTransition(() => {
                  setActiveCategory(cat);
                });
              }}
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
        ) : filteredCompetitions.length > 0 ? (
          filteredCompetitions.map((comp) => {
            const spotsLeft = comp.availability?.remaining ?? null;
            const totalSpots = comp.availability?.capacity ?? null;
            const isRegistered = comp.isRegistered;

            return (
              <TouchableOpacity
                key={comp.id || comp.slug}
                style={[styles.resultCard, isRegistered && styles.registeredCard]}
                onPress={() => navigation?.navigate('CompetitionDetails', { competitionId: comp.slug || comp.id })}
                activeOpacity={0.85}
              >
                <View style={styles.cardTop}>
                  <View style={{ flex: 1, paddingRight: spacing(2) }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <Text style={styles.cardTitle}>{comp.title}</Text>
                      {isRegistered && (
                        <View style={styles.registeredBadge}>
                          <Text style={styles.registeredBadgeText}>✓ Registered</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.judgeSubtitle}>
                      {comp.judge?.name ? `Judge: ${comp.judge.name}` : `Category: ${comp.category || 'Dance'}`}
                    </Text>
                  </View>
                  <View style={styles.feeBadge}>
                    <Text style={styles.feeText}>
                      {comp.entryFee > 0 ? `₹${comp.entryFee} Fee` : 'Free Entry'}
                    </Text>
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
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No competitions found</Text>
            <Text style={styles.emptyText}>Try adjusting your search query or category filter.</Text>
            <TouchableOpacity
              style={styles.resetFilterBtn}
              onPress={() => {
                React.startTransition(() => {
                  setActiveCategory('All');
                  setSearchQuery('');
                });
              }}
            >
              <Text style={styles.resetFilterText}>Clear Filters</Text>
            </TouchableOpacity>
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
    borderColor: '#E2E8F0',
    marginBottom: spacing(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  registeredCard: {
    borderColor: '#0D9488',
    backgroundColor: '#FAFCFB',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing(2.5),
  },
  cardTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: colors.text,
  },
  registeredBadge: {
    backgroundColor: '#E6FFFA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  registeredBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0D9488',
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
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: spacing(2),
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing(3),
    textAlign: 'center',
  },
  resetFilterBtn: {
    backgroundColor: '#0F766E',
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: radius.md,
  },
  resetFilterText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12.5,
  },
});
