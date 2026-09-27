import React from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors, fonts, spacing } from '../theme';
import { resolveMediaUrl } from '../api/client';
import { isVideoUrl } from '../utils/format';
import { useI18n } from '../i18n';

export interface MediaItem {
  url: string;
  title?: string;
  subtitle?: string;
  mimeType?: string | null;
}

function Player({ uri }: { uri: string }) {
  const { errorMessage } = useI18n();
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
    p.play();
  });
  const { status } = useEvent(player, 'statusChange', { status: player.status });
  return (
    <View style={styles.stage}>
      <VideoView player={player} style={styles.video} contentFit="contain" nativeControls fullscreenOptions={{ enable: true }} />
      {status === 'loading' ? <ActivityIndicator style={styles.center} color={colors.white} size="large" /> : null}
      {status === 'error' ? (
        <AppText style={styles.center} color={colors.white}>
          {errorMessage(null)}
        </AppText>
      ) : null}
    </View>
  );
}

/** Full-screen media viewer: plays videos with expo-video, shows images with expo-image. */
export function VideoModal({ media, onClose }: { media: MediaItem | null; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const uri = resolveMediaUrl(media?.url);
  return (
    <Modal visible={!!media} animationType="fade" onRequestClose={onClose} supportedOrientations={['portrait', 'landscape']}>
      <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.top}>
          <View style={{ flex: 1 }}>
            {media?.title ? (
              <AppText style={styles.title} numberOfLines={1}>
                {media.title}
              </AppText>
            ) : null}
            {media?.subtitle ? (
              <AppText variant="caption" color="rgba(255,255,255,0.7)">
                {media.subtitle}
              </AppText>
            ) : null}
          </View>
          <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
            <Ionicons name="close" size={28} color={colors.white} />
          </Pressable>
        </View>
        {uri ? (
          isVideoUrl(uri, media?.mimeType) ? (
            <Player uri={uri} />
          ) : (
            <View style={styles.stage}>
              <Image source={{ uri }} style={styles.video} contentFit="contain" />
            </View>
          )
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.md },
  title: { fontFamily: fonts.semibold, fontSize: 16, color: colors.white },
  stage: { flex: 1, justifyContent: 'center' },
  video: { width: '100%', height: '100%' },
  center: { position: 'absolute', alignSelf: 'center' },
});
