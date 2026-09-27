import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

const TESTIMONIALS = [
  {
    quote:
      'Amazing platform! The organization and judging process was very professional.',
    author: 'Riya Shah',
    subtitle: '1st Winner 2024',
    avatar:
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&auto=format&fit=crop&q=80',
  },
  {
    quote:
      'The feedback from Manju Dubey ma’am helped me refine my footwork and expressions.',
    author: 'Neha Verma',
    subtitle: '2nd Winner 2024',
    avatar:
      'https://images.unsplash.com/photo-1547153760-18fc86324498?w=200&auto=format&fit=crop&q=80',
  },
  {
    quote:
      'Instant prize payout through Razorpay without any hassle. Loved the entire journey!',
    author: 'Ishita Choudhary',
    subtitle: '3rd Winner 2024',
    avatar:
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&auto=format&fit=crop&q=80',
  },
  {
    quote:
      'Great exposure for classical dancers across India. A must-participate competition.',
    author: 'Aditi Sharma',
    subtitle: '4th Winner 2024',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
];

export default function UserFeedbackCard({ onOpenAll }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : TESTIMONIALS.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < TESTIMONIALS.length - 1 ? prev + 1 : 0));
  };

  const current = TESTIMONIALS[currentIndex];

  return (
    <View style={styles.container}>
      {/* 1. Main Collapsed Row matching the exact screenshot */}
      <TouchableOpacity
        style={styles.bannerRow}
        onPress={() => setIsExpanded((v) => !v)}
        activeOpacity={0.8}
      >
        <Text style={styles.chatIcon}>💬</Text>
        <View style={styles.bannerTextGroup}>
          <Text style={styles.bannerTitle}>Hear From Our Users</Text>
          <Text style={styles.bannerSubtitle}>See what participants say about Feedants</Text>
        </View>
        <Text style={styles.arrowIcon}>{isExpanded ? '⌃' : '›'}</Text>
      </TouchableOpacity>

      {/* 2. Expanded Carousel */}
      {isExpanded && (
        <View style={styles.expandedWrapper}>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.navArrowBtn}
              onPress={handlePrev}
              activeOpacity={0.7}
            >
              <Text style={styles.navArrowText}>‹</Text>
            </TouchableOpacity>

            <View style={styles.contentCol}>
              <View style={styles.quoteRow}>
                <Image source={{ uri: current.avatar }} style={styles.avatar} />
                <View style={styles.textGroup}>
                  <Text style={styles.quoteText}>"{current.quote}"</Text>
                  <Text style={styles.authorText}>{current.author}</Text>
                  <Text style={styles.subtitleText}>{current.subtitle}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.navArrowBtn}
              onPress={handleNext}
              activeOpacity={0.7}
            >
              <Text style={styles.navArrowText}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Pagination Dots */}
          <View style={styles.paginationDots}>
            {TESTIMONIALS.map((_, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setCurrentIndex(idx)}
                style={[styles.dot, idx === currentIndex && styles.dotActive]}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing(3),
    marginHorizontal: spacing(4),
  },
  bannerRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: spacing(3.5),
    paddingVertical: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  chatIcon: {
    fontSize: 18,
    marginRight: spacing(3),
  },
  bannerTextGroup: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  bannerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  arrowIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#94A3B8',
    marginLeft: spacing(2),
  },
  expandedWrapper: {
    marginTop: spacing(2.5),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
  },
  navArrowBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
    lineHeight: 18,
  },
  contentCol: {
    flex: 1,
    paddingHorizontal: spacing(2),
  },
  quoteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing(2),
    backgroundColor: '#E2E8F0',
  },
  textGroup: {
    flex: 1,
  },
  quoteText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: colors.textSecondary,
    lineHeight: 15,
    marginBottom: 3,
  },
  authorText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.text,
  },
  subtitleText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing(2),
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 3,
  },
  dotActive: {
    backgroundColor: '#0F766E',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
