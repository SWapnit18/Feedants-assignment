import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import { Video } from 'expo-av';
import { colors, radius, spacing } from '../theme';

const YEARS = ['2024', '2023', '2022', '2021'];

const WINNERS_BY_YEAR = {
  '2024': {
    top3: [
      {
        rank: '1st',
        rankColor: '#F59E0B',
        badgeBg: '#FEF3C7',
        name: 'Riya Shah',
        positionLabel: '1st Winner',
        prize: '₹ 550',
        photo: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&auto=format&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      },
      {
        rank: '2nd',
        rankColor: '#64748B',
        badgeBg: '#F1F5F9',
        name: 'Neha Verma',
        positionLabel: '2nd Winner',
        prize: '₹ 300',
        photo: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&auto=format&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      },
      {
        rank: '3rd',
        rankColor: '#D97706',
        badgeBg: '#FFEDD5',
        name: 'Ishita Choudhary',
        positionLabel: '3rd Winner',
        prize: '₹ 240',
        photo: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&auto=format&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      },
    ],
    runnersUp: [
      {
        rank: 4,
        name: 'Aditi Sharma',
        positionLabel: '4th Winner',
        prize: '₹ 200',
        photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      },
      {
        rank: 5,
        name: 'Kavya Menon',
        positionLabel: '5th Winner',
        prize: '₹ 130',
        photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
      },
      {
        rank: 6,
        name: 'Tanvi Rao',
        positionLabel: '6th Winner',
        prize: '₹ 80',
        photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
      },
    ],
  },
  '2023': {
    top3: [
      {
        rank: '1st',
        rankColor: '#F59E0B',
        badgeBg: '#FEF3C7',
        name: 'Aarav Mehta',
        positionLabel: '1st Winner',
        prize: '₹ 500',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      },
      {
        rank: '2nd',
        rankColor: '#64748B',
        badgeBg: '#F1F5F9',
        name: 'Pooja Iyer',
        positionLabel: '2nd Winner',
        prize: '₹ 300',
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      },
      {
        rank: '3rd',
        rankColor: '#D97706',
        badgeBg: '#FFEDD5',
        name: 'Divya Nambiar',
        positionLabel: '3rd Winner',
        prize: '₹ 200',
        photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      },
    ],
    runnersUp: [
      {
        rank: 4,
        name: 'Sunita Roy',
        positionLabel: '4th Winner',
        prize: '₹ 150',
        photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
      },
      {
        rank: 5,
        name: 'Rohan Deshmukh',
        positionLabel: '5th Winner',
        prize: '₹ 100',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      },
      {
        rank: 6,
        name: 'Ananya Sen',
        positionLabel: '6th Winner',
        prize: '₹ 60',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      },
    ],
  },
};

const GALLERY_ITEMS = [
  {
    title: 'Kathak Classical Performance',
    photo: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    title: 'Bharatanatyam Varnam Solo',
    photo: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  },
  {
    title: 'Odissi Abhinaya Express',
    photo: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  },
];

import { t } from '../utils/i18n';

