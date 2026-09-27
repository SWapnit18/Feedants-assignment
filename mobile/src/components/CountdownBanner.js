import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { formatCountdown } from '../utils/dateUtils';

const STATE_LABELS = {
  UPCOMING: 'Registration opens in',
  REGISTRATION_OPEN: 'Registration closes in',
  REGISTRATION_FULL: 'Registration closed',
  AWAITING_SUBMISSION_WINDOW: 'Submissions open in',
  SUBMISSION_OPEN: 'Submissions close in',
  JUDGING: 'Judging in progress',
  RESULTS_DECLARED: 'Results declared',
};

export default function CountdownBanner({ state, targetAt, serverOffsetMs, onExpire }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const labelText = STATE_LABELS[state] || 'Registration closes in';
  const countdown = formatCountdown(targetAt, serverOffsetMs);

  if (countdown?.isExpired && onExpire) {
    onExpire();
  }

  return (
    <View style={styles.banner}>
      <View style={styles.leftGroup}>
        <Text style={styles.hourglassIcon}>⏳</Text>
        <Text style={styles.label}>{labelText}</Text>
      </View>

      <Text style={styles.countdown}>{countdown?.label || '01d : 06h : 28m : 32s'}</Text>

      <View style={styles.rightGroup}>
        <Text style={styles.hurryIcon}>⏱️</Text>
        <Text style={styles.hurry}>Hurry up!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E6F7F4',
    borderRadius: radius.md,
    paddingVertical: spacing(2.5),
    paddingHorizontal: spacing(3.5),
    marginHorizontal: spacing(4),
    marginTop: spacing(3),
    borderWidth: 1,
    borderColor: '#D2EFE9',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hourglassIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  label: {
    color: colors.text,
    fontSize: 11.5,
    fontWeight: '600',
  },
  countdown: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hurryIcon: {
    fontSize: 11,
    marginRight: 3,
  },
  hurry: {
    color: colors.primary,
    fontSize: 11.5,
    fontWeight: '700',
  },
});
