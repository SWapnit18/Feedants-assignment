import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { typography } from '../theme';

export type TextVariant = keyof typeof typography;

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  weight?: TextStyle['fontFamily'];
  align?: TextStyle['textAlign'];
}

/** Text with the design's type scale baked in. */
export function AppText({ variant = 'body', color, weight, align, style, ...rest }: AppTextProps) {
  return (
    <Text
      {...rest}
      style={[
        typography[variant],
        color ? { color } : null,
        weight ? { fontFamily: weight } : null,
        align ? { textAlign: align } : null,
        style,
      ]}
    />
  );
}
