import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../theme';
import BottomNavBar from '../components/BottomNavBar';

export default function ExploreScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Classical Dance', 'Bollywood', 'Contemporary', 'Folk', 'Vocals'];

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
        <Text style={styles.headerTitle}>Explore Competitions</Text>
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
        {/* Main Competition Result */}
        <TouchableOpacity
          style={styles.resultCard}
          onPress={() => navigation?.navigate('CompetitionDetails')}
          activeOpacity={0.85}
        >
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.cardTitle}>Feedants Classical Dance</Text>
              <Text style={styles.judgeSubtitle}>Judge: Manju Dubey (Kathak)</Text>
            </View>
            <View style={styles.feeBadge}>
              <Text style={styles.feeText}>₹99 Fee</Text>
            </View>
          </View>
          <View style={styles.metricsRow}>
            <Text style={styles.metricText}>🏆 Prize: <Text style={styles.bold}>₹1,500</Text></Text>
            <Text style={styles.metricText}>👥 Spots Left: <Text style={styles.bold}>19/20</Text></Text>
          </View>
        </TouchableOpacity>

        {/* Mock Secondary Result */}
        <View style={styles.resultCardSecondary}>
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.cardTitleSecondary}>Folk Beats 2026</Text>
              <Text style={styles.judgeSubtitle}>Starts 15 Sept 2026</Text>
            </View>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Upcoming</Text>
            </View>
          </View>
          <View style={styles.metricsRow}>
            <Text style={styles.metricText}>🏆 Prize: <Text style={styles.bold}>₹3,000</Text></Text>
            <Text style={styles.metricText}>👥 Spots: <Text style={styles.bold}>50</Text></Text>
          </View>
        </View>
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
  resultCardSecondary: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing(4),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing(3),
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
  cardTitleSecondary: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
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
  comingSoonBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: spacing(2.5),
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
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
});
