import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { formatDate, formatTime } from '../utils/dateUtils';

import { t } from '../utils/i18n';

import {
  CalendarOutlineIcon,
  PaperPlaneOutlineIcon,
  TrayUploadOutlineIcon,
  TrophyOutlineIcon,
} from './MinimalIcons';

function DateCell({ iconComponent, label, iso, isBorderRight, isBorderBottom }) {
  return (
    <View style={[styles.cell, isBorderRight && styles.borderRight, isBorderBottom && styles.borderBottom]}>
      <View style={styles.iconWrapper}>{iconComponent}</View>
      <View style={styles.cellContent}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{formatDate(iso) || '10 Aug 26'}</Text>
        <Text style={styles.time}>{formatTime(iso) || '11:50 PM'}</Text>
      </View>
    </View>
  );
}

export default function ImportantDatesCard({ dates = {}, lang = 'ENG' }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t(lang, 'importantDates')}</Text>
      <View style={styles.grid}>
        <DateCell
          iconComponent={<CalendarOutlineIcon size={22} color="#0F766E" />}
          label={t(lang, 'registerBefore')}
          iso={dates.registrationClosesAt}
          isBorderRight
          isBorderBottom
        />
        <DateCell
          iconComponent={<PaperPlaneOutlineIcon size={20} color="#0F766E" />}
          label={t(lang, 'submissionStarts')}
          iso={dates.submissionStartsAt}
          isBorderBottom
        />
        <DateCell
          iconComponent={<TrayUploadOutlineIcon size={20} color="#0F766E" />}
          label={t(lang, 'submissionEnds')}
          iso={dates.submissionEndsAt}
          isBorderRight
        />
        <DateCell
          iconComponent={<TrophyOutlineIcon size={20} color="#0F766E" />}
          label={t(lang, 'resultDate')}
          iso={dates.resultDate}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(4),
    marginHorizontal: spacing(4),
    marginTop: spacing(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing(3),
    letterSpacing: -0.2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    flexDirection: 'row',
    width: '50%',
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(2),
    alignItems: 'flex-start',
  },
  borderRight: {
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: spacing(3),
  },
  iconWrapper: {
    marginRight: spacing(2.5),
    marginTop: 2,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellContent: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
  },
  time: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '600',
    marginTop: 1,
  },
});
