import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../theme';
import BottomNavBar from '../components/BottomNavBar';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feedants Home</Text>
        <Text style={styles.headerSubtitle}>Discover trending talent competitions</Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Featured Competition Banner */}
        <TouchableOpacity
          style={styles.featuredCard}
          onPress={() => navigation?.navigate('CompetitionDetails')}
          activeOpacity={0.85}
        >
          <View style={styles.badgeRow}>
            <View style={styles.badge}><Text style={styles.badgeText}>🔥 Trending</Text></View>
            <View style={styles.badgeGreen}><Text style={styles.badgeGreenText}>Open for Submissions</Text></View>
          </View>
          <Text style={styles.cardTitle}>Feedants Classical Dance</Text>
          <Text style={styles.cardDesc}>Showcase your classical dance skills to win from ₹1,500 prize pool.</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.prizeText}>Prize Pool: ₹1,500</Text>
            <View style={styles.viewBtn}>
              <Text style={styles.viewBtnText}>View Details →</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Categories Section */}
        <Text style={styles.sectionHeading}>Browse by Talent Category</Text>
        <View style={styles.grid}>
          {['Classical Dance', 'Folk Dance', 'Vocals', 'Instrumental', 'Theatre', 'Poetry'].map((item, idx) => (
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
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing(3),
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
