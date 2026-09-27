import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Share, StyleSheet } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { colors, radius, spacing } from '../theme';
import { MegaphoneOutlineIcon } from './MinimalIcons';

import { t } from '../utils/i18n';

export default function ReferEarnCard({ referral, lang = 'ENG' }) {
  const [copied, setCopied] = useState(false);
  const shareLink = referral?.shareLink || 'https://feedants.com/r/referral123';
  const earnAmount = referral?.earnAmountPerSignup || 10;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me on Feedants for the Classical Dance competition! Register here: ${shareLink}`,
      });
    } catch (e) {
      // ignore
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <MegaphoneOutlineIcon size={18} color="#0F766E" />
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{t(lang, 'referTitle')}</Text>

        <View style={styles.mainRow}>
          {/* Link box with Copy button */}
          <View style={styles.linkContainer}>
            <Text style={styles.linkText} numberOfLines={1}>
              {shareLink}
            </Text>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopy} activeOpacity={0.7}>
              <Text style={styles.copyText}>{copied ? t(lang, 'copied') : t(lang, 'copyLink')}</Text>
            </TouchableOpacity>
          </View>

          {/* Refer Now CTA */}
          <View style={styles.referActionGroup}>
            <TouchableOpacity style={styles.referButton} onPress={handleShare} activeOpacity={0.85}>
              <Text style={styles.referButtonText}>{t(lang, 'referNow')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.earnSubtext}>
          {t(lang, 'earnPerSignup')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#E6F7F4',
    borderRadius: radius.lg,
    padding: spacing(3.5),
    marginHorizontal: spacing(4),
    marginTop: spacing(3),
    borderWidth: 1,
    borderColor: '#D4EFEA',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#C8EDE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing(2.5),
    marginTop: 2,
  },
  icon: {
    fontSize: 16,
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing(2),
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#D2EFE9',
    paddingLeft: spacing(2),
    paddingRight: 2,
    paddingVertical: 2,
    marginRight: spacing(2),
  },
  linkText: {
    flex: 1,
    fontSize: 10.5,
    color: colors.textMuted,
  },
  copyButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.5),
  },
  copyText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  referActionGroup: {
    alignItems: 'center',
  },
  referButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    alignItems: 'center',
  },
  referButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  earnSubtext: {
    fontSize: 10.5,
    color: '#084C42',
    marginTop: spacing(1.5),
    fontWeight: '500',
  },
  earnAmount: {
    fontWeight: '700',
    color: colors.primary,
  },
});
