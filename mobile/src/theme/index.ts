import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const colors = {
  primary: '#11707A',
  primaryDark: '#0B5C64',
  primaryText: '#0F6E78',
  primaryTint: '#E6F4F3',
  primaryTintStrong: '#D5ECEA',
  primaryDisabled: '#8FB9BD',
  mint: '#E8F6EE',
  background: '#F7F9F9',
  surface: '#FFFFFF',
  surfaceMuted: '#F4F6F7',
  border: '#E6EBEC',
  borderStrong: '#D7DEE0',
  text: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#6B7280',
  textFaint: '#9CA3AF',
  gold: '#E6A817',
  silver: '#A7AFB8',
  bronze: '#E4702A',
  danger: '#D14343',
  dangerTint: '#FDECEC',
  success: '#1F8A5B',
  razorpay: '#072654',
  razorpayAccent: '#3395FF',
  overlay: 'rgba(10, 20, 22, 0.55)',
  white: '#FFFFFF',
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  pill: 999,
} as const;

export const fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
} as const;

type Variant =
  | 'display'
  | 'title'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'bodyMedium'
  | 'label'
  | 'caption'
  | 'tiny';

export const typography: Record<Variant, TextStyle> = {
  display: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 36, color: colors.primaryText },
  title: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 28, color: colors.text },
  heading: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20, color: colors.text },
  subheading: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18, color: colors.text },
  body: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, color: colors.textSecondary },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 19, color: colors.text },
  label: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.textMuted },
  caption: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 15, color: colors.textMuted },
  tiny: { fontFamily: fonts.medium, fontSize: 10, lineHeight: 13, color: colors.textMuted },
};

export const shadow: ViewStyle = Platform.select<ViewStyle>({
  ios: {
    shadowColor: '#0B3B40',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  android: { elevation: 1.5 },
  default: {},
}) as ViewStyle;

export const theme = { colors, spacing, radius, fonts, typography, shadow };
export type Theme = typeof theme;
