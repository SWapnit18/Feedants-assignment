import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Share, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

export default function CompetitionHeaderCard({ competition, onShare, onLike }) {
  const [isLiked, setIsLiked] = useState(false);

  const {
    title = 'Feedants Classical Dance',
    subtitle = 'Express your passion through traditional dance',
    tags = ['Dance', 'Multi-Win'],
    prizePool = 1500,
    entryFee = 99,
    capacity = {},
    currency = 'INR',
    bannerUrl = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
  } = competition || {};

  const totalSpots = capacity.totalSpots || 20;
  const spotsBooked = capacity.spotsBooked || 1;
  const spotsLeft = capacity.spotsLeft ?? Math.max(totalSpots - spotsBooked, 0);
  const percentBooked = Math.min((spotsBooked / totalSpots) * 100, 100);
  const currencySymbol = currency === 'INR' ? '₹ ' : '';

  const handleSharePress = async () => {
    try {
      if (onShare) {
        onShare();
      } else {
        await Share.share({
          message: `Join ${title} on Feedants! Win from a ₹${prizePool.toLocaleString()} prize pool. Register here: https://feedants.com/c/classical-dance`,
          title: title,
        });
      }
    } catch (err) {
      // Ignored
    }
  };

  const handleLikePress = () => {
    setIsLiked((prev) => !prev);
    if (onLike) onLike(!isLiked);
  };

  return (
    <View style={styles.container}>
      {/* 1. Hero Image Card with Overlay */}
      <View style={styles.heroCard}>
        <Image source={{ uri: bannerUrl }} style={styles.heroImage} />
        <View style={styles.heroOverlay} />

        {/* Top Badges & Action Icons Row */}
        <View style={styles.topActionsRow}>
          {/* Tags Pills */}
          <View style={styles.tagsContainer}>
            {tags.map((tag, idx) => (
              <View key={idx} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Heart & Share buttons */}
          <View style={styles.iconButtonsContainer}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleLikePress}
              activeOpacity={0.8}
            >
              <Text style={styles.actionIcon}>{isLiked ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleSharePress}
              activeOpacity={0.8}
            >
              <Text style={styles.actionIcon}>🔗</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Hero Text & Registered Badge */}
        <View style={styles.heroBottomContent}>
          <View style={styles.heroTextCol}>
            <Text style={styles.heroTitle}>{title}</Text>
            <Text style={styles.heroSubtitle}>{subtitle}</Text>
          </View>

          {competition?.user?.isRegistered !== false && (
            <View style={styles.registeredBadge}>
              <View style={styles.checkCircle}>
                <Text style={styles.checkMark}>✓</Text>
              </View>
              <Text style={styles.registeredText}>Registered</Text>
            </View>
          )}
        </View>
      </View>

      {/* 2. Key Metrics Row Card (Prize Pool | Entry Fee | Spots) */}
      <View style={styles.metricsCard}>
        {/* Prize Pool */}
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Prize Pool</Text>
          <Text style={styles.prizeValue}>
            {currencySymbol}
            {prizePool?.toLocaleString('en-IN')}
          </Text>
        </View>

        {/* Entry Fee */}
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Entry Fee</Text>
          <Text style={styles.entryValue}>
            {currencySymbol}
            {entryFee}
          </Text>
        </View>

        {/* Spots Status & Progress Bar */}
        <View style={styles.spotsItem}>
          <View style={styles.spotsHeader}>
            <Text style={styles.spotsIcon}>👥</Text>
            <Text style={styles.spotsLeftText}>
              {spotsLeft > 0 ? `Only ${spotsLeft} spots left` : 'All spots booked'}
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

          <Text style={styles.spotsRatioText}>
            {spotsBooked} / {totalSpots} Booked
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing(4),
    marginTop: spacing(2),
  },
  heroCard: {
    height: 190,
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'space-between',
    padding: spacing(3.5),
    backgroundColor: '#0F172A',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  topActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing(2.5),
    paddingVertical: 3,
    marginRight: spacing(1.5),
  },
  tagText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0F766E',
  },
  iconButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing(1.5),
  },
  actionIcon: {
    fontSize: 14,
  },
  heroBottomContent: {
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  heroTextCol: {
    flex: 1,
    paddingRight: spacing(2),
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: 11,
    color: '#E2E8F0',
    lineHeight: 15,
  },
  registeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.pill,
    paddingHorizontal: spacing(2.5),
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  checkCircle: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
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
    fontWeight: '800',
    fontSize: 10.5,
  },
  // Metrics Card Styles
  metricsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: spacing(3),
    marginTop: spacing(2.5),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 10.5,
    color: colors.textMuted,
    fontWeight: '600',
  },
  prizeValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F766E',
    marginTop: 2,
  },
  entryValue: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  spotsItem: {
    flex: 1.4,
  },
  spotsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  spotsIcon: {
    fontSize: 10,
    marginRight: 3,
  },
  spotsLeftText: {
    fontSize: 10.5,
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
  spotsRatioText: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 3,
    fontWeight: '500',
  },
});
