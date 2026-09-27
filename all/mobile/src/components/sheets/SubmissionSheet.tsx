import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '../BottomSheet';
import { AppText } from '../AppText';
import { Button } from '../Button';
import { ProgressBar } from '../ProgressBar';
import { colors, fonts, radius, spacing } from '../../theme';
import { useI18n } from '../../i18n';

export interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
  isVideo: boolean;
}

export type SubmissionStage = 'idle' | 'uploading' | 'submitting';

export interface SubmissionSheetProps {
  visible: boolean;
  file: PickedFile | null;
  caption: string;
  onCaptionChange: (v: string) => void;
  stage: SubmissionStage;
  progress: number;
  error: string | null;
  onPick: () => void;
  onSubmit: () => void;
  onClose: () => void;
}

const formatSize = (bytes?: number) => (bytes ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : '');

export function SubmissionSheet({
  visible,
  file,
  caption,
  onCaptionChange,
  stage,
  progress,
  error,
  onPick,
  onSubmit,
  onClose,
}: SubmissionSheetProps) {
  const { t } = useI18n();
  const busy = stage !== 'idle';

  return (
    <BottomSheet visible={visible} onClose={onClose} dismissable={!busy} title={t('uploadTitle')} subtitle={t('uploadHint')}>
      <Pressable
        onPress={onPick}
        disabled={busy}
        style={({ pressed }) => [styles.picker, pressed && { opacity: 0.8 }]}
        accessibilityRole="button"
        accessibilityLabel={file ? t('changeFile') : t('chooseFile')}
      >
        {file ? (
          <View style={styles.fileRow}>
            {file.isVideo ? (
              <View style={styles.thumbFallback}>
                <Ionicons name="videocam" size={26} color={colors.primary} />
              </View>
            ) : (
              <Image source={{ uri: file.uri }} style={styles.thumb} contentFit="cover" />
            )}
            <View style={{ flex: 1 }}>
              <AppText variant="bodyMedium" numberOfLines={1}>
                {file.name}
              </AppText>
              <AppText variant="caption">{formatSize(file.size)}</AppText>
            </View>
            {!busy ? <AppText style={styles.change}>{t('changeFile')}</AppText> : null}
          </View>
        ) : (
          <View style={styles.empty}>
            <Ionicons name="cloud-upload-outline" size={34} color={colors.primary} />
            <AppText style={styles.change}>{t('chooseFile')}</AppText>
          </View>
        )}
      </Pressable>

      <TextInput
        value={caption}
        onChangeText={onCaptionChange}
        placeholder={t('captionPlaceholder')}
        placeholderTextColor={colors.textFaint}
        editable={!busy}
        maxLength={280}
        style={styles.input}
      />

      {stage === 'uploading' ? (
        <View style={styles.progress}>
          <ProgressBar value={progress} height={6} />
          <AppText variant="caption">{t('uploading', { pct: Math.round(progress * 100) })}</AppText>
        </View>
      ) : null}

      {error ? (
        <View style={styles.error} accessibilityRole="alert">
          <Ionicons name="alert-circle" size={18} color={colors.danger} />
          <AppText variant="label" color={colors.danger} style={{ flex: 1 }}>
            {error}
          </AppText>
        </View>
      ) : null}

      <Button
        label={stage === 'uploading' ? t('uploading', { pct: Math.round(progress * 100) }) : stage === 'submitting' ? t('submitting') : t('submit')}
        size="lg"
        onPress={onSubmit}
        disabled={!file || busy}
        style={styles.submit}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  picker: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primaryTintStrong,
    backgroundColor: colors.primaryTint,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  thumb: { width: 52, height: 52, borderRadius: radius.md },
  thumbFallback: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  change: { fontFamily: fonts.semibold, fontSize: 13, color: colors.primaryText },
  input: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
  },
  progress: { marginTop: spacing.md, gap: 6 },
  error: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.dangerTint,
  },
  submit: { marginTop: spacing.lg },
});
