import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

import { t } from '../utils/i18n';

export default function BottomActionBar({ action, isSubmitting, onPress, lang = 'ENG' }) {
  if (!action) return null;

  const isDisabled = !action.enabled || isSubmitting;

  let label = action.label;
  let subLabel = action.subLabel;

  if (lang === 'हिंदी') {
    if (action.action === 'REGISTER') {
      label = t(lang, 'registerNow');
      subLabel = 'प्रवेश शुल्क: ₹99';
    } else if (action.action === 'SUBMIT' || action.action === 'RESUBMIT' || label?.toLowerCase().includes('submission')) {
      label = t(lang, 'uploadSubmission');
      subLabel = t(lang, 'registeredBadge');
    }
  }

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.button, isDisabled && styles.buttonDisabled]}
        disabled={isDisabled}
        onPress={() => onPress(action.action || action.type || 'REGISTER')}
        activeOpacity={0.88}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <View style={styles.buttonContent}>
            <Text style={styles.buttonTitle}>{label}</Text>
            {subLabel ? (
              <Text style={styles.buttonSubtitle}>{subLabel}</Text>
            ) : null}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing(4),
    paddingTop: spacing(2.5),
    paddingBottom: spacing(2.5),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  button: {
    backgroundColor: '#075A4E',
    borderRadius: radius.md,
    paddingVertical: spacing(3),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#075A4E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: -0.2,
  },
  buttonSubtitle: {
    color: '#A7F3D0',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
