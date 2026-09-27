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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Testimonials</Text>
        <TouchableOpacity onPress={onOpenAll} activeOpacity={0.7}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Testimonial Card with Left/Right Arrows */}
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
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing(3),
    paddingHorizontal: spacing(4),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(2),
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  viewAllText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F766E',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  navArrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textSecondary,
    lineHeight: 20,
  },
  contentCol: {
    flex: 1,
    paddingHorizontal: spacing(2.5),
  },
  quoteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: spacing(2.5),
    backgroundColor: '#E2E8F0',
  },
  textGroup: {
    flex: 1,
  },
  quoteText: {
    fontSize: 11.5,
    fontStyle: 'italic',
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 4,
  },
  authorText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  subtitleText: {
    fontSize: 10.5,
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
