import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { colors, radius, spacing } from '../theme';
import { CloudUploadOutlineIcon, CertificateTrophyIcon } from './MinimalIcons';
import EnhancedVideoPlayer from './EnhancedVideoPlayer';

const GUIDELINES = {
  ENG: [
    'Video should be clear and well-lit',
    'Make sure audio is clearly audible',
    'No editing or filters allowed',
    'Video must be original and not previously published',
    'Follow the theme and rules of the competition',
  ],
  हिंदी: [
    'वीडियो स्पष्ट और अच्छी रोशनी में होना चाहिए',
    'सुनिश्चित करें कि ऑडियो स्पष्ट रूप से सुनाई दे',
    'कोई संपादन या फ़िल्टर की अनुमति नहीं है',
    'वीडियो मूल होना चाहिए और पहले कहीं प्रकाशित नहीं होना चाहिए',
    'प्रतियोगिता के विषय और नियमों का पालन करें',
  ],
};

const TEXTS = {
  ENG: {
    goBack: 'Go back',
    submission: 'Submission',
    stepUpload: 'Upload',
    stepPreview: 'Preview',
    stepSubmit: 'Submit',
    uploadHeading: 'Upload Your Performance Video',
    dragDrop: 'Drag & drop your video here or',
    chooseVideo: 'Choose Video',
    changeVideo: 'Change Video',
    fileSpecs: 'MP4, MOV up to 500MB • Min 1 min, Max 10 min',
    selected: 'Selected',
    guidelinesTitle: 'Video Guidelines',
    demoVideoTitle: 'Dance Performance Preview',
    fileInfoTitle: 'Performance Video (Ready for review)',
    additionalInfo: 'Additional Information',
    perfTitleLabel: 'Performance Title (Optional)',
    perfTitlePlaceholder: 'Enter your performance title',
    descLabel: 'Description (Optional)',
    descPlaceholder: 'Write a short description about your performance...',
    submitBtn: 'Submit Video',
    submittingBtn: 'Submitting Video...',
  },
  हिंदी: {
    goBack: 'वापस जाएं',
    submission: 'वीडियो प्रस्तुति',
    stepUpload: 'अपलोड',
    stepPreview: 'पूर्वावलोकन',
    stepSubmit: 'सबमिट करें',
    uploadHeading: 'अपना प्रदर्शन वीडियो अपलोड करें',
    dragDrop: 'यहाँ वीडियो खींचें या छोड़ें या',
    chooseVideo: 'वीडियो चुनें',
    changeVideo: 'वीडियो बदलें',
    fileSpecs: 'MP4, MOV अधिकतम 500MB • न्यूनतम 1 मिनट, अधिकतम 10 मिनट',
    selected: 'चयनित',
    guidelinesTitle: 'वीडियो दिशानिर्देश',
    demoVideoTitle: 'नृत्य प्रदर्शन पूर्वावलोकन',
    fileInfoTitle: 'प्रदर्शन वीडियो (मूल्यांकन हेतु तैयार)',
    additionalInfo: 'अतिरिक्त जानकारी',
    perfTitleLabel: 'प्रस्तुति शीर्षक (वैकल्पिक)',
    perfTitlePlaceholder: 'अपना प्रदर्शन शीर्षक दर्ज करें',
    descLabel: 'विवरण (वैकल्पिक)',
    descPlaceholder: 'अपने प्रदर्शन के बारे में संक्षिप्त विवरण लिखें...',
    submitBtn: 'वीडियो सबमिट करें',
    submittingBtn: 'वीडियो सबमिट हो रहा है...',
  },
};

