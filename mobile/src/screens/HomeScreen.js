import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../theme';
import BottomNavBar from '../components/BottomNavBar';
import ProfileAvatar from '../components/ProfileAvatar';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useCompetitionDetails, useCompetitions } from '../hooks/useCompetitionDetails';
import { resolveText } from '../utils/i18n';

export default function HomeScreen({ navigation }) {
  const { user } = useCurrentUser();
  const { data: comp, isLoading } = useCompetitionDetails();
  const { data: allComps = [] } = useCompetitions();

  const isRegistered = comp?.viewer?.isRegistered || comp?.user?.isRegistered;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.headerTitle}>Feedants Home</Text>
            <Text style={styles.headerSubtitle}>Discover trending talent competitions</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation?.navigate('Profile')}
            activeOpacity={0.8}
            accessibilityLabel="View Profile"
          >
            <ProfileAvatar
              name={user?.name || 'Feedants User'}
              imageUrl={user?.profileImage || user?.photoUrl}
              size={38}
              fontSize={17}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Featured Competition Banner */}
        {isLoading ? (
          <View style={[styles.featuredCard, { paddingVertical: spacing(8), alignItems: 'center' }]}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.featuredCard}
            onPress={() => navigation?.navigate('CompetitionDetails', { competitionId: comp?.slug || comp?.id })}
            activeOpacity={0.85}
          >
            <View style={styles.badgeRow}>
              <View style={styles.badge}><Text style={styles.badgeText}>🔥 Trending</Text></View>
              <View style={styles.badgeGreen}>
                <Text style={styles.badgeGreenText}>
                  {comp?.lifecycle?.phase ? comp.lifecycle.phase.replace('_', ' ') : 'Open for entries'}
                </Text>
              </View>
              {isRegistered && (
                <View style={[styles.badgeGreen, { backgroundColor: '#CCFBF1' }]}>
                  <Text style={[styles.badgeGreenText, { color: '#0F766E' }]}>✓ Registered</Text>
                </View>
              )}
            </View>
            <Text style={styles.cardTitle}>{resolveText(comp?.title, 'ENG', 'Feedants Classical Dance')}</Text>
            <Text style={styles.cardDesc} numberOfLines={3}>
              {resolveText(comp?.about, 'ENG') || resolveText(comp?.description, 'ENG') || 'Showcase your classical dance skills in this prestigious Feedants competition.'}
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.prizeText}>
                Prize Pool: ₹{comp?.prizePool == null ? '1,50,000' : comp.prizePool.toLocaleString('en-IN')}
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing(2) }}>
                <TouchableOpacity
                  style={styles.uploadBtn}
                  onPress={() => navigation?.navigate('CompetitionDetails', { competitionId: comp?.slug || comp?.id, openSubmission: true })}
                  activeOpacity={0.8}
                >
                  <Text style={styles.uploadBtnText}>Upload Video 🎥</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.viewBtn}
                  onPress={() => navigation?.navigate('CompetitionDetails', { competitionId: comp?.slug || comp?.id })}
                  activeOpacity={0.8}
                >
                  <Text style={styles.viewBtnText}>View Details →</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Live Competitions Quick List */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Browse by Talent Category</Text>
          <TouchableOpacity onPress={() => navigation?.navigate('Explore')} activeOpacity={0.7}>
            <Text style={styles.seeAllText}>See All ({allComps.length}) →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {['Classical Dance', 'Bollywood', 'Contemporary', 'Folk Dance', 'Vocals', 'Instrumental'].map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.categoryCard}
              onPress={() => navigation?.navigate('Explore')}
              activeOpacity={0.7}
            >
              <Text style={styles.categoryName}>{item}</Text>
              <Text style={styles.categorySub}>Explore Contests</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        activeTab="home"
        onTabPress={(tab) => {
          if (tab === 'home') return;
          if (tab === 'explore') navigation?.navigate('Explore');
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
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  content: {
    padding: spacing(4),
    backgroundColor: '#F8FAFC',
    flexGrow: 1,
  },
  featuredCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing(4),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(2),
    marginBottom: spacing(2),
  },
  badge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: spacing(2.5),
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  badgeGreen: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: spacing(2.5),
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  badgeGreenText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    textTransform: 'capitalize',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: spacing(3),
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: spacing(3),
  },
  prizeText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  uploadBtn: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    borderRadius: radius.pill,
  },
  uploadBtnText: {
    color: '#047857',
    fontSize: 12,
    fontWeight: '700',
  },
  viewBtn: {
    backgroundColor: '#075A4E',
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    borderRadius: radius.pill,
  },
  viewBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(3),
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(3),
  },
  categoryCard: {
    flexBasis: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing(3.5),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  categorySub: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
});
