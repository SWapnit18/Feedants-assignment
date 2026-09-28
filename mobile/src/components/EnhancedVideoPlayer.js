import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  StatusBar,
} from 'react-native';
import { Video } from 'expo-av';
import { colors, radius, spacing } from '../theme';

const DEFAULT_SAMPLE_VIDEO =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

const SPEED_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

export default function EnhancedVideoPlayer({
  videoUri,
  title = 'Performance Video Preview',
  initialOrientation = 'portrait', // 'portrait' | 'landscape'
  allowFullscreen = true,
  allowMinimize = false,
  allowOrientationToggle = true,
  style,
}) {
  const [orientation, setOrientation] = useState(initialOrientation);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState(null);
  const [resizeMode, setResizeMode] = useState('contain'); // 'contain' | 'cover'

  const videoRef = useRef(null);
  const fullscreenVideoRef = useRef(null);

  const effectiveUri = videoUri || DEFAULT_SAMPLE_VIDEO;

  const getActiveRef = useCallback(() => {
    return isFullscreen ? fullscreenVideoRef.current : videoRef.current;
  }, [isFullscreen]);

  const formatTime = (millis) => {
    if (!millis || isNaN(millis)) return '00:00';
    const totalSec = Math.floor(millis / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const currentTimeStr = formatTime(status?.positionMillis || 0);
  const durationStr = formatTime(status?.durationMillis || 0);

  const handlePlaybackStatusUpdate = (playbackStatus) => {
    if (!playbackStatus.isLoaded) return;
    setStatus(playbackStatus);
    setIsPlaying(playbackStatus.isPlaying);
  };

  const togglePlay = async () => {
    const ref = getActiveRef();
    if (!ref) return;
    if (isPlaying) {
      await ref.pauseAsync();
    } else {
      await ref.playAsync();
    }
  };

  const handleSeekDelta = async (deltaSec) => {
    const ref = getActiveRef();
    if (!ref || !status?.positionMillis) return;
    const newPos = Math.max(0, Math.min(status.durationMillis || 0, status.positionMillis + deltaSec * 1000));
    await ref.setPositionAsync(newPos);
  };

  const handleSetSpeed = async (speed) => {
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
    const ref = getActiveRef();
    if (ref) {
      await ref.setRateAsync(speed, true);
    }
  };

  const toggleMute = async () => {
    const ref = getActiveRef();
    if (!ref) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    await ref.setIsMutedAsync(nextMuted);
  };

  const toggleOrientation = () => {
    setOrientation((prev) => (prev === 'portrait' ? 'landscape' : 'portrait'));
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const toggleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  return (
    <View style={[styles.card, style]}>
      {/* 1. Sleek Minimalist Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.playIconBadge}>
            <Text style={styles.playIconText}>🎬</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.headerSubtitle}>
              {orientation === 'portrait' ? '9:16 Reel' : '16:9 HD'} • {playbackSpeed}x
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {/* Quick Speed Pill */}
          <TouchableOpacity
            style={[styles.pillBtn, showSpeedMenu && styles.pillBtnActive]}
            onPress={() => setShowSpeedMenu((v) => !v)}
            activeOpacity={0.7}
          >
            <Text style={[styles.pillBtnText, showSpeedMenu && styles.pillBtnTextActive]}>
              ⚡ {playbackSpeed}x
            </Text>
          </TouchableOpacity>

          {/* Orientation Toggle */}
          {allowOrientationToggle && !isMinimized && (
            <TouchableOpacity
              style={styles.pillBtn}
              onPress={toggleOrientation}
              activeOpacity={0.7}
            >
              <Text style={styles.pillBtnText}>
                {orientation === 'portrait' ? '📱 9:16' : '🖥️ 16:9'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Minimize Button */}
          {allowMinimize && (
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={toggleMinimize}
              activeOpacity={0.7}
            >
              <Text style={styles.iconBtnText}>{isMinimized ? '🗖' : '🗕'}</Text>
            </TouchableOpacity>
          )}

          {/* Fullscreen Button */}
          {allowFullscreen && (
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={toggleFullscreen}
              activeOpacity={0.7}
            >
              <Text style={styles.iconBtnText}>⛶</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Speed Dropdown Menu */}
      {showSpeedMenu && (
        <View style={styles.speedMenu}>
          <Text style={styles.speedMenuTitle}>Playback Speed</Text>
          <View style={styles.speedOptionsRow}>
            {SPEED_PRESETS.map((rate) => (
              <TouchableOpacity
                key={rate}
                style={[styles.speedOption, playbackSpeed === rate && styles.speedOptionActive]}
                onPress={() => handleSetSpeed(rate)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.speedOptionText,
                    playbackSpeed === rate && styles.speedOptionTextActive,
                  ]}
                >
                  {rate}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* 2. Video Player Surface */}
      <View
        style={[
          styles.videoContainer,
          orientation === 'portrait' && !isMinimized && styles.videoContainerPortrait,
          orientation === 'landscape' && !isMinimized && styles.videoContainerLandscape,
          isMinimized && styles.videoContainerMinimized,
        ]}
      >
        <Video
          ref={videoRef}
          source={{ uri: effectiveUri }}
          style={styles.videoSurface}
          resizeMode={resizeMode}
          shouldPlay={false}
          isMuted={isMuted}
          useNativeControls={true}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        />
      </View>

      {/* 3. Clean Quick Controls Strip (Under Video) */}
      {!isMinimized && (
        <View style={styles.controlsStrip}>
          <TouchableOpacity
            style={styles.controlPlayBtn}
            onPress={togglePlay}
            activeOpacity={0.8}
          >
            <Text style={styles.controlPlayIcon}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlSmallBtn}
            onPress={() => handleSeekDelta(-10)}
            activeOpacity={0.7}
          >
            <Text style={styles.controlSmallText}>-10s</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlSmallBtn}
            onPress={() => handleSeekDelta(10)}
            activeOpacity={0.7}
          >
            <Text style={styles.controlSmallText}>+10s</Text>
          </TouchableOpacity>

          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>
              {currentTimeStr} <Text style={styles.timeMuted}>/ {durationStr}</Text>
            </Text>
          </View>

          <TouchableOpacity
            style={styles.muteBtn}
            onPress={toggleMute}
            activeOpacity={0.7}
          >
            <Text style={styles.muteBtnText}>{isMuted ? '🔇' : '🔊'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 4. Fullscreen Modal */}
      {isFullscreen && (
        <Modal
          visible={isFullscreen}
          transparent={false}
          animationType="fade"
          onRequestClose={toggleFullscreen}
        >
          <View style={styles.fullscreenContainer}>
            <StatusBar hidden />
            {/* Top Bar */}
            <View style={styles.fullscreenHeader}>
              <Text style={styles.fullscreenTitle} numberOfLines={1}>
                {title}
              </Text>
              <TouchableOpacity
                style={styles.fullscreenCloseBtn}
                onPress={toggleFullscreen}
                activeOpacity={0.8}
              >
                <Text style={styles.fullscreenCloseText}>✕ Exit Fullscreen</Text>
              </TouchableOpacity>
            </View>

            {/* Video View */}
            <View style={styles.fullscreenVideoWrapper}>
              <Video
                ref={fullscreenVideoRef}
                source={{ uri: effectiveUri }}
                style={styles.fullscreenVideo}
                resizeMode="contain"
                shouldPlay={true}
                isMuted={isMuted}
                useNativeControls={true}
                onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl || 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginVertical: spacing(3),
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(3.5),
    paddingVertical: spacing(2.5),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FAFCFD',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing(2),
  },
  playIconBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.md || 8,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing(2),
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  playIconText: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.text || '#0F172A',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.textMuted || '#64748B',
    marginTop: 1,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pillBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1),
    borderRadius: radius.pill || 999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillBtnActive: {
    backgroundColor: colors.primary || '#004D40',
    borderColor: colors.primary || '#004D40',
  },
  pillBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary || '#334155',
  },
  pillBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.pill || 999,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconBtnText: {
    fontSize: 12,
    color: colors.text || '#0F172A',
    fontWeight: '700',
  },
  speedMenu: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing(3.5),
    paddingVertical: spacing(2.5),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  speedMenuTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted || '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing(1.5),
  },
  speedOptionsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  speedOption: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1),
    borderRadius: radius.pill || 999,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  speedOptionActive: {
    backgroundColor: colors.primary || '#004D40',
    borderColor: colors.primary || '#004D40',
  },
  speedOptionText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textSecondary || '#334155',
  },
  speedOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  videoContainer: {
    backgroundColor: '#0B0F19',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  videoContainerPortrait: {
    height: 380,
  },
  videoContainerLandscape: {
    height: 220,
  },
  videoContainerMinimized: {
    height: 60,
  },
  videoSurface: {
    width: '100%',
    height: '100%',
  },
  controlsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    backgroundColor: '#FAFCFD',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  controlPlayBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.pill || 999,
    backgroundColor: colors.primary || '#004D40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlPlayIcon: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 1,
  },
  controlSmallBtn: {
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    borderRadius: radius.md || 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  controlSmallText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary || '#334155',
  },
  timeContainer: {
    flex: 1,
    marginLeft: spacing(1),
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text || '#0F172A',
  },
  timeMuted: {
    fontSize: 11.5,
    fontWeight: '500',
    color: colors.textMuted || '#64748B',
  },
  muteBtn: {
    width: 30,
    height: 30,
    borderRadius: radius.pill || 999,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  muteBtnText: {
    fontSize: 13,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullscreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 10,
  },
  fullscreenTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  fullscreenCloseBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    borderRadius: radius.pill || 999,
  },
  fullscreenCloseText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  fullscreenVideoWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenVideo: {
    width: '100%',
    height: '100%',
  },
});
