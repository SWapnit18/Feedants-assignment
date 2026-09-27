import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Video } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { colors, radius, spacing } from '../theme';
import { CloudUploadOutlineIcon, CertificateTrophyIcon } from './MinimalIcons';

const VIDEO_GUIDELINES = [
  'Video should be clear and well-lit',
  'Make sure audio is clearly audible',
  'No editing or filters allowed',
  'Video must be original and not previously published',
  'Follow the theme and rules of the competition',
];

export default function SubmissionModal({ visible, onClose, onSubmit, isSubmitting }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [performanceTitle, setPerformanceTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedVideo, setSelectedVideo] = useState({
    name: 'classical_dance_solo_2026.mp4',
    size: '48.2 MB',
    duration: '04:32',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
    isUserUploaded: false,
  });
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  // File selection handler supporting Web file input, drag & drop, and Expo DocumentPicker
  const handleChooseVideo = async () => {
    try {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*,video/mp4,video/quicktime,video/webm,video/x-msvideo';
        input.onchange = (e) => {
          const file = e.target.files?.[0];
          if (file) {
            processSelectedFile(file);
          }
        };
        input.click();
      } else {
        const result = await DocumentPicker.getDocumentAsync({
          type: 'video/*',
          copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          const sizeMb = asset.size ? (asset.size / (1024 * 1024)).toFixed(1) : '35.0';
          const cleanName = asset.name || 'performance_video.mp4';

          setSelectedVideo({
            name: cleanName,
            size: `${sizeMb} MB`,
            duration: '03:45',
            url: asset.uri,
            file: asset,
            isUserUploaded: true,
          });
          setIsPlayingPreview(true);
          setCurrentStep(2);
          if (!performanceTitle) {
            setPerformanceTitle(cleanName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
          }
        }
      }
    } catch (err) {
      console.warn('Video selection cancelled or failed:', err);
    }
  };

  const processSelectedFile = (file) => {
    const objectUrl = URL.createObjectURL(file);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const cleanName = file.name;

    setSelectedVideo({
      name: cleanName,
      size: `${sizeMb} MB`,
      duration: '03:30',
      url: objectUrl,
      file: file,
      isUserUploaded: true,
    });
    setIsPlayingPreview(true);
    setCurrentStep(2);

    if (!performanceTitle) {
      setPerformanceTitle(cleanName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
    }
  };

  const handleFinalSubmit = () => {
    setCurrentStep(3);
    onSubmit({
      title: performanceTitle.trim() || 'Classical Dance Performance',
      description: description.trim(),
      mediaUrl: selectedVideo.url,
      mediaType: 'video',
      duration: selectedVideo.duration,
      videoName: selectedVideo.name,
      file: selectedVideo.file,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backText}>Go back</Text>
          </TouchableOpacity>

          <View style={styles.langPill}>
            <View style={styles.langActive}>
              <Text style={styles.langActiveText}>ENG</Text>
            </View>
            <View style={styles.langInactive}>
              <Text style={styles.langInactiveText}>हिंदी</Text>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Screen Title */}
          <Text style={styles.screenHeading}>Submission</Text>

          {/* 3 Step Interactive Indicator */}
          <View style={styles.stepsRow}>
            {/* Step 1 */}
            <TouchableOpacity
              style={styles.stepItem}
              onPress={() => setCurrentStep(1)}
              activeOpacity={0.8}
            >
              <View style={[styles.stepCircle, currentStep >= 1 && styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, currentStep >= 1 && styles.stepNumberActive]}>
                  1
                </Text>
              </View>
              <Text style={[styles.stepLabel, currentStep >= 1 && styles.stepLabelActive]}>
                Upload
              </Text>
            </TouchableOpacity>

            <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />

            {/* Step 2 */}
            <TouchableOpacity
              style={styles.stepItem}
              onPress={() => setCurrentStep(2)}
              activeOpacity={0.8}
            >
              <View style={[styles.stepCircle, currentStep >= 2 && styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, currentStep >= 2 && styles.stepNumberActive]}>
                  2
                </Text>
              </View>
              <Text style={[styles.stepLabel, currentStep >= 2 && styles.stepLabelActive]}>
                Preview
              </Text>
            </TouchableOpacity>

            <View style={[styles.stepLine, currentStep >= 3 && styles.stepLineActive]} />

            {/* Step 3 */}
            <TouchableOpacity
              style={styles.stepItem}
              onPress={() => setCurrentStep(3)}
              activeOpacity={0.8}
            >
              <View style={[styles.stepCircle, currentStep >= 3 && styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, currentStep >= 3 && styles.stepNumberActive]}>
                  3
                </Text>
              </View>
              <Text style={[styles.stepLabel, currentStep >= 3 && styles.stepLabelActive]}>
                Submit
              </Text>
            </TouchableOpacity>
          </View>

          {/* Upload Performance Video Area / Dropzone */}
          <TouchableOpacity
            style={[styles.dropzoneCard, selectedVideo.isUserUploaded && styles.dropzoneCardSuccess]}
            onPress={handleChooseVideo}
            activeOpacity={0.85}
          >
            <View style={styles.cloudIconContainer}>
              <CloudUploadOutlineIcon size={28} color="#0284C7" />
            </View>
            <Text style={styles.dropzoneTitle}>Upload Your Performance Video</Text>
            <Text style={styles.dropzoneSubtitle}>Drag & drop your video here or</Text>

            <TouchableOpacity
              style={styles.chooseVideoBtn}
              onPress={handleChooseVideo}
              activeOpacity={0.8}
            >
              <Text style={styles.chooseVideoText}>
                {selectedVideo.isUserUploaded ? 'Change Video' : 'Choose Video'}
              </Text>
            </TouchableOpacity>

            {selectedVideo.isUserUploaded && (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>
                  ✓ Selected: {selectedVideo.name} ({selectedVideo.size})
                </Text>
              </View>
            )}

            <Text style={styles.fileSpecsText}>
              MP4, MOV up to 500MB • Min 1 min, Max 10 min
            </Text>
          </TouchableOpacity>

          {/* Video Guidelines Card */}
          <View style={styles.guidelinesCard}>
            <View style={styles.guidelinesHeader}>
              <View style={{ marginRight: 6 }}>
                <CertificateTrophyIcon size={16} color="#854D0E" />
              </View>
              <Text style={styles.guidelinesTitle}>Video Guidelines</Text>
            </View>
            {VIDEO_GUIDELINES.map((guide, gIdx) => (
              <View key={gIdx} style={styles.guidelineRow}>
                <Text style={styles.checkIcon}>✓</Text>
                <Text style={styles.guidelineText}>{guide}</Text>
              </View>
            ))}
          </View>

          {/* Video Preview Player */}
          <View style={styles.previewHeaderRow}>
            <Text style={styles.sectionHeader}>Video Preview</Text>
            {selectedVideo.isUserUploaded && (
              <View style={styles.liveTag}>
                <Text style={styles.liveTagText}>● Ready to Play</Text>
              </View>
            )}
          </View>

          <View style={styles.previewPlayerContainer}>
            {isPlayingPreview || selectedVideo.isUserUploaded ? (
              <Video
                source={{ uri: selectedVideo.url }}
                style={styles.previewVideo}
                useNativeControls
                resizeMode="contain"
                shouldPlay={false}
              />
            ) : (
              <TouchableOpacity
                style={styles.thumbnailWrapper}
                onPress={() => setIsPlayingPreview(true)}
                activeOpacity={0.9}
              >
                <Image source={{ uri: selectedVideo.thumbnail }} style={styles.previewImage} />
                <View style={styles.previewPlayCircle}>
                  <Text style={styles.previewPlayIcon}>▶</Text>
                </View>
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{selectedVideo.duration}</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Video Details Card */}
          <View style={styles.fileInfoCard}>
            <Text style={styles.fileInfoName} numberOfLines={1}>
              🎥 {selectedVideo.name}
            </Text>
            <Text style={styles.fileInfoMeta}>
              File Size: {selectedVideo.size} • Format: Video
            </Text>
          </View>

          {/* Additional Information Inputs */}
          <Text style={styles.sectionHeader}>Additional Information</Text>

          <Text style={styles.inputFieldLabel}>Performance Title (Optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your performance title"
            placeholderTextColor="#94A3B8"
            value={performanceTitle}
            onChangeText={setPerformanceTitle}
          />

          <View style={styles.descHeaderRow}>
            <Text style={styles.inputFieldLabel}>Description (Optional)</Text>
            <Text style={styles.charCounter}>{description.length}/500</Text>
          </View>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Write a short description about your performance..."
            placeholderTextColor="#94A3B8"
            multiline
            maxLength={500}
            value={description}
            onChangeText={setDescription}
          />

          {/* Submit Video CTA Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            disabled={isSubmitting}
            onPress={handleFinalSubmit}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Video</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginRight: 6,
  },
  backText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  langPill: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: radius.pill,
    padding: 2,
  },
  langActive: {
    backgroundColor: '#0F766E',
    borderRadius: radius.pill,
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1),
  },
  langActiveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  langInactive: {
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1),
  },
  langInactiveText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing(4),
    paddingTop: spacing(3),
  },
  screenHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing(4),
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing(5),
    paddingHorizontal: spacing(6),
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: '#0F766E',
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  stepLabelActive: {
    color: '#0F766E',
    fontWeight: '700',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: spacing(2),
    marginBottom: 16,
  },
  stepLineActive: {
    backgroundColor: '#0F766E',
  },
  dropzoneCard: {
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    borderStyle: 'dashed',
    backgroundColor: '#F0F9FF',
    borderRadius: radius.lg,
    paddingVertical: spacing(5),
    paddingHorizontal: spacing(4),
    alignItems: 'center',
    marginBottom: spacing(4),
  },
  dropzoneCardSuccess: {
    borderColor: '#0F766E',
    backgroundColor: '#E6F7F4',
  },
  cloudIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing(2.5),
  },
  dropzoneTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  dropzoneSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing(3),
  },
  chooseVideoBtn: {
    borderWidth: 1,
    borderColor: '#0284C7',
    borderRadius: radius.md,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(2),
    marginBottom: spacing(2),
  },
  chooseVideoText: {
    color: '#0284C7',
    fontWeight: '700',
    fontSize: 12.5,
  },
  selectedBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    borderRadius: radius.pill,
    marginBottom: spacing(2),
  },
  selectedBadgeText: {
    color: '#047857',
    fontSize: 11.5,
    fontWeight: '700',
  },
  fileSpecsText: {
    fontSize: 10.5,
    color: '#64748B',
  },
  guidelinesCard: {
    backgroundColor: '#FEF9C3',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#FEF08A',
    padding: spacing(3.5),
    marginBottom: spacing(4),
  },
  guidelinesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing(2),
  },
  guidelinesTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#854D0E',
  },
  guidelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  checkIcon: {
    color: '#CA8A04',
    fontSize: 12,
    marginRight: spacing(2),
    fontWeight: '800',
  },
  guidelineText: {
    fontSize: 11.5,
    color: '#713F12',
    flex: 1,
    lineHeight: 16,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing(1),
    marginBottom: spacing(2),
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  liveTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: spacing(2),
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  liveTagText: {
    color: '#059669',
    fontSize: 10.5,
    fontWeight: '700',
  },
  previewPlayerContainer: {
    height: 190,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    marginBottom: spacing(2.5),
  },
  previewVideo: {
    width: '100%',
    height: '100%',
  },
  thumbnailWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewPlayCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  previewPlayIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 2,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  fileInfoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.sm,
    padding: spacing(2.5),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing(4),
  },
  fileInfoName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  fileInfoMeta: {
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  inputFieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  descHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing(2),
  },
  charCounter: {
    fontSize: 10.5,
    color: colors.textMuted,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radius.md,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2.5),
    fontSize: 13,
    color: colors.text,
    marginBottom: spacing(2),
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#0F766E',
    borderRadius: radius.md,
    paddingVertical: spacing(3.5),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing(3),
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
