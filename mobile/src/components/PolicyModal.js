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
  ENG: {
    refund: {
      title: 'Refund & Cancellation Policy',
      lastUpdated: 'Updated September 2026',
      tabLabel: 'Refund',
      doneBtn: 'Got it',
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
      tabLabel: 'Privacy',
      doneBtn: 'Got it',
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
      tabLabel: 'Terms',
      doneBtn: 'Got it',
      sections: [
        {
          heading: '1. Eligibility & Entry Rules',
          body: 'Review the competition rules and organizer policy before registering or submitting an entry.',
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
      tabLabel: 'Cookies',
      doneBtn: 'Got it',
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
  },
  हिंदी: {
    refund: {
      title: 'रिफंड और रद्दीकरण नीति',
      lastUpdated: 'अपडेटेड सितंबर 2026',
      tabLabel: 'रिफंड',
      doneBtn: 'समझ गया',
      sections: [
        {
          heading: '1. रिफंड की पात्रता',
          body: 'पंजीकरण समाप्त होने से कम से कम 24 घंटे पहले अनुरोध किए जाने पर प्रतिभागी 100% रिफंड प्राप्त कर सकते हैं। मूल्यांकन शुरू होने के बाद प्रवेश शुल्क वापस नहीं किया जाएगा।',
        },
        {
          heading: '2. प्रतियोगिता रद्दीकरण',
          body: 'यदि फीडएंट्स किसी प्रशासनिक कारण से प्रतियोगिता रद्द या स्थगित करता है, तो सभी पंजीकृत प्रतिभागियों को 100% पूरा रिफंड मिलेगा।',
        },
        {
          heading: '3. भुगतान गेटवे और प्रोसेसिंग',
          body: 'सभी रिफंड रेज़रपे के माध्यम से सुरक्षित रूप से प्रोसेस किए जाते हैं। 3-5 कार्य दिवसों में मूल स्रोत (UPI / कार्ड / नेटबैंकिंग) पर क्रेडिट हो जाते हैं।',
        },
        {
          heading: '4. सहायता संपर्क',
          body: 'रिफंड पूछताछ के लिए अपनी पंजीकरण आईडी के साथ help@feedants.com पर संपर्क करें।',
        },
      ],
    },
    privacy: {
      title: 'गोपनीयता नीति एवं डेटा सुरक्षा',
      lastUpdated: 'अपडेटेड सितंबर 2026',
      tabLabel: 'प्राइवेसी',
      doneBtn: 'समझ गया',
      sections: [
        {
          heading: '1. एकत्रित जानकारी',
          body: 'हम आपका नाम, ईमेल और प्रस्तुति वीडियो एकत्रित करते हैं जो प्रतियोगिता प्रबंधन और पुरस्कार वितरण के लिए आवश्यक हैं।',
        },
        {
          heading: '2. डेटा का उपयोग',
          body: 'आपके डेटा का उपयोग केवल मूल्यांकन, प्रमाणीकरण और प्रमाण पत्र / पुरस्कार राशि प्रदान करने के लिए किया जाता है।',
        },
        {
          heading: '3. डेटा सुरक्षा',
          body: 'सभी रिकॉर्ड TLS एन्क्रिप्शन और डिजिटल डेटा सुरक्षा अधिनियम के तहत पूर्णतः सुरक्षित हैं।',
        },
        {
          heading: '4. थर्ड पार्टी शेयरिंग',
          body: 'हम उपयोगकर्ता डेटा कभी नहीं बेचते। भुगतान सीधे रेज़रपे द्वारा सुरक्षित रूप से प्रोसेस किए जाते हैं।',
        },
      ],
    },
    terms: {
      title: 'नियम और शर्तें',
      lastUpdated: 'अपडेटेड सितंबर 2026',
      tabLabel: 'नियम व शर्तें',
      doneBtn: 'समझ गया',
      sections: [
        {
          heading: '1. पात्रता और प्रवेश नियम',
          body: 'प्रतियोगिता में भाग लेने से पहले सभी नियम और आयोजक दिशानिर्देश ध्यानपूर्वक पढ़ें।',
        },
        {
          heading: '2. मौलिकता और कॉपीराइट',
          body: 'प्रस्तुत की गई कोरियोग्राफी मूल और वैध होनी चाहिए। किसी अन्य की सामग्री नकल करने पर तत्काल अयोग्य घोषित किया जाएगा।',
        },
        {
          heading: '3. निर्णय और पुरस्कार',
          body: 'निर्णायक मंडल का निर्णय अंतिम और सर्वमान्य होगा। परिणाम घोषित होने के 7 दिनों के भीतर पुरस्कार राशि भेजी जाएगी।',
        },
      ],
    },
    cookies: {
      title: 'कुकी और सहमति प्राथमिकताएं',
      lastUpdated: 'अपडेटेड सितंबर 2026',
      tabLabel: 'कुकीज़',
      doneBtn: 'समझ गया',
      sections: [
        {
          heading: '1. आवश्यक कुकीज़',
          body: 'हम सत्र टोकन और प्रमाणीकरण के लिए आवश्यक कुकीज़ का उपयोग करते हैं।',
        },
        {
          heading: '2. एनालिटिक्स',
          body: 'गुमनाम डेटा का उपयोग ऐप के प्रदर्शन को बेहतर बनाने के लिए किया जाता है।',
        },
      ],
    },
  },
};

export default function PolicyModal({ visible, policyType = 'refund', onClose, lang = 'ENG' }) {
  const [activeTab, setActiveTab] = useState(policyType);

  const curLang = lang === 'हिंदी' ? 'हिंदी' : 'ENG';
  const langPack = POLICY_CONTENT[curLang] || POLICY_CONTENT.ENG;
  const currentKey = activeTab || policyType || 'refund';
  const data = langPack[currentKey] || langPack.refund;

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
            {Object.keys(langPack).map((key) => {
              const isSelected = key === currentKey;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.tabPill, isSelected && styles.tabPillActive]}
                  onPress={() => setActiveTab(key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tabPillText, isSelected && styles.tabPillTextActive]}>
                    {langPack[key]?.tabLabel || key}
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
            <Text style={styles.doneButtonText}>{data.doneBtn || 'Got it'}</Text>
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
