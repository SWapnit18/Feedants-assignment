import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

import { CertificateTrophyIcon, UsersOutlineIcon } from './MinimalIcons';
import { t, resolveText } from '../utils/i18n';

export default function CompetitionHeaderCard({ competition, lang = 'ENG' }) {
  const {
    title,
    tags = [],
    certificate = false,
    prizePool,
    entryFee,
    availability,
    currency,
    user = {},
  } = competition || {};

  const totalSpots = availability?.capacity || 0;
  const spotsBooked = availability?.booked || 0;
  const spotsLeft = availability?.remaining || 0;
  const percentBooked = totalSpots > 0 ? Math.min((spotsBooked / totalSpots) * 100, 100) : 0;
  const currencySymbol = currency === 'INR' ? '₹ ' : '';

  const displayTitle = resolveText(title, lang, t(lang, 'title'));
  const displayTags = tags.map((tg) => {
    if (tg.toLowerCase().includes('dance')) return t(lang, 'tagDance');
    if (tg.toLowerCase().includes('multi')) return t(lang, 'tagMultiWin');
    return tg;
  });

  return (
    <View style={styles.card}>
      {/* 1. Title & Registered Badge Row */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>{displayTitle}</Text>
        {user?.isRegistered === true && (
          <View style={styles.registeredBadge}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkMark}>✓</Text>
            </View>
            <Text style={styles.registeredText}>{t(lang, 'registeredBadge')}</Text>
          </View>
        )}
      </View>

      {/* 2. Tags Row (Dance, Multi-Win, Winners get certificate) */}
      <View style={styles.tagsRow}>
        {displayTags.map((tag, idx) => (
          <View key={idx} style={styles.tagPill}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}

        {certificate && (
          <View style={styles.certificateRow}>
            <View style={{ marginRight: 5, marginTop: 1 }}>
              <CertificateTrophyIcon size={14} color="#0F766E" />
            </View>
            <Text style={styles.certificateText}>{t(lang, 'winnersCertificate')}</Text>
          </View>
        )}
      </View>

      {/* 3. Stats Row (Prize Pool | Entry Fee | Spots Remaining) */}
      <View style={styles.statsRow}>
        {/* Prize Pool */}
        <View style={styles.statCol}>
          <Text style={styles.statLabel}>{t(lang, 'prizePool')}</Text>
          <Text style={styles.prizePoolValue}>
            {prizePool == null
              ? '—'
              : `${currencySymbol}${Math.round(prizePool >= 10000 ? prizePool / 100 : prizePool).toLocaleString('en-IN')}`}
          </Text>
        </View>

        {/* Entry Fee */}
        <View style={styles.statCol}>
          <Text style={styles.statLabel}>{t(lang, 'entryFee')}</Text>
          <Text style={styles.entryFeeValue}>
            {entryFee == null ? '—' : `${currencySymbol}${entryFee}`}
          </Text>
        </View>

        {/* Spots Left Progress */}
        <View style={styles.spotsCol}>
          <View style={styles.spotsHeader}>
            <View style={{ marginRight: 5, marginTop: 1 }}>
              <UsersOutlineIcon size={14} color="#0F766E" />
            </View>
            <Text style={styles.spotsLeftText}>
              {spotsLeft > 0 ? t(lang, 'spotsLeft', { count: spotsLeft }) : 'All spots booked'}
            </Text>
          </View>

          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.max(percentBooked, 8)}%` },
              ]}
            />
          </View>

          <Text style={styles.spotsBookedText}>
            {t(lang, 'spotsBooked', { booked: spotsBooked, total: totalSpots })}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: spacing(4),
    paddingTop: spacing(3.5),
    paddingBottom: spacing(4),
    marginHorizontal: spacing(4),
    marginTop: spacing(2.5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(2),
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    flex: 1,
    marginRight: spacing(2),
  },
  registeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F7F4',
    borderRadius: radius.pill,
    paddingHorizontal: spacing(2.5),
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#C3E8E1',
  },
  checkCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0F766E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
  },
  registeredText: {
    color: '#0F766E',
    fontWeight: '700',
    fontSize: 11,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: spacing(4),
  },
  tagPill: {
    backgroundColor: '#F1F5F9',
    borderRadius: radius.sm,
    paddingHorizontal: spacing(2.5),
    paddingVertical: 3,
    marginRight: spacing(2),
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  certificateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  trophyIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  certificateText: {
    fontSize: 11.5,
    color: '#0F766E',
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  statCol: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
  },
  prizePoolValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: -0.4,
  },
  entryFeeValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  spotsCol: {
    flex: 1.35,
  },
  spotsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  spotsIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  spotsLeftText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F766E',
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: '#0F766E',
    borderRadius: 2,
  },
  spotsBookedText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
  },
});
