import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../theme';

/**
 * Reusable dynamic ProfileAvatar component.
 * - If imageUrl is provided, renders the profile picture.
 * - If no imageUrl, extracts the first character of the user's name, converts to uppercase,
 *   and renders a clean, minimalist Feedants teal circular avatar.
 */
export default function ProfileAvatar({
  name = 'Swapnit Patel',
  imageUrl = null,
  size = 40,
  fontSize,
  style,
  textStyle,
  isActive = false,
}) {
  const initial = (name && typeof name === 'string' && name.trim().length > 0)
    ? name.trim().charAt(0).toUpperCase()
    : 'S';

  const calculatedFontSize = fontSize || Math.round(size * 0.45);
  const borderRadius = size / 2;

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[
          styles.avatarImage,
          { width: size, height: size, borderRadius },
          isActive && styles.activeBorder,
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatarContainer,
        {
          width: size,
          height: size,
          borderRadius,
        },
        isActive && styles.activeBorder,
        style,
      ]}
    >
      <Text
        style={[
          styles.initialText,
          { fontSize: calculatedFontSize },
          textStyle,
        ]}
      >
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    backgroundColor: '#0F766E', // Feedants signature teal
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarImage: {
    backgroundColor: '#E2E8F0',
  },
  initialText: {
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
    includeFontPadding: false,
    letterSpacing: -0.5,
  },
  activeBorder: {
    borderWidth: 1.8,
    borderColor: '#0F766E',
  },
});
