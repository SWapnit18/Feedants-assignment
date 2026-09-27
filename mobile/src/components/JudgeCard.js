import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Video } from 'expo-av';
import { colors, radius, spacing } from '../theme';

import { t } from '../utils/i18n';

export default function JudgeCard({ judge, lang = 'ENG' }) {
  const [playing, setPlaying] = useState(false);
  if (!judge) return null;

  const roleLabel = t(lang, 'judgeLabel');
  const name = lang === 'हिंदी' ? t(lang, 'judgeName') : (judge.name || 'Manju Dubey');
  const exp1 = lang === 'हिंदी' ? t(lang, 'judgeRole') : (judge.experienceLabel?.split('·')[0] || 'Professional Kathak Dancer');
  const exp2 = lang === 'हिंदी' ? t(lang, 'judgeExp') : (judge.experienceLabel?.split('·')[1]?.trim() || '12+ Years of Experience');

  return (
    <View style={styles.card}>
      <Image
        source={{
          uri:
            judge.photoUrl ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        }}
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.roleLabel}>{roleLabel}</Text>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.experience}>{exp1}</Text>
        <Text style={styles.subExperience}>{exp2}</Text>
      </View>

      <TouchableOpacity
        style={styles.playButton}
        onPress={() => setPlaying(true)}
        activeOpacity={0.8}
      >
        <View style={styles.playCircle}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
        <Text style={styles.playLabel}>{t(lang, 'introVideo')}</Text>
      </TouchableOpacity>

      <Modal visible={playing} animationType="slide" transparent={false} onRequestClose={() => setPlaying(false)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setPlaying(false)}>
            <Text style={styles.closeText}>✕ Close</Text>
          </TouchableOpacity>
          <View style={styles.videoWrapper}>
            <Video
              source={{
                uri:
                  judge.introVideoUrl ||
                  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
              }}
              style={styles.video}
              useNativeControls
              resizeMode="contain"
              shouldPlay
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(3.5),
    marginHorizontal: spacing(4),
    marginTop: spacing(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: spacing(3),
    backgroundColor: colors.borderLight,
  },
  info: {
    flex: 1,
  },
  roleLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 1,
    letterSpacing: -0.2,
  },
  experience: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  subExperience: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  playButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: spacing(2),
  },
  playCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    color: colors.primary,
    fontSize: 14,
    marginLeft: 2,
  },
  playLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
    fontWeight: '600',
  },
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
  videoWrapper: {
    width: '100%',
    height: 320,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
