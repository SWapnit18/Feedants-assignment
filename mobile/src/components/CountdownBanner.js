import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { formatCountdown } from '../utils/dateUtils';
import { t } from '../utils/i18n';
import { HourglassOutlineIcon, StopwatchOutlineIcon } from './MinimalIcons';

const STATE_LABELS_ENG = {
  UPCOMING: 'Registration opens in',
  REGISTRATION_OPEN: 'Registration closes in',
  REGISTRATION_FULL: 'Registration closed',
  AWAITING_SUBMISSION_WINDOW: 'Submissions open in',
  SUBMISSION_OPEN: 'Submissions close in',
  JUDGING: 'Judging in progress',
  RESULTS_DECLARED: 'Results declared',
};

const STATE_LABELS_HI = {
  UPCOMING: 'पंजीकरण शुरू होने में',
  REGISTRATION_OPEN: 'पंजीकरण समाप्त होने में',
  REGISTRATION_FULL: 'पंजीकरण बंद',
  AWAITING_SUBMISSION_WINDOW: 'प्रस्तुति शुरू होने में',
  SUBMISSION_OPEN: 'प्रस्तुति समाप्त होने में',
  JUDGING: 'मूल्यांकन जारी है',
  RESULTS_DECLARED: 'परिणाम घोषित',
};

export default function CountdownBanner({ state, targetAt, serverOffsetMs, onExpire, lang = 'ENG' }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const labelMap = lang === 'हिंदी' ? STATE_LABELS_HI : STATE_LABELS_ENG;
  const labelText = labelMap[state] || t(lang, 'registrationClosesIn');
  const countdown = formatCountdown(targetAt, serverOffsetMs);

  if (countdown?.isExpired && onExpire) {
    onExpire();
  }

  return (
    <View style={styles.banner}>
      <View style={styles.leftGroup}>
        <View style={styles.iconWrapper}>
          <HourglassOutlineIcon size={14} color="#0F766E" />
        </View>
        <Text style={styles.label}>{labelText}</Text>
      </View>

      <Text style={styles.countdown}>{countdown?.label || '01d : 06h : 28m : 32s'}</Text>

      <View style={styles.rightGroup}>
        <View style={styles.iconWrapper}>
          <StopwatchOutlineIcon size={14} color="#0F766E" />
        </View>
        <Text style={styles.hurry}>{t(lang, 'hurryUp')}</Text>
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
  iconWrapper: {
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
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
  hurry: {
    color: colors.primary,
    fontSize: 11.5,
    fontWeight: '700',
  },
});
