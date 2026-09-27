import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

const ICONS = {
  1: '🏆',
  2: '🥈',
  3: '🥉',
  4: '⭐',
  5: '⭐',
  6: '⭐',
};

export default function RewardsList({ rewards = [], currency = 'INR', disclaimerText }) {
  if (!rewards.length) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        Rewards <Text style={styles.subtitle}>(All Positions)</Text>
      </Text>

      {rewards.map((r, index) => (
        <View key={r.position || index} style={styles.row}>
          <Text style={styles.icon}>{ICONS[r.position] || '⭐'}</Text>
          <Text style={styles.label}>{r.label || `${r.position}th Winner`}</Text>
          <Text style={styles.amount}>
            {currency === 'INR' ? '₹ ' : ''}{r.amount}
          </Text>
        </View>
      ))}

      {disclaimerText && (
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerIcon}>ⓘ</Text>
          <Text style={styles.disclaimerText}>
            <Text style={styles.disclaimerBold}>Disclaimer: </Text>
            {disclaimerText}
          </Text>
        </View>
      )}
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
    marginBottom: spacing(2.5),
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing(2),
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  icon: {
    fontSize: 16,
    width: 28,
  },
  label: {
    fontSize: 13,
    color: colors.text,
    flex: 1,
    fontWeight: '600',
  },
  amount: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '800',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EBF6F4',
    borderRadius: radius.sm,
    padding: spacing(3),
    marginTop: spacing(3.5),
    borderWidth: 1,
    borderColor: '#D4EFEA',
  },
  disclaimerIcon: {
    marginRight: spacing(2),
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: -1,
  },
  disclaimerText: {
    fontSize: 11.5,
    color: '#09554A',
    flex: 1,
    lineHeight: 16,
  },
  disclaimerBold: {
    fontWeight: '700',
    color: colors.primary,
  },
});
