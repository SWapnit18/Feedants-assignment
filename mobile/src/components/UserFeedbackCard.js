import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

export default function UserFeedbackCard() {
  const handlePress = () => {
    Alert.alert(
      'Participant Reviews',
      '🌟 "Feedants gave me an amazing platform to share my Kathak performance with thousands of classical dance lovers!" — Ananya S.\n\n🌟 "Great judging panel and seamless prize distribution!" — Rohan M.'
    );
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.75}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>💬</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Hear From Our Users</Text>
        <Text style={styles.subtitle}>See what participants say about Feedants</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(3.5),
    marginHorizontal: spacing(4),
    marginTop: spacing(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing(3),
  },
  icon: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: colors.textMuted,
    fontWeight: '300',
    marginLeft: spacing(2),
  },
});
