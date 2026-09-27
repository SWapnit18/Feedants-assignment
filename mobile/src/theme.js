export const colors = {
  primary: '#0F7C6C',
  primaryDark: '#0A5E52',
  primaryLight: '#E6F7F4',
  primarySoft: '#F0FAF8',
  tealText: '#0F7C6C',
  accentTeal: '#008374',

  text: '#0D1B2A',
  textSecondary: '#4A5568',
  textMuted: '#6B7A8D',
  textLight: '#94A3B8',

  border: '#E2E8F0',
  borderLight: '#EDF2F7',
  background: '#F8FAFC',
  card: '#FFFFFF',

  razorpay: '#0C2340',
  razorpayBlue: '#3395FF',

  warning: '#FDECEC',
  warningText: '#C0392B',
  success: '#10B981',
  successBg: '#ECFDF5',

  gold: '#E8A93A',
  silver: '#9AA3AC',
  bronze: '#C17A3E',

  grayPillBg: '#F1F5F9',
  langPillBg: '#F1F5F9',
  tagBg: '#F1F5F9',
};

export const spacing = (n) => n * 4;

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const typography = {
  title: { fontSize: 20, fontWeight: '700', color: colors.text, letterSpacing: -0.2 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  body: { fontSize: 13, lineHeight: 20, color: colors.textSecondary },
  caption: { fontSize: 11, color: colors.textMuted },
  amount: { fontSize: 20, fontWeight: '700' },
};
