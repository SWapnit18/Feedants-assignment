import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../theme';

/**
 * Reusable Dynamic ProfileAvatar component.
 *
 * Requirements:
 * 1. Takes user's name dynamically.
 * 2. Extracts first character of first name, converted to uppercase.
 *    (e.g., 'Swapnit Patel' -> 'S', 'Rahul Sharma' -> 'R', 'Ankit' -> 'A')
 * 3. Displays letter centered inside a circular badge with signature Feedants teal background (#0F766E).
 * 4. If imageUrl is provided and valid, renders image. If null, empty, or load error, automatically
 *    falls back to the dynamic initials avatar.
 * 5. Handles empty/null/undefined names gracefully.
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
  const [imageError, setImageError] = useState(false);

  // Dynamically extract the first letter of user's first name in uppercase
  const getInitial = () => {
    if (!name || typeof name !== 'string') return 'U';
    const trimmed = name.trim();
    if (!trimmed) return 'U';
    return trimmed.charAt(0).toUpperCase();
  };

  const initial = getInitial();
  const calculatedFontSize = fontSize || Math.round(size * 0.45);
  const borderRadius = size / 2;
  const hasValidImage = Boolean(imageUrl && typeof imageUrl === 'string' && imageUrl.trim().length > 0 && !imageError);

  if (hasValidImage) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[
          styles.avatarImage,
          { width: size, height: size, borderRadius },
          isActive && styles.activeBorder,
          style,
        ]}
        onError={() => setImageError(true)}
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
          {
            fontSize: calculatedFontSize,
            lineHeight: calculatedFontSize * 1.2,
          },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    backgroundColor: '#0F766E', // Signature Feedants Teal
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.22,
    shadowRadius: 2.5,
    elevation: 3,
  },
  avatarImage: {
    backgroundColor: '#E2E8F0',
  },
  initialText: {
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
    includeFontPadding: false,
    letterSpacing: -0.2,
  },
  activeBorder: {
    borderWidth: 2,
    borderColor: '#0F766E',
  },
});
