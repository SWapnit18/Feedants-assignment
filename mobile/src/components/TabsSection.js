import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

const TABS = [
  { key: 'about', label: 'About Competition' },
  { key: 'judging', label: 'Judging Parameters' },
  { key: 'rules', label: 'Rules & Eligibility' },
];

export default function TabsSection({ about, judgingParameters, rulesAndEligibility }) {
  const [activeTab, setActiveTab] = useState('about');
  const [expanded, setExpanded] = useState(false);

  const contentMap = {
    about: about || 'This is an online classical dance competition open for all age groups. Participate from anywhere and showcase your talent. Express your passion through traditional dance.',
    judging: judgingParameters || 'Entries are judged on technique, rhythm (Taal), emotional expression (Bhava), choreography originality, costume, and overall stage presence by our panel of professional dancers.',
    rules: rulesAndEligibility || 'Open to all age groups and skill levels. One entry per participant. Video performance must be continuous and unedited between 2 to 3 minutes.',
  };

  const content = contentMap[activeTab] || '';
  const isLong = content.length > 130;
  const displayText = expanded || !isLong ? content : `${content.slice(0, 130)}...`;

  return (
    <View style={styles.card}>
      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabButton}
              onPress={() => {
                setActiveTab(tab.key);
                setExpanded(false);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.bodyText}>{displayText}</Text>

      {isLong && (
        <TouchableOpacity
          onPress={() => setExpanded((v) => !v)}
          style={styles.viewMoreButton}
          activeOpacity={0.7}
        >
          <Text style={styles.viewMoreText}>
            {expanded ? 'View less ⌃' : 'View more ⌄'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(4),
    marginHorizontal: spacing(4),
    marginTop: spacing(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: spacing(3),
  },
  tabButton: {
    marginRight: spacing(4),
    paddingBottom: spacing(2),
    position: 'relative',
  },
  tabLabel: {
    fontSize: 12.5,
    color: colors.textMuted,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: colors.primary,
    borderRadius: 1.5,
  },
  bodyText: {
    fontSize: 12.5,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  viewMoreButton: {
    alignSelf: 'center',
    marginTop: spacing(2.5),
    paddingVertical: spacing(1),
    paddingHorizontal: spacing(2),
  },
  viewMoreText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
});
