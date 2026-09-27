import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { colors, radius, spacing } from '../theme';

export default function SubmissionModal({ visible, onClose, onSubmit, isSubmitting }) {
  const [title, setTitle] = useState('');
  const [styleName, setStyleName] = useState('Kathak');
  const [selectedFile, setSelectedFile] = useState('classical_performance_final.mp4');

  const danceStyles = ['Kathak', 'Bharatanatyam', 'Odissi', 'Kuchipudi', 'Other'];

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Title Required', 'Please provide a title for your dance performance.');
      return;
    }

    onSubmit({
      title: title.trim(),
      danceStyle: styleName,
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      mediaType: 'video',
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Upload Submission</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Performance Title Input */}
          <Text style={styles.inputLabel}>Performance Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Kathak Tarana & Thumri Solo"
            placeholderTextColor={colors.textLight}
            value={title}
            onChangeText={setTitle}
          />

          {/* Dance Style Picker Pills */}
          <Text style={styles.inputLabel}>Dance Style</Text>
          <View style={styles.stylePillsRow}>
            {danceStyles.map((style) => {
              const isSelected = styleName === style;
              return (
                <TouchableOpacity
                  key={style}
                  style={[styles.stylePill, isSelected && styles.stylePillActive]}
                  onPress={() => setStyleName(style)}
                >
                  <Text style={[styles.stylePillText, isSelected && styles.stylePillTextActive]}>
                    {style}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Video Attachment Box */}
          <Text style={styles.inputLabel}>Recorded Video (Max 3 mins)</Text>
          <View style={styles.uploadBox}>
            <Text style={styles.uploadIcon}>🎬</Text>
            <View style={styles.uploadTextGroup}>
              <Text style={styles.fileName}>{selectedFile}</Text>
              <Text style={styles.fileSize}>1080p HD Video • 42.6 MB (Ready)</Text>
            </View>
            <TouchableOpacity
              style={styles.changeBtn}
              onPress={() => setSelectedFile('kathak_solo_take2.mp4')}
            >
              <Text style={styles.changeBtnText}>Change</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.noticeBox}>
            <Text style={styles.noticeIcon}>ℹ️</Text>
            <Text style={styles.noticeText}>
              Submissions can be updated anytime before the deadline on 30 Aug 26, 11:55 PM.
            </Text>
          </View>

          {/* Submit Action Button */}
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            disabled={isSubmitting}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Entry</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 27, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing(5),
    paddingTop: spacing(5),
    paddingBottom: spacing(8),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(4),
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  closeBtn: {
    padding: spacing(1),
  },
  closeBtnText: {
    fontSize: 18,
    color: colors.textMuted,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing(1.5),
    marginTop: spacing(2),
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radius.md,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2.5),
    fontSize: 13,
    color: colors.text,
  },
  stylePillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing(2),
  },
  stylePill: {
    backgroundColor: '#F1F5F9',
    borderRadius: radius.pill,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    marginRight: spacing(2),
    marginBottom: spacing(1.5),
  },
  stylePillActive: {
    backgroundColor: colors.primary,
  },
  stylePillText: {
    fontSize: 11.5,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  stylePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F7F4',
    borderWidth: 1,
    borderColor: '#C3E8E1',
    borderRadius: radius.md,
    padding: spacing(3),
  },
  uploadIcon: {
    fontSize: 22,
    marginRight: spacing(2.5),
  },
  uploadTextGroup: {
    flex: 1,
  },
  fileName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  fileSize: {
    fontSize: 10.5,
    color: colors.primary,
    marginTop: 2,
    fontWeight: '500',
  },
  changeBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.sm,
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1.5),
    borderWidth: 1,
    borderColor: '#D2EFE9',
  },
  changeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: radius.sm,
    padding: spacing(2.5),
    marginTop: spacing(3),
  },
  noticeIcon: {
    fontSize: 12,
    marginRight: spacing(1.5),
  },
  noticeText: {
    fontSize: 11,
    color: colors.textMuted,
    flex: 1,
    lineHeight: 15,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing(3.5),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing(5),
  },
  submitBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
