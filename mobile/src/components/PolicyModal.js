import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors, radius, spacing } from '../theme';

const POLICY_CONTENT = {
  refund: {
    title: 'Refund & Cancellation Policy',
    lastUpdated: 'Updated September 2026',
    sections: [
      {
        heading: '1. Eligibility for Refunds',
        body: 'Participants may request a 100% refund of the competition entry fee if requested at least 24 hours prior to the close of registration. Once judging begins, entry fees are strictly non-refundable.',
      },
      {
        heading: '2. Competition Cancellation',
        body: 'If Feedants cancels or postpones a competition indefinitely for any administrative reason, all registered participants will receive an automated 100% full refund.',
      },
      {
        heading: '3. Processing & Payment Gateway',
        body: 'All refunds are processed securely through our payment partner, Razorpay. Approved refunds typically credit back to the original payment source (UPI / Card / NetBanking) within 3–5 business days.',
      },
      {
        heading: '4. Contact for Support',
        body: 'For refund queries or transaction assistance, contact help@feedants.com with your Registration ID and Transaction Reference.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy & Data Collection',
    lastUpdated: 'Updated September 2026',
    sections: [
      {
        heading: '1. Information We Collect',
        body: 'We collect your name, email address, submitted performance media (video/audio), and referral identifiers necessary for competition management and prize disbursement.',
      },
      {
        heading: '2. How We Use Your Data',
        body: 'Your data is strictly used for participant authentication, judging evaluation, anti-fraud protection, and delivering certificates / prize money.',
      },
      {
        heading: '3. Data Storage & Security',
        body: 'All database records are protected with industry-standard TLS encryption, strict role-based access control, and compliance with the Digital Personal Data Protection (DPDP) Act.',
      },
      {
        heading: '4. Third-Party Sharing',
        body: 'We do not sell user data. Payment transactions are securely tokenized and handled directly by Razorpay without storing sensitive card details on our servers.',
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    lastUpdated: 'Updated September 2026',
    sections: [
      {
        heading: '1. Eligibility & Entry Rules',
        body: 'The Feedants Classical Dance competition is open to all age categories. Each registered participant may submit one original performance video up to 3 minutes in length.',
      },
      {
        heading: '2. Originality & Copyright',
        body: 'Participants must own or have legal rights to perform the submitted choreography and musical accompaniment. Plagiarized or deceptive content will result in immediate disqualification without refund.',
      },
      {
        heading: '3. Judging & Prize Distribution',
        body: 'All decisions by the official judging panel are final. Cash prizes will be transferred to winners via bank transfer / UPI within 7 business days of result declaration.',
      },
    ],
  },
  cookies: {
    title: 'Cookie & Consent Preferences',
    lastUpdated: 'Updated September 2026',
    sections: [
      {
        heading: '1. Essential Cookies',
        body: 'We use essential session tokens and authentication cookies to keep you securely signed in while navigating competition pages.',
      },
      {
        heading: '2. Analytics & Performance',
        body: 'Anonymized usage analytics help us measure site performance and ensure low latency for concurrent users.',
      },
    ],
  },
};

export default function PolicyModal({ visible, policyType = 'refund', onClose }) {
  const [activeTab, setActiveTab] = useState(policyType);

  // Sync state if prop changes
  const currentKey = activeTab || policyType || 'refund';
  const data = POLICY_CONTENT[currentKey] || POLICY_CONTENT.refund;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{data.title}</Text>
              <Text style={styles.subtitle}>{data.lastUpdated}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Tabs */}
          <View style={styles.tabRow}>
            {Object.keys(POLICY_CONTENT).map((key) => {
              const isSelected = key === currentKey;
              const labels = {
                refund: 'Refund',
                privacy: 'Privacy',
                terms: 'Terms',
                cookies: 'Cookies',
              };
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.tabPill, isSelected && styles.tabPillActive]}
                  onPress={() => setActiveTab(key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tabPillText, isSelected && styles.tabPillTextActive]}>
                    {labels[key]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Body Content */}
          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {data.sections.map((sec, idx) => (
              <View key={idx} style={styles.sectionBlock}>
                <Text style={styles.sectionHeading}>{sec.heading}</Text>
                <Text style={styles.sectionBody}>{sec.body}</Text>
              </View>
            ))}
            <View style={{ height: spacing(4) }} />
          </ScrollView>

          {/* Done Button */}
          <TouchableOpacity style={styles.doneButton} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.doneButtonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 27, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '85%',
    paddingHorizontal: spacing(5),
    paddingTop: spacing(5),
    paddingBottom: spacing(6),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing(3),
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: spacing(1),
  },
  closeBtnText: {
    fontSize: 18,
    color: colors.textMuted,
    fontWeight: '700',
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: spacing(4),
    backgroundColor: '#F1F5F9',
    borderRadius: radius.pill,
    padding: 3,
  },
  tabPill: {
    flex: 1,
    paddingVertical: spacing(1.5),
    alignItems: 'center',
    borderRadius: radius.pill,
  },
  tabPillActive: {
    backgroundColor: colors.primary,
  },
  tabPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollBody: {
    paddingBottom: spacing(4),
  },
  sectionBlock: {
    marginBottom: spacing(3.5),
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  sectionBody: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing(3),
    alignItems: 'center',
    marginTop: spacing(2),
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
