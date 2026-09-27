import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Pressable,
} from 'react-native';
import { colors, radius, spacing } from '../theme';

export default function RegistrationModal({
  visible,
  competition,
  onClose,
  onConfirm,
  isRegistering,
}) {
  const [selectedMethod, setSelectedMethod] = useState('upi');

  if (!competition) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.dragHandle} />

          <View style={styles.header}>
            <Text style={styles.title}>Confirm Registration</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.eventCard}>
            <Text style={styles.eventName}>{competition.title}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>🏆 ₹{competition.prizePool?.toLocaleString?.() || '—'} Prize Pool</Text>
              </View>
              <View style={[styles.badge, styles.badgeTeal]}>
                <Text style={[styles.badgeText, styles.badgeTealText]}>
                  👥 {competition.capacity?.spotsLeft ?? (competition.totalSpots ? Math.max(competition.totalSpots - (competition.spotsBooked || 0), 0) : 0)} spots left
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.feeBreakdown}>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Entry Fee</Text>
              <Text style={styles.feeVal}>₹{competition.entryFee ?? '—'}</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Platform & Processing</Text>
              <Text style={styles.feeFree}>FREE</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.feeRow}>
              <Text style={styles.totalLabel}>Total Payable</Text>
              <Text style={styles.totalVal}>₹{competition.entryFee ?? '—'}</Text>
            </View>
          </View>

          {/* Payment Method Selector */}
          <Text style={styles.methodHeader}>Select Payment Method</Text>
          <View style={styles.methodsGrid}>
            <TouchableOpacity
              style={[styles.methodCard, selectedMethod === 'upi' && styles.methodCardActive]}
              onPress={() => setSelectedMethod('upi')}
            >
              <Text style={styles.methodIcon}>⚡</Text>
              <Text style={[styles.methodText, selectedMethod === 'upi' && styles.methodTextActive]}>
                UPI / GPay
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.methodCard, selectedMethod === 'card' && styles.methodCardActive]}
              onPress={() => setSelectedMethod('card')}
            >
              <Text style={styles.methodIcon}>💳</Text>
              <Text style={[styles.methodText, selectedMethod === 'card' && styles.methodTextActive]}>
                Card / NetBanking
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.trustRow}>
            <Text style={styles.trustText}>🔒 100% Secure Checkout via Razorpay</Text>
          </View>

          <TouchableOpacity
            style={[styles.payButton, isRegistering && styles.payButtonDisabled]}
            disabled={isRegistering}
            onPress={() => onConfirm(selectedMethod)}
            activeOpacity={0.85}
          >
            {isRegistering ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.payButtonText}>Pay ₹{competition.entryFee ?? '—'} & Register</Text>
            )}
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing(5),
    paddingTop: spacing(3),
    paddingBottom: spacing(6),
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: spacing(3),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(3),
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 18,
    color: colors.textMuted,
    fontWeight: '600',
  },
  eventCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    padding: spacing(3),
    marginBottom: spacing(3),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  eventName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing(1.5),
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing(2),
  },
  badge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: spacing(2),
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  badgeTeal: {
    backgroundColor: '#E6FFFA',
  },
  badgeTealText: {
    color: '#075A4E',
  },
  feeBreakdown: {
    backgroundColor: '#F1F5F9',
    borderRadius: radius.md,
    padding: spacing(3.5),
    marginBottom: spacing(3),
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(1.5),
  },
  feeLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  feeVal: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  feeFree: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: spacing(2),
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#075A4E',
  },
  methodHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing(2),
  },
  methodsGrid: {
    flexDirection: 'row',
    gap: spacing(3),
    marginBottom: spacing(3),
  },
  methodCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing(2.5),
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  methodCardActive: {
    borderColor: '#075A4E',
    backgroundColor: '#E6FFFA',
  },
  methodIcon: {
    fontSize: 16,
  },
  methodText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  methodTextActive: {
    color: '#075A4E',
    fontWeight: '700',
  },
  trustRow: {
    alignItems: 'center',
    marginBottom: spacing(3),
  },
  trustText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  payButton: {
    backgroundColor: '#075A4E',
    borderRadius: radius.md,
    paddingVertical: spacing(3.5),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#075A4E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  payButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
