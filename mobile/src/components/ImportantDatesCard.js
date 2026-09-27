import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { formatDate, formatTime } from '../utils/dateUtils';

function DateCell({ icon, label, iso, isBorderRight, isBorderBottom }) {
  return (
    <View style={[styles.cell, isBorderRight && styles.borderRight, isBorderBottom && styles.borderBottom]}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.cellContent}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{formatDate(iso) || '10 Aug 26'}</Text>
        <Text style={styles.time}>{formatTime(iso) || '11:50 PM'}</Text>
      </View>
    </View>
  );
}

export default function ImportantDatesCard({ dates = {} }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Important Dates</Text>
      <View style={styles.grid}>
        <DateCell
          icon="📅"
          label="Register Before"
          iso={dates.registrationClosesAt}
          isBorderRight
          isBorderBottom
        />
        <DateCell
          icon="🛫"
          label="Submission Starts"
          iso={dates.submissionStartsAt}
          isBorderBottom
        />
        <DateCell
          icon="📤"
          label="Submission Ends"
          iso={dates.submissionEndsAt}
          isBorderRight
        />
        <DateCell
          icon="🏆"
          label="Result Date"
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
  icon: {
    fontSize: 18,
    marginRight: spacing(2),
    marginTop: 2,
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
