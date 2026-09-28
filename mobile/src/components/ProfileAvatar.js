import React, { useState } from 'react';
import { View, Text, Image } from 'react-native';

/** Minimal ProfileAvatar — shows first letter of name inside a teal circle. */
export default function ProfileAvatar({
  name = '',
  imageUrl = null,
  size = 40,
  fontSize,
  style,
  textStyle,
  isActive = false,
}) {
  const [imageError, setImageError] = useState(false);

  const getInitial = () => {
    if (!name || typeof name !== 'string') return 'U';
    const trimmed = name.trim();
    return trimmed.charAt(0).toUpperCase() || 'U';
  };

  const initial = getInitial();
  const calculatedFontSize = fontSize || Math.round(size * 0.42);
  const borderRadius = size / 2;
  const hasValidImage = Boolean(
    imageUrl && typeof imageUrl === 'string' && imageUrl.trim().length > 0 && !imageError
  );

  if (hasValidImage) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[
          { width: size, height: size, borderRadius, backgroundColor: '#E2E8F0' },
          isActive && { borderWidth: 2, borderColor: '#0F7C6C' },
          style,
        ]}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
        { backgroundColor: '#0F7C6C' },
        isActive && { borderWidth: 2, borderColor: '#0F7C6C' },
      ]}
    >
      <Text
        style={[
          {
            color: '#FFFFFF',
            fontSize: calculatedFontSize,
            fontWeight: '700',
            textAlign: 'center',
            includeFontPadding: false,
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


