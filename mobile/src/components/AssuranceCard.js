import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Video } from 'expo-av';
import { colors, radius, spacing } from '../theme';

export default function AssuranceCard({ videoUrl, onOpenPolicy }) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

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
          <Text style={styles.heading}>How will you receive prize money?</Text>
          <Text style={styles.subheading}>Watch video to know more</Text>
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
          <Text style={styles.shieldIcon}>🛡️</Text>
          <Text style={styles.policyText}>Refund policy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.razorpayRow}
          onPress={() => onOpenPolicy?.('privacy')}
          activeOpacity={0.7}
        >
          <Text style={styles.shieldIcon}>🛡️</Text>
          <View style={styles.razorpayGroup}>
            <Text style={styles.secureText}>Secure payments powered by</Text>
            <Text style={styles.razorpayBrand}>
              <Text style={styles.razorpayItalic}>⚡ </Text>
              <Text style={styles.razorpayBold}>Razorpay</Text>
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Video Modal */}
      <Modal visible={isVideoOpen} animationType="slide" transparent={false} onRequestClose={() => setIsVideoOpen(false)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setIsVideoOpen(false)}>
            <Text style={styles.closeText}>✕ Close</Text>
          </TouchableOpacity>
          <View style={styles.videoWrapper}>
            <Video
              source={{
                uri:
                  videoUrl ||
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
  shieldIcon: {
    fontSize: 13,
    marginRight: spacing(1.5),
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
