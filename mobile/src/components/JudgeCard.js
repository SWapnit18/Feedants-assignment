import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { t } from '../utils/i18n';
import ProfileAvatar from './ProfileAvatar';
import EnhancedVideoPlayer from './EnhancedVideoPlayer';

export default function JudgeCard({ judge, lang = 'ENG' }) {
  const [playing, setPlaying] = useState(false);

  if (!judge) return null;

  const roleLabel = t(lang, 'judgeLabel');
  const name = lang === 'हिंदी' ? t(lang, 'judgeName') : judge.name;
  const exp1 = lang === 'हिंदी' ? t(lang, 'judgeRole') : (judge.experienceLabel?.split('·')[0] || judge.profession || '');
  const exp2 = lang === 'हिंदी' ? t(lang, 'judgeExp') : (judge.experienceLabel?.split('·')[1]?.trim() || judge.experience || '');

  const videoUri = judge.introVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

  return (
    <View style={styles.card}>
      <ProfileAvatar name={judge.name} size={60} fontSize={24} style={styles.avatar} />
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

      {/* VLC Powered Video Modal */}
      <Modal visible={playing} animationType="fade" transparent={false} onRequestClose={() => setPlaying(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContentBox}>
            <View style={styles.modalTopHeader}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.modalHeaderTitle} numberOfLines={1}>
                  {judge.name} – {t(lang, 'introVideo')}
                </Text>
                <Text style={styles.modalHeaderSubtitle}>
                  {judge.profession || judge.experienceLabel || 'Judge Introduction'}
                </Text>
              </View>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setPlaying(false)} activeOpacity={0.8}>
                <Text style={styles.modalCloseBtnText}>✕ Close</Text>
              </TouchableOpacity>
            </View>

            <EnhancedVideoPlayer
              videoUri={videoUri}
              title={`${judge.name} – Intro Video`}
              initialOrientation="landscape"
              allowFullscreen={true}
              allowMinimize={false}
              allowOrientationToggle={true}
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
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing(4),
    ...(Platform.OS === 'web'
      ? {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 999999,
        }
      : {}),
  },
  modalContentBox: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#0A0F1D',
    borderRadius: radius.lg,
    padding: spacing(4),
    borderWidth: 1.5,
    borderColor: '#FF5500',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  modalTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingBottom: spacing(2.5),
  },
  modalHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  modalHeaderSubtitle: {
    color: '#FED7AA',
    fontSize: 11,
    marginTop: 2,
  },
  modalCloseBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
