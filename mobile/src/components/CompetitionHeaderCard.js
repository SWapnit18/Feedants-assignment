import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

export default function CompetitionHeaderCard({ competition }) {
  const { title, tags = [], hasCertificateForWinners, prizePool, entryFee, capacity = {}, currency } = competition;
  const spotsLeft = capacity.spotsLeft ?? Math.max((capacity.totalSpots || 20) - (capacity.spotsBooked || 0), 0);
  const totalSpots = capacity.totalSpots || 20;
  const spotsBooked = capacity.spotsBooked || 0;
  const percentBooked = Math.min((spotsBooked / totalSpots) * 100, 100);
  const currencySymbol = currency === 'INR' ? '₹ ' : '';

  return (
    <View style={styles.card}>
      {/* Title & Registration Badge */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        {competition.user?.isRegistered && (
          <View style={styles.registeredPill}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
            <Text style={styles.registeredPillText}>Registered</Text>
          </View>
        )}
      </View>

      {/* Category Tags & Certificate badge */}
      <View style={styles.tagsRow}>
        {tags.map((tag) => (
          <View key={tag} style={styles.tagPill}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
        {hasCertificateForWinners && (
          <View style={styles.certificateRow}>
            <Text style={styles.trophyIcon}>🏆</Text>
            <Text style={styles.certificateText}>Winners get certificate</Text>
          </View>
        )}
      </View>

      {/* 3 Metrics: Prize Pool, Entry Fee, Spots */}
      <View style={styles.metricsRow}>
        <View style={styles.metricBlock}>
          <Text style={styles.metricLabel}>Prize Pool</Text>
          <Text style={styles.prizePoolValue}>
            {currencySymbol}{prizePool?.toLocaleString('en-IN') || '1,500'}
          </Text>
        </View>

        <View style={styles.metricBlock}>
          <Text style={styles.metricLabel}>Entry Fee</Text>
          <Text style={styles.entryFeeValue}>
            {currencySymbol}{entryFee || '99'}
          </Text>
        </View>

        <View style={styles.spotsBlock}>
          <View style={styles.spotsLabelRow}>
            <Text style={styles.spotsIcon}>👥</Text>
            <Text style={styles.spotsLabel}>
              {spotsLeft > 0 ? `Only ${spotsLeft} spots left` : 'All spots booked'}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.max(percentBooked, 8)}%` }]} />
          </View>
          <Text style={styles.spotsSubLabel}>
            {spotsBooked} / {totalSpots} Booked
          </Text>
        </View>
      </View>
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
    marginTop: spacing(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    paddingRight: spacing(2),
    letterSpacing: -0.3,
  },
  registeredPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1),
    borderWidth: 1,
    borderColor: '#C3E8E1',
  },
  checkCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  checkIcon: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 12,
  },
  registeredPillText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 11,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing(2),
    flexWrap: 'wrap',
  },
  tagPill: {
    backgroundColor: colors.grayPillBg,
    borderRadius: radius.sm,
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1),
    marginRight: spacing(2),
    marginBottom: spacing(1),
  },
  tagText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  certificateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing(1),
  },
  trophyIcon: {
    fontSize: 13,
    marginRight: 4,
  },
  certificateText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    marginTop: spacing(3.5),
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  metricBlock: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  prizePoolValue: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2,
    letterSpacing: -0.3,
  },
  entryFeeValue: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
    letterSpacing: -0.3,
  },
  spotsBlock: {
    flex: 1.35,
  },
  spotsLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing(1.5),
  },
  spotsIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  spotsLabel: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  spotsSubLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing(1),
    fontWeight: '500',
  },
});
