import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

import { t, resolveText } from '../utils/i18n';

export default function TabsSection({ about, judgingParameters, rulesAndEligibility, lang = 'ENG' }) {
  const [activeTab, setActiveTab] = useState('about');
  const [expanded, setExpanded] = useState(false);

  const TABS = [
    { key: 'about', label: t(lang, 'tabAbout') },
    { key: 'judging', label: t(lang, 'tabJudging') },
    { key: 'rules', label: t(lang, 'tabRules') },
  ];

  const ICONS = ['👣', '🎭', '💡', '🧘', '🎵', '⭐'];
  const BG_COLORS = ['#F3E8FF', '#FFEDD5', '#DCFCE7', '#FCE7F3', '#E0F2FE', '#FEF9C3'];
  const BAR_COLORS = ['#9333EA', '#F97316', '#16A34A', '#DB2777', '#0284C7', '#EAB308'];

  const criteriaList = Array.isArray(judgingParameters) && judgingParameters.length > 0
    ? judgingParameters.map((p, idx) => {
        const pct = Number(p.percentage) || 0;
        return {
          title: p.name,
          desc: p.description,
          weight: `${pct}%`,
          progress: pct / 100,
          icon: ICONS[idx % ICONS.length],
          iconBg: BG_COLORS[idx % BG_COLORS.length],
          barColor: BAR_COLORS[idx % BAR_COLORS.length],
        };
      })
    : [
        {
          title: t(lang, 'techniqueTitle'),
          desc: t(lang, 'techniqueSub'),
          weight: '25%',
          progress: 0.25,
          icon: '👣',
          iconBg: '#F3E8FF',
          barColor: '#9333EA',
        },
        {
          title: t(lang, 'expressionTitle'),
          desc: t(lang, 'expressionSub'),
          weight: '25%',
          progress: 0.25,
          icon: '🎭',
          iconBg: '#FFEDD5',
          barColor: '#F97316',
        },
        {
          title: t(lang, 'creativityTitle'),
          desc: t(lang, 'creativitySub'),
          weight: '20%',
          progress: 0.20,
          icon: '💡',
          iconBg: '#DCFCE7',
          barColor: '#16A34A',
        },
        {
          title: t(lang, 'presentationTitle'),
          desc: t(lang, 'presentationSub'),
          weight: '15%',
          progress: 0.15,
          icon: '🧘',
          iconBg: '#FCE7F3',
          barColor: '#DB2777',
        },
        {
          title: t(lang, 'rhythmTitle'),
          desc: t(lang, 'rhythmSub'),
          weight: '15%',
          progress: 0.15,
          icon: '🎵',
          iconBg: '#E0F2FE',
          barColor: '#0284C7',
        },
      ];

  const totalPercentage = criteriaList.reduce((acc, c) => acc + Math.round(c.progress * 100), 0);

  const RULES_DATA = lang === 'हिंदी' ? [
    {
      icon: '🎯',
      title: 'पात्रता मानदंड',
      desc: 'भारत भर के सभी आयु वर्गों और कौशल स्तरों के लिए खुला है। एकल शास्त्रीय नर्तक और पंजीकृत छात्र दोनों भाग ले सकते हैं।',
    },
    {
      icon: '📹',
      title: 'वीडियो प्रारूप एवं गुणवत्ता',
      desc: 'प्रदर्शन स्पष्ट रोशनी और स्पष्ट संगीत के साथ निरंतर और असंपादित होना चाहिए। वीडियो की अवधि 1 से 10 मिनट के बीच होनी चाहिए।',
    },
    {
      icon: '👗',
      title: 'वेशभूषा और प्रस्तुति',
      desc: 'पारंपरिक शास्त्रीय पोशाक (कथक, भरतनाट्यम, ओडिसी, आदि) और घुंघरू को प्राथमिकता दी जाती है।',
    },
    {
      icon: '🚫',
      title: 'मौलिकता और अयोग्यता',
      desc: 'प्रविष्टियाँ मूल होनी चाहिए और किसी अन्य सक्रिय प्रतियोगिता में प्रकाशित नहीं होनी चाहिए। कोई भी डिजिटल प्रभाव अयोग्यता का कारण बनेगा।',
    },
  ] : [
    {
      icon: '🎯',
      title: 'Eligibility Criteria',
      desc: 'Open to all age groups and skill levels across India. Both solo classical dancers and registered students can participate.',
    },
    {
      icon: '📹',
      title: 'Video Format & Quality',
      desc: 'Performance must be continuous, unedited, well-lit with clear classical audio. Video duration must be between 1 to 10 minutes.',
    },
    {
      icon: '👗',
      title: 'Costume & Presentation',
      desc: 'Traditional classical attire (Kathak, Bharatanatyam, Odissi, etc.) with ghungroos/accessories is encouraged.',
    },
    {
      icon: '🚫',
      title: 'Originality & Disqualification',
      desc: 'Entries must be original and not published in another active competition. Any pre-recorded lip-sync or digital effects will lead to disqualification.',
    },
  ];

  const resolvedAbout = resolveText(about, lang);
  const aboutText = lang === 'हिंदी' ? t(lang, 'aboutText') : (resolvedAbout || t('ENG', 'aboutText'));
  const isLong = aboutText.length > 130;
  const displayAboutText = expanded || !isLong ? aboutText : `${aboutText.slice(0, 130)}...`;

  return (
    <View style={styles.card}>
      {/* Tabs Header */}
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

      {/* Tab 1: About Competition */}
      {activeTab === 'about' && (
        <View>
          <Text style={styles.bodyText}>{displayAboutText}</Text>
          {isLong && (
            <TouchableOpacity
              onPress={() => setExpanded((v) => !v)}
              style={styles.viewMoreButton}
              activeOpacity={0.7}
            >
              <Text style={styles.viewMoreText}>
                {expanded ? t(lang, 'viewLess') : t(lang, 'viewMore')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Tab 2: Judging Parameters */}
      {activeTab === 'judging' && (
        <View style={styles.judgingContainer}>
          {criteriaList.map((item, index) => (
            <View key={index} style={styles.criteriaCard}>
              <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
                <Text style={styles.iconText}>{item.icon}</Text>
              </View>
              <View style={styles.criteriaContent}>
                <View style={styles.criteriaHeader}>
                  <Text style={styles.criteriaTitle}>{item.title}</Text>
                  <Text style={[styles.criteriaWeight, { color: item.barColor }]}>
                    {item.weight}
                  </Text>
                </View>
                <Text style={styles.criteriaDesc}>{item.desc}</Text>
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${item.progress * 100}%`,
                        backgroundColor: item.barColor,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          ))}

          {/* Total Marks Banner */}
          <View style={styles.totalMarksCard}>
            <View style={styles.trophyIconBox}>
              <Text style={styles.trophyIcon}>🏆</Text>
            </View>
            <View style={styles.totalMarksContent}>
              <Text style={styles.totalMarksTitle}>{t(lang, 'totalMarksTitle')}</Text>
              <Text style={styles.totalMarksDesc}>{t(lang, 'totalMarksSub')}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Tab 3: Rules & Eligibility */}
      {activeTab === 'rules' && (
        <View style={styles.rulesContainer}>
          {RULES_DATA.map((rule, idx) => (
            <View key={idx} style={styles.ruleItem}>
              <View style={styles.ruleIconBox}>
                <Text style={styles.ruleIcon}>{rule.icon}</Text>
              </View>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleTitle}>{rule.title}</Text>
                <Text style={styles.ruleDesc}>{rule.desc}</Text>
              </View>
            </View>
          ))}
        </View>
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
  judgingContainer: {
    marginTop: spacing(1),
  },
  criteriaCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing(3.5),
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing(3),
    marginTop: 2,
  },
  iconText: {
    fontSize: 18,
  },
  criteriaContent: {
    flex: 1,
  },
  criteriaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  criteriaTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  criteriaWeight: {
    fontSize: 13,
    fontWeight: '800',
  },
  criteriaDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 6,
  },
  progressBarTrack: {
    height: 5,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  totalMarksCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: spacing(3),
    marginTop: spacing(2),
  },
  trophyIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing(3),
  },
  trophyIcon: {
    fontSize: 20,
  },
  totalMarksContent: {
    flex: 1,
  },
  totalMarksTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  totalMarksDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  rulesContainer: {
    marginTop: spacing(1),
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing(3),
  },
  ruleIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E6F7F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing(2.5),
  },
  ruleIcon: {
    fontSize: 16,
  },
  ruleContent: {
    flex: 1,
  },
  ruleTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  ruleDesc: {
    fontSize: 11.5,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});
