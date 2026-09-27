import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { t } from '../utils/i18n';
import ProfileAvatar from './ProfileAvatar';

export default function UserFeedbackCard({ testimonials = [], onOpenAll, lang = 'ENG' }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const hasTestimonials = Array.isArray(testimonials) && testimonials.length > 0;

  const handlePrev = () => {
    if (!hasTestimonials) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : testimonials.length - 1));
  };

  const handleNext = () => {
    if (!hasTestimonials) return;
    setCurrentIndex((prev) => (prev < testimonials.length - 1 ? prev + 1 : 0));
  };

  const current = hasTestimonials ? testimonials[currentIndex] : null;

  return (
    <View style={styles.container}>
      {/* 1. Main Collapsed Row */}
      <TouchableOpacity
        style={styles.bannerRow}
        onPress={() => setIsExpanded((v) => !v)}
        activeOpacity={0.8}
      >
        <Text style={styles.chatIcon}>💬</Text>
        <View style={styles.bannerTextGroup}>
          <Text style={styles.bannerTitle}>{t(lang, 'hearFromUsers')}</Text>
          <Text style={styles.bannerSubtitle}>{t(lang, 'seeParticipantsSay')}</Text>
        </View>
        <Text style={styles.arrowIcon}>{isExpanded ? '⌃' : '›'}</Text>
      </TouchableOpacity>

      {/* 2. Expanded Carousel or Real Empty State */}
      {isExpanded && (
        <View style={styles.expandedWrapper}>
          {!hasTestimonials ? (
            /* Real Empty State: Requirement #15 & #20 */
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No testimonials yet.</Text>
              <Text style={styles.emptySubtext}>
                Reviews and feedback from participants will appear here once submitted.
              </Text>
            </View>
          ) : (
            <>
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
                    {current.avatar || current.photoUrl ? (
                      <Image source={{ uri: current.avatar || current.photoUrl }} style={styles.avatar} />
                    ) : (
                      <ProfileAvatar name={current.author || current.userName || current.name} size={40} fontSize={16} style={{ marginRight: spacing(2) }} />
                    )}
                    <View style={styles.textGroup}>
                      <Text style={styles.quoteText}>"{current.quote || current.comment || current.text}"</Text>
                      <Text style={styles.authorText}>{current.author || current.userName || current.name}</Text>
                      {current.subtitle ? (
                        <Text style={styles.subtitleText}>{current.subtitle}</Text>
                      ) : null}
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
              {testimonials.length > 1 && (
                <View style={styles.paginationDots}>
                  {testimonials.map((_, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setCurrentIndex(idx)}
                      style={[styles.dot, idx === currentIndex && styles.dotActive]}
                    />
                  ))}
                </View>
              )}
            </>
          )}
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
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: spacing(4),
    paddingHorizontal: spacing(3.5),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 11.5,
    color: colors.textMuted,
    textAlign: 'center',
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
