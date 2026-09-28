import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { ShieldOutlineIcon } from './MinimalIcons';
import { t } from '../utils/i18n';
import EnhancedVideoPlayer from './EnhancedVideoPlayer';

export default function AssuranceCard({ videoUrl, onOpenPolicy, lang = 'ENG' }) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const effectiveVideoUrl =
    videoUrl ||
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  return (
    <View style={styles.card}>
      {/* Left Column: Prize Money Explainer */}
      <TouchableOpacity
        style={styles.leftCol}
        onPress={() => setIsVideoOpen(true)}
        activeOpacity={0.8}
      >
        <View style={styles.playBox}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
        <View style={styles.leftTextGroup}>
          <Text style={styles.heading}>{t(lang, 'prizeMoneyQuery')}</Text>
          <Text style={styles.subheading}>{t(lang, 'watchVideoPrompt')}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* Right Column: Policies & Razorpay badge */}
      <View style={styles.rightCol}>
        <TouchableOpacity
          style={styles.policyRow}
          onPress={() => onOpenPolicy?.('refund')}
          activeOpacity={0.7}
        >
          <View style={{ marginRight: 6 }}>
            <ShieldOutlineIcon size={14} color="#0F766E" />
          </View>
          <Text style={styles.policyText}>{t(lang, 'refundPolicy')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.razorpayRow}
          onPress={() => onOpenPolicy?.('privacy')}
          activeOpacity={0.7}
        >
          <View style={{ marginRight: 6, marginTop: 2 }}>
            <ShieldOutlineIcon size={14} color="#0F766E" />
          </View>
          <View style={styles.razorpayGroup}>
            <Text style={styles.secureText}>{t(lang, 'secureRazorpay')}</Text>
            <Text style={styles.razorpayBrand}>
              <Text style={styles.razorpayItalic}>⚡ </Text>
              <Text style={styles.razorpayBold}>Razorpay</Text>
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* VLC Powered Video Modal for Prize Money Explainer */}
      <Modal
        visible={isVideoOpen}
        animationType="fade"
        transparent={false}
        onRequestClose={() => setIsVideoOpen(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContentBox}>
            <View style={styles.modalTopHeader}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.modalHeaderTitle} numberOfLines={1}>
                  💰 Prize Money Distribution Explainer
                </Text>
                <Text style={styles.modalHeaderSubtitle}>
                  Learn how prize money is distributed securely via Razorpay
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setIsVideoOpen(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCloseBtnText}>✕ Close</Text>
              </TouchableOpacity>
            </View>

            <EnhancedVideoPlayer
              videoUri={effectiveVideoUrl}
              title="Prize Money Explainer"
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
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(3.5),
    marginHorizontal: spacing(4),
    marginTop: spacing(3),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  leftCol: {
    flex: 1.1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing(2),
  },
  playBox: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing(2),
  },
  playIcon: {
    color: colors.primary,
    fontSize: 13,
    marginLeft: 1,
  },
  leftTextGroup: {
    flex: 1,
  },
  heading: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 15,
  },
  subheading: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: '#E2E8F0',
    marginHorizontal: spacing(1),
  },
  rightCol: {
    flex: 1,
    paddingLeft: spacing(2),
    justifyContent: 'center',
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing(1.5),
  },
  policyText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  razorpayRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  razorpayGroup: {
    flex: 1,
  },
  secureText: {
    fontSize: 9.5,
    color: colors.textMuted,
  },
  razorpayBrand: {
    fontSize: 12,
    color: '#0C2340',
    marginTop: 1,
  },
  razorpayItalic: {
    color: '#3395FF',
    fontSize: 10,
  },
  razorpayBold: {
    fontWeight: '900',
    color: '#0C2340',
    letterSpacing: -0.3,
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
