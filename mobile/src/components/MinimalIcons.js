import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Minimalist, elegant line icons matching the Feedants design reference.
 */

// 1. Calendar Outline Icon (Register Before)
export function CalendarOutlineIcon({ size = 24, color = '#0F766E' }) {
  return (
    <View style={[styles.iconBox, { width: size, height: size }]}>
      <View style={[styles.calendarBody, { borderColor: color }]}>
        {/* Binder rings */}
        <View style={styles.calendarRingsRow}>
          <View style={[styles.calendarRing, { backgroundColor: color }]} />
          <View style={[styles.calendarRing, { backgroundColor: color }]} />
        </View>
        {/* Horizontal dividing line */}
        <View style={[styles.calendarDivider, { backgroundColor: color }]} />
        {/* Grid dots */}
        <View style={styles.calendarGrid}>
          <View style={[styles.calendarDot, { backgroundColor: color }]} />
          <View style={[styles.calendarDot, { backgroundColor: color }]} />
          <View style={[styles.calendarDot, { backgroundColor: color }]} />
          <View style={[styles.calendarDot, { backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
}

// 2. Paper Plane / Rocket Outline Icon (Submission Starts)
export function PaperPlaneOutlineIcon({ size = 24, color = '#0F766E' }) {
  return (
    <View style={[styles.iconBox, { width: size, height: size }]}>
      <Text style={{ fontSize: size * 0.85, color, lineHeight: size, textAlign: 'center' }}>
        🚀
      </Text>
    </View>
  );
}

// 3. Tray Upload Outline Icon (Submission Ends)
export function TrayUploadOutlineIcon({ size = 24, color = '#0F766E' }) {
  return (
    <View style={[styles.iconBox, { width: size, height: size }]}>
      <View style={styles.uploadContainer}>
        {/* Up arrow */}
        <Text style={{ fontSize: size * 0.65, color, fontWeight: '900', lineHeight: size * 0.7 }}>
          ↑
        </Text>
        {/* Tray base */}
        <View style={[styles.trayBase, { borderColor: color }]} />
      </View>
    </View>
  );
}

// 4. Trophy Outline Icon (Result Date)
export function TrophyOutlineIcon({ size = 24, color = '#0F766E' }) {
  return (
    <View style={[styles.iconBox, { width: size, height: size }]}>
      <View style={styles.trophyWrapper}>
        {/* Cup */}
        <View style={[styles.trophyCup, { borderColor: color }]}>
          <View style={[styles.trophyHandleLeft, { borderColor: color }]} />
          <View style={[styles.trophyHandleRight, { borderColor: color }]} />
        </View>
        {/* Stem & Base */}
        <View style={[styles.trophyStem, { backgroundColor: color }]} />
        <View style={[styles.trophyBase, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

// Rewards Icons
export function RewardTrophyIcon({ size = 20 }) {
  return <Text style={{ fontSize: size }}>🏆</Text>;
}

export function RewardMedalSilverIcon({ size = 20 }) {
  return <Text style={{ fontSize: size }}>🥈</Text>;
}

export function RewardMedalBronzeIcon({ size = 20 }) {
  return <Text style={{ fontSize: size }}>🥉</Text>;
}

export function RewardStarOutlineIcon({ size = 18, color = '#0F766E' }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color: '#0D9488', fontWeight: '800' }}>☆</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarBody: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.6,
    alignItems: 'center',
    paddingTop: 1,
  },
  calendarRingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 12,
    marginTop: -3,
    marginBottom: 2,
  },
  calendarRing: {
    width: 2,
    height: 3.5,
    borderRadius: 1,
  },
  calendarDivider: {
    width: '100%',
    height: 1.2,
    marginBottom: 2,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 10,
    gap: 2,
    justifyContent: 'center',
  },
  calendarDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  uploadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
  },
  trayBase: {
    width: 18,
    height: 6,
    borderLeftWidth: 1.6,
    borderRightWidth: 1.6,
    borderBottomWidth: 1.6,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    marginTop: -2,
  },
  trophyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  trophyCup: {
    width: 14,
    height: 11,
    borderWidth: 1.6,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
    position: 'relative',
  },
  trophyHandleLeft: {
    position: 'absolute',
    left: -4,
    top: 1,
    width: 4,
    height: 6,
    borderLeftWidth: 1.4,
    borderTopWidth: 1.4,
    borderBottomWidth: 1.4,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  trophyHandleRight: {
    position: 'absolute',
    right: -4,
    top: 1,
    width: 4,
    height: 6,
    borderRightWidth: 1.4,
    borderTopWidth: 1.4,
    borderBottomWidth: 1.4,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  trophyStem: {
    width: 2,
    height: 3,
  },
  trophyBase: {
    width: 10,
    height: 1.6,
    borderRadius: 0.8,
  },
});
