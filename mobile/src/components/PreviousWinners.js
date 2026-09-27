import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Video } from 'expo-av';
import { colors, radius, spacing } from '../theme';
import { t } from '../utils/i18n';
import ProfileAvatar from './ProfileAvatar';

export default function PreviousWinners({ winners = [], lang = 'ENG' }) {
  const [activeVideo, setActiveVideo] = useState(null);

  const hasWinners = Array.isArray(winners) && winners.length > 0;

  // Extract distinct years if winners exist
  const years = hasWinners
    ? Array.from(new Set(winners.map((w) => String(w.year)).filter(Boolean))).sort().reverse()
    : [];

  const [selectedYear, setSelectedYear] = useState(years[0] || null);

  const filteredWinners = hasWinners
    ? winners.filter((w) => !selectedYear || String(w.year) === selectedYear)
    : [];

  const top3 = filteredWinners.filter((w) => Number(w.position) <= 3);
  const runnersUp = filteredWinners.filter((w) => Number(w.position) > 3);

  const getPositionLabel = (item) => {
    const pos = item.position;
    if (pos === 1 || item.positionLabel === '1st Winner') return t(lang, 'firstWinner');
    if (pos === 2 || item.positionLabel === '2nd Winner') return t(lang, 'secondWinner');
    if (pos === 3 || item.positionLabel === '3rd Winner') return t(lang, 'thirdWinner');
    if (pos === 4 || item.positionLabel === '4th Winner') return t(lang, 'fourthWinner');
    if (pos === 5 || item.positionLabel === '5th Winner') return t(lang, 'fifthWinner');
    if (pos === 6 || item.positionLabel === '6th Winner') return t(lang, 'sixthWinner');
    return item.positionLabel || `${pos}th Place`;
  };

  const getRankColor = (pos) => {
    if (pos === 1) return '#F59E0B';
    if (pos === 2) return '#64748B';
    if (pos === 3) return '#D97706';
    return colors.primary;
  };

  return (
    <View style={styles.wrapper}>
      {/* Title Header */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>{t(lang, 'previousWinners')}</Text>
      </View>

      {!hasWinners ? (
        /* Real Empty State: Requirement #12 & #20 */
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🏆</Text>
          <Text style={styles.emptyText}>No previous winners yet.</Text>
          <Text style={styles.emptySubtext}>
            Be the first champion to take home the prize!
          </Text>
        </View>
      ) : (
        <>
          {/* Year Tabs Pill Bar */}
          {years.length > 1 && (
            <View style={styles.yearPillsContainer}>
              {years.map((yr) => {
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
          )}

          {/* Top 3 Podium Cards */}
          {top3.length > 0 && (
            <View style={styles.podiumRow}>
              {top3.map((item, idx) => (
                <TouchableOpacity
                  key={item._id || idx}
                  style={styles.podiumCard}
                  onPress={() => item.videoUrl && setActiveVideo(item.videoUrl)}
                  activeOpacity={item.videoUrl ? 0.85 : 1}
                >
                  <View style={styles.podiumPhotoContainer}>
                    {item.photoUrl ? (
                      <Image source={{ uri: item.photoUrl }} style={styles.podiumPhoto} />
                    ) : (
                      <ProfileAvatar name={item.name} size={64} fontSize={26} />
                    )}
                    <View style={[styles.rankTag, { backgroundColor: getRankColor(item.position) }]}>
                      <Text style={styles.rankTagText}>
                        {item.position === 1 ? '1st' : item.position === 2 ? '2nd' : '3rd'}
                      </Text>
                    </View>
                    {item.videoUrl ? (
                      <View style={styles.playOverlayBadge}>
                        <Text style={styles.playOverlayIcon}>▶</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.podiumPosition}>{getPositionLabel(item)}</Text>
                  {item.prize ? (
                    <Text style={styles.podiumPrize}>₹{item.prize}</Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Runners Up List */}
          {runnersUp.length > 0 && (
            <View style={styles.runnersUpContainer}>
              {runnersUp.map((runner) => (
                <View key={runner._id || runner.position} style={styles.runnerRow}>
                  <Text style={styles.runnerRankNum}>{runner.position}</Text>
                  {runner.photoUrl ? (
                    <Image source={{ uri: runner.photoUrl }} style={styles.runnerAvatar} />
                  ) : (
                    <ProfileAvatar name={runner.name} size={36} fontSize={15} />
                  )}
                  <View style={styles.runnerInfoCol}>
                    <Text style={styles.runnerName}>{runner.name}</Text>
                    <Text style={styles.runnerPosition}>{getPositionLabel(runner)}</Text>
                  </View>
                  {runner.prize ? <Text style={styles.runnerPrize}>₹{runner.prize}</Text> : null}
                </View>
              ))}
            </View>
          )}
        </>
      )}

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
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: spacing(6),
    paddingHorizontal: spacing(4),
    alignItems: 'center',
    marginVertical: spacing(2),
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: spacing(2),
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  rankTag: {
    position: 'absolute',
    top: 4,
    left: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  rankTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  playOverlayBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playOverlayIcon: {
    color: '#FFFFFF',
    fontSize: 9,
    marginLeft: 1,
  },
  podiumName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginTop: 6,
    textAlign: 'center',
  },
  podiumPosition: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  podiumPrize: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 3,
  },
  runnersUpContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    marginBottom: spacing(3),
  },
  runnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing(2),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  runnerRankNum: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    width: 20,
  },
  runnerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    marginRight: spacing(2.5),
  },
  runnerInfoCol: {
    flex: 1,
  },
  runnerName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.text,
  },
  runnerPosition: {
    fontSize: 10.5,
    color: colors.textMuted,
  },
  runnerPrize: {
    fontSize: 12.5,
    fontWeight: '800',
    color: colors.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  closeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  videoPlayer: {
    width: '100%',
    height: 320,
  },
});