export default function SubmissionModal({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
  lang = 'ENG',
  onLanguageChange,
}) {
  const [currentLang, setCurrentLang] = useState(lang || 'ENG');
  const [currentStep, setCurrentStep] = useState(1);
  const [performanceTitle, setPerformanceTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const scrollViewRef = useRef(null);

  // Sync external language prop
  useEffect(() => {
    if (lang) {
      setCurrentLang(lang);
    }
  }, [lang, visible]);

  const t = TEXTS[currentLang] || TEXTS.ENG;
  const guidelinesList = GUIDELINES[currentLang] || GUIDELINES.ENG;

  const handleToggleLang = (newLang) => {
    setCurrentLang(newLang);
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
  };

  const goToStep = (stepNumber) => {
    setCurrentStep(stepNumber);
    if (stepNumber === 1) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else if (stepNumber === 2) {
      scrollViewRef.current?.scrollTo({ y: 350, animated: true });
    } else if (stepNumber === 3) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

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
          goToStep(2);
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
    const sizeBytes = file.size || 0;
    const formattedSize = sizeBytes > 1024 * 1024
      ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
      : `${(sizeBytes / 1024).toFixed(1)} KB`;
    const cleanName = file.name || 'performance.mp4';

    setSelectedVideo({
      name: cleanName,
      size: formattedSize,
      sizeBytes: sizeBytes,
      duration: '00:00',
      url: objectUrl,
      file: file,
      isUserUploaded: true,
    });
    goToStep(2);

    if (typeof document !== 'undefined') {
      const probe = document.createElement('video');
      probe.preload = 'metadata';
      probe.src = objectUrl;
      probe.onloadedmetadata = () => {
        const sec = Math.round(probe.duration);
        if (sec && !isNaN(sec)) {
          const m = Math.floor(sec / 60);
          const s = sec % 60;
          const formatted = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
          setSelectedVideo((prev) => ({ ...prev, duration: formatted }));
        }
      };
    }

    if (!performanceTitle) {
      setPerformanceTitle(cleanName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
    }
  };

  const handleFinalSubmit = () => {
    if (!selectedVideo?.url && !selectedVideo?.file) {
      alert(currentLang === 'हिंदी' ? 'कृपया पहले एक वीडियो चुनें।' : 'Please choose a video to submit.');
      return;
    }

    const realFileName = selectedVideo.name || selectedVideo.file?.name || 'performance.mp4';
    const realFileSize = selectedVideo.size || (selectedVideo.file?.size ? (selectedVideo.file.size > 1024*1024 ? `${(selectedVideo.file.size / (1024*1024)).toFixed(1)} MB` : `${(selectedVideo.file.size/1024).toFixed(1)} KB`) : '15.0 MB');

    setCurrentStep(3);
    onSubmit({
      title: performanceTitle.trim() || realFileName.replace(/\.[^/.]+$/, ''),
      description: description.trim(),
      mediaUrl: selectedVideo.url,
      videoUrl: selectedVideo.url,
      videoFileName: realFileName,
      fileName: realFileName,
      fileSize: realFileSize,
      duration: selectedVideo.duration || '00:00',
      videoName: realFileName,
      file: selectedVideo.file,
      mediaType: 'video',
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header with Working Bilingual ENG / हिंदी Toggle */}
        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backText}>{t.goBack}</Text>
          </TouchableOpacity>

          <View style={styles.langPill}>
            <TouchableOpacity
              style={[styles.langOption, currentLang === 'ENG' && styles.langOptionActive]}
              onPress={() => handleToggleLang('ENG')}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.langText, currentLang === 'ENG' && styles.langTextActive]}
              >
                ENG
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.langOption, currentLang === 'हिंदी' && styles.langOptionActive]}
              onPress={() => handleToggleLang('हिंदी')}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.langText, currentLang === 'हिंदी' && styles.langTextActive]}
              >
                हिंदी
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Screen Title */}
          <Text style={styles.screenHeading}>{t.submission}</Text>

          {/* 3 Step Interactive Indicator */}
          <View style={styles.stepsRow}>
            {/* Step 1 */}
            <TouchableOpacity
              style={styles.stepItem}
              onPress={() => goToStep(1)}
              activeOpacity={0.8}
            >
              <View style={[styles.stepCircle, currentStep >= 1 && styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, currentStep >= 1 && styles.stepNumberActive]}>
                  1
                </Text>
              </View>
              <Text style={[styles.stepLabel, currentStep >= 1 && styles.stepLabelActive]}>
                {t.stepUpload}
              </Text>
            </TouchableOpacity>

            <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />

            {/* Step 2 */}
            <TouchableOpacity
              style={styles.stepItem}
              onPress={() => goToStep(2)}
              activeOpacity={0.8}
            >
              <View style={[styles.stepCircle, currentStep >= 2 && styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, currentStep >= 2 && styles.stepNumberActive]}>
                  2
                </Text>
              </View>
              <Text style={[styles.stepLabel, currentStep >= 2 && styles.stepLabelActive]}>
                {t.stepPreview}
              </Text>
            </TouchableOpacity>

            <View style={[styles.stepLine, currentStep >= 3 && styles.stepLineActive]} />

            {/* Step 3 */}
            <TouchableOpacity
              style={styles.stepItem}
              onPress={() => goToStep(3)}
              activeOpacity={0.8}
            >
              <View style={[styles.stepCircle, currentStep >= 3 && styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, currentStep >= 3 && styles.stepNumberActive]}>
                  3
                </Text>
              </View>
              <Text style={[styles.stepLabel, currentStep >= 3 && styles.stepLabelActive]}>
                {t.stepSubmit}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Upload Performance Video Area / Dropzone */}
          <TouchableOpacity
            style={[
              styles.dropzoneCard,
              selectedVideo?.isUserUploaded && styles.dropzoneCardSuccess,
              isDragging && styles.dropzoneCardDragging,
            ]}
            onPress={handleChooseVideo}
            activeOpacity={0.85}
            {...(Platform.OS === 'web'
              ? {
                  onDragOver: (e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  },
                  onDragLeave: (e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  },
                  onDrop: (e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file =
                      e.nativeEvent?.dataTransfer?.files?.[0] || e.dataTransfer?.files?.[0];
                    if (file) {
                      processSelectedFile(file);
                    }
                  },
                }
              : {})}
          >
            <View style={styles.cloudIconContainer}>
              <CloudUploadOutlineIcon size={28} color={colors.primary || '#004D40'} />
            </View>
            <Text style={styles.dropzoneTitle}>{t.uploadHeading}</Text>
            <Text style={styles.dropzoneSubtitle}>{t.dragDrop}</Text>

            <TouchableOpacity
              style={styles.chooseVideoBtn}
              onPress={handleChooseVideo}
              activeOpacity={0.8}
            >
              <Text style={styles.chooseVideoText}>
                {selectedVideo?.isUserUploaded ? t.changeVideo : t.chooseVideo}
              </Text>
            </TouchableOpacity>

            {selectedVideo?.isUserUploaded && (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>
                  ✓ {t.selected}: {selectedVideo.name} ({selectedVideo.size})
                </Text>
              </View>
            )}

            <Text style={styles.fileSpecsText}>{t.fileSpecs}</Text>
          </TouchableOpacity>

          {/* Video Guidelines Card */}
          <View style={styles.guidelinesCard}>
            <View style={styles.guidelinesHeader}>
              <View style={{ marginRight: 6 }}>
                <CertificateTrophyIcon size={16} color="#854D0E" />
              </View>
              <Text style={styles.guidelinesTitle}>{t.guidelinesTitle}</Text>
            </View>
            {guidelinesList.map((guide, gIdx) => (
              <View key={gIdx} style={styles.guidelineRow}>
                <Text style={styles.checkIcon}>✓</Text>
                <Text style={styles.guidelineText}>{guide}</Text>
              </View>
            ))}
          </View>

          {/* VLC Video Player Preview */}
          <EnhancedVideoPlayer
            videoUri={selectedVideo?.url}
            title={selectedVideo?.name || t.demoVideoTitle}
            initialOrientation="portrait"
            allowFullscreen={true}
            allowMinimize={true}
            allowOrientationToggle={true}
          />

          {/* Video Details Card */}
          <View style={styles.fileInfoCard}>
            <Text style={styles.fileInfoName} numberOfLines={1}>
              🎥 {selectedVideo?.name || t.fileInfoTitle}
            </Text>
            <Text style={styles.fileInfoMeta}>
              {currentLang === 'हिंदी' ? 'आकार' : 'Size'}: {selectedVideo?.size || '28.4 MB'} •{' '}
              {currentLang === 'हिंदी' ? 'अवधि' : 'Duration'}: {selectedVideo?.duration || '03:30'} • MP4
            </Text>
          </View>

          {/* Additional Information Inputs */}
          <Text style={styles.sectionHeader}>{t.additionalInfo}</Text>

          <Text style={styles.inputFieldLabel}>{t.perfTitleLabel}</Text>
          <TextInput
            style={styles.textInput}
            placeholder={t.perfTitlePlaceholder}
            placeholderTextColor="#94A3B8"
            value={performanceTitle}
            onChangeText={setPerformanceTitle}
          />

          <View style={styles.descHeaderRow}>
            <Text style={styles.inputFieldLabel}>{t.descLabel}</Text>
            <Text style={styles.charCounter}>{description.length}/500</Text>
          </View>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder={t.descPlaceholder}
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
              <Text style={styles.submitButtonText}>{t.submitBtn}</Text>
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
    backgroundColor: '#FFFFFF',
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
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  langOption: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1),
    borderRadius: radius.pill,
  },
  langOptionActive: {
    backgroundColor: colors.primary,
  },
  langText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  langTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing(4),
    backgroundColor: '#F8FAFC',
  },
  screenHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    marginBottom: spacing(3),
    letterSpacing: -0.4,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing(4),
    paddingHorizontal: spacing(2),
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
    backgroundColor: colors.primary,
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
    color: '#94A3B8',
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
    marginBottom: 16,
  },
  stepLineActive: {
    backgroundColor: colors.primary,
  },
  dropzoneCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing(5),
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#BAE6FD',
    marginBottom: spacing(3),
  },
  dropzoneCardSuccess: {
    borderColor: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  dropzoneCardDragging: {
    borderColor: colors.primary,
    backgroundColor: '#E0F2FE',
  },
  cloudIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing(2),
  },
  dropzoneTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  dropzoneSubtitle: {
    fontSize: 11.5,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing(3),
  },
  chooseVideoBtn: {
    backgroundColor: colors.primary || '#004D40',
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: radius.md,
    marginBottom: spacing(2),
  },
  chooseVideoText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12.5,
  },
  selectedBadge: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1),
    borderRadius: radius.pill,
    marginBottom: spacing(2),
    borderWidth: 1,
    borderColor: '#5EEAD4',
  },
  selectedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F766E',
  },
  fileSpecsText: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
  },
  guidelinesCard: {
    backgroundColor: '#FEFCE8',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#FEF08A',
    padding: spacing(3.5),
    marginBottom: spacing(3),
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
    marginBottom: 4,
  },
  checkIcon: {
    color: '#16A34A',
    fontWeight: '800',
    fontSize: 11,
    marginRight: 6,
    marginTop: 1,
  },
  guidelineText: {
    fontSize: 11,
    color: '#713F12',
    flex: 1,
    lineHeight: 16,
  },
  fileInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing(3),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing(3),
  },
  fileInfoName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.text,
  },
  fileInfoMeta: {
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing(2),
    marginTop: spacing(1),
  },
  inputFieldLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  descHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  charCounter: {
    fontSize: 10,
    color: colors.textMuted,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: radius.md,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2.5),
    fontSize: 13,
    color: colors.text,
    marginBottom: spacing(3),
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#075A4E',
    borderRadius: radius.md,
    paddingVertical: spacing(3.5),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#075A4E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
    marginTop: spacing(2),
  },
  submitButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
