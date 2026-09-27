import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { colors, radius, spacing } from '../theme';

export default function NavigationSheet({ visible, tabKey, onClose }) {
  if (!visible || !tabKey) return null;

  const contentMap = {
    home: {
      title: '🏠 Feedants Feed',
      subtitle: 'Discover trending dance routines and live competitions',
      details: 'Welcome to Feedants Home feed! Here you can discover live competitions, trending submissions, community posts, and featured artists.',
    },
    explore: {
      title: '🔍 Explore Categories',
      subtitle: 'Browse classical, hip-hop, contemporary, and folk competitions',
      details: 'Filter competitions by genre, prize pool, age group, or submission deadlines across India.',
    },
    create: {
      title: '✨ Host a Competition',
      subtitle: 'Create and sponsor your own verified talent contest',
      details: 'Are you a dance academy, brand, or artist? Create and host your own multi-tier contest with automated judging and Razorpay prize escrow.',
    },
    profile: {
      title: '👤 User Profile',
      subtitle: 'Demo Participant (demo@feedants.com)',
      details: 'Registered Competitions: 1\nSubmissions: 0\nWallet Balance: ₹10 (Referral)\nKYC Status: Verified (DPDP Compliant)',
    },
  };

  const current = contentMap[tabKey] || contentMap.home;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>{current.title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>{current.subtitle}</Text>
          <View style={styles.contentBox}>
            <Text style={styles.detailsText}>{current.details}</Text>
          </View>

          <TouchableOpacity style={styles.actionBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.actionBtnText}>Back to Competition</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing(4),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing(5),
    maxWidth: 420,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(1.5),
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing(3),
  },
  contentBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    padding: spacing(3.5),
    marginBottom: spacing(4),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailsText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
  actionBtn: {
    backgroundColor: '#075A4E',
    borderRadius: radius.md,
    paddingVertical: spacing(3),
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
