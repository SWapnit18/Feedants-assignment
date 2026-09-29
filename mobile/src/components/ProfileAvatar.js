import React from 'react';
import { View, Text } from 'react-native';

/** Minimal ProfileAvatar — always shows first letter of name inside a teal circle. */
export default function ProfileAvatar({
  name = '',
  size = 40,
  fontSize,
  style,
  textStyle,
  isActive = false,
}) {
  const getInitial = () => {
    if (!name || typeof name !== 'string') return 'U';
    const trimmed = name.trim();
    return trimmed.charAt(0).toUpperCase() || 'U';
  };

  const initial = getInitial();
  const calculatedFontSize = fontSize || Math.round(size * 0.42);
  const borderRadius = size / 2;

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