export default function PreviousWinners({ winners = [], lang = 'ENG' }) {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [activeVideo, setActiveVideo] = useState(null);

  const currentData = WINNERS_BY_YEAR[selectedYear] || WINNERS_BY_YEAR['2024'];

  const getPositionLabel = (pos) => {
    if (pos === '1st Winner' || pos === 1) return t(lang, 'firstWinner');
    if (pos === '2nd Winner' || pos === 2) return t(lang, 'secondWinner');
    if (pos === '3rd Winner' || pos === 3) return t(lang, 'thirdWinner');
    if (pos === '4th Winner' || pos === 4) return t(lang, 'fourthWinner');
    if (pos === '5th Winner' || pos === 5) return t(lang, 'fifthWinner');
    if (pos === '6th Winner' || pos === 6) return t(lang, 'sixthWinner');
    return pos;
  };

  return (
    <View style={styles.wrapper}>
      {/* Title & Year Filters Header */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>{t(lang, 'previousWinners')}</Text>
      </View>

      {/* Year Tabs Pill Bar */}
      <View style={styles.yearPillsContainer}>
        {YEARS.map((yr) => {
          const isActive = yr === selectedYear;
          return (
            <TouchableOpacity
              key={yr}
              style={[styles.yearPill, isActive && styles.yearPillActive]}
              onPress={() => setSelectedYear(yr)}
              activeOpacity={0.8}
            >
              <Text style={[styles.yearPillText, isActive && styles.yearPillTextActive]}>
                {yr}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Top 3 Podium Cards */}
      <View style={styles.podiumRow}>
        {currentData.top3.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.podiumCard}
            onPress={() => item.videoUrl && setActiveVideo(item.videoUrl)}
            activeOpacity={0.85}
          >
            <View style={styles.podiumPhotoContainer}>
              <Image source={{ uri: item.photo }} style={styles.podiumPhoto} />
              <View style={[styles.rankTag, { backgroundColor: item.rankColor }]}>
                <Text style={styles.rankTagText}>{item.rank}</Text>
              </View>
              <View style={styles.playOverlayBadge}>
                <Text style={styles.playOverlayIcon}>▶</Text>
              </View>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.podiumPosition}>{getPositionLabel(item.positionLabel)}</Text>
            <Text style={styles.podiumPrize}>{item.prize}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Ranks 4 to 6 List Cards */}
      <View style={styles.runnersUpContainer}>
        {currentData.runnersUp.map((runner) => (
          <View key={runner.rank} style={styles.runnerRow}>
            <Text style={styles.runnerRankNum}>{runner.rank}</Text>
            <Image source={{ uri: runner.photo }} style={styles.runnerAvatar} />
            <View style={styles.runnerInfoCol}>
              <Text style={styles.runnerName}>{runner.name}</Text>
              <Text style={styles.runnerPosition}>{getPositionLabel(runner.positionLabel)}</Text>
            </View>
            <Text style={styles.runnerPrize}>{runner.prize}</Text>
          </View>
        ))}
      </View>

      {/* Gallery Section */}
      <View style={styles.gallerySection}>
        <View style={styles.galleryHeader}>
          <Text style={styles.galleryTitle}>{t(lang, 'gallery')}</Text>
          <TouchableOpacity
            onPress={() =>
              setActiveVideo(
                'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
              )
            }
          >
            <Text style={styles.viewAllText}>{t(lang, 'viewAll')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.galleryGrid}>
          {GALLERY_ITEMS.map((gItem, gIdx) => (
            <TouchableOpacity
              key={gIdx}
              style={styles.galleryThumbnail}
              onPress={() => setActiveVideo(gItem.videoUrl)}
              activeOpacity={0.85}
            >
              <Image source={{ uri: gItem.photo }} style={styles.galleryImage} />
              <View style={styles.galleryPlayBadge}>
                <Text style={styles.galleryPlayIcon}>▶</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Video Modal Player */}
      <Modal
        visible={!!activeVideo}
        animationType="fade"
        transparent={false}
        onRequestClose={() => setActiveVideo(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setActiveVideo(null)}>
            <Text style={styles.closeText}>✕ Close</Text>
          </TouchableOpacity>
          {activeVideo && (
            <Video
              source={{ uri: activeVideo }}
              style={styles.videoPlayer}
              useNativeControls
              resizeMode="contain"
              shouldPlay
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: spacing(3),
    paddingHorizontal: spacing(4),
  },
  headerRow: {
    marginBottom: spacing(2),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.2,
  },
  yearPillsContainer: {
    flexDirection: 'row',
    marginBottom: spacing(3),
  },
  yearPill: {
    paddingHorizontal: spacing(3.5),
    paddingVertical: spacing(1),
    borderRadius: radius.pill,
    backgroundColor: '#E0F2FE',
    marginRight: spacing(2),
  },
  yearPillActive: {
    backgroundColor: '#0F766E',
  },
  yearPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0369A1',
  },
  yearPillTextActive: {
    color: '#FFFFFF',
  },
  // Podium Row Styles
  podiumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing(3),
  },
  podiumCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: spacing(2),
    alignItems: 'center',
    marginHorizontal: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  podiumPhotoContainer: {
    width: '100%',
    height: 96,
    borderRadius: radius.sm,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F1F5F9',
    marginBottom: spacing(1.5),
  },
  podiumPhoto: {
    width: '100%',
    height: '100%',
  },
  rankTag: {
    position: 'absolute',
    top: 4,
    left: 4,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  rankTagText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  playOverlayBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 118, 110, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  playOverlayIcon: {
    color: '#FFFFFF',
    fontSize: 9,
    marginLeft: 1,
  },
  podiumName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 1,
  },
  podiumPosition: {
    fontSize: 10,
    color: '#0F766E',
    fontWeight: '600',
    marginBottom: 2,
  },
  podiumPrize: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F766E',
  },
  // Runners up list
  runnersUpContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1),
    marginBottom: spacing(4),
  },
  runnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing(2),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  runnerRankNum: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textSecondary,
    width: 20,
  },
  runnerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: spacing(2.5),
  },
  runnerInfoCol: {
    flex: 1,
  },
  runnerName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  runnerPosition: {
    fontSize: 10,
    color: colors.textMuted,
  },
  runnerPrize: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F766E',
  },
  // Gallery Section Styles
  gallerySection: {
    marginTop: spacing(1),
    marginBottom: spacing(2),
  },
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(2),
  },
  galleryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  viewAllText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F766E',
  },
  galleryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  galleryThumbnail: {
    flex: 1,
    height: 78,
    borderRadius: radius.sm,
    overflow: 'hidden',
    position: 'relative',
    marginHorizontal: 3,
    backgroundColor: '#1E293B',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryPlayBadge: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  galleryPlayIcon: {
    color: '#FFFFFF',
    fontSize: 10,
    marginLeft: 1,
  },
  // Video Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#0A0E1A',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 52,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  closeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  videoPlayer: {
    width: '100%',
    height: 300,
  },
});
