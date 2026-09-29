/**
 * FixMyWay Premium Design System
 * Calm, editorial, human and civic — inspired by premium wellness products,
 * but intentionally distinct from any third-party brand.
 */

export const COLORS = {
  primary: '#21B83A',
  primaryDark: '#16852A',
  primaryNavy: '#18311F',
  primaryLight: '#EAF7EC',
  primaryMuted: '#DDF4E2',
  primaryGlow: 'rgba(33, 184, 58, 0.10)',
  primaryGradientStart: '#21B83A',
  primaryGradientEnd: '#16852A',

  accentEmerald: '#22A447',
  accentGreen: '#22A447',
  accentAmber: '#E9A23B',
  accentRuby: '#D95C55',
  accentRed: '#D95C55',
  accentAmethyst: '#8C63D9',
  accentPurple: '#8C63D9',
  accentCyan: '#5A82D6',

  background: '#F7F5F1',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceHighlight: '#F1F3EE',
  surfaceGlass: 'rgba(255, 255, 255, 0.94)',
  surfaceGlassBorder: 'rgba(255, 255, 255, 0.86)',
  surfaceDark: '#171817',
  surfaceDarkElevated: '#242824',

  success: '#22A447',
  successLight: '#EAF7EC',
  warning: '#E9A23B',
  warningLight: '#FFF4DE',
  error: '#D95C55',
  errorLight: '#FCEAE8',
  active: '#21B83A',
  activeLight: '#EAF7EC',
  resolved: '#22A447',
  resolvedLight: '#EAF7EC',

  low: '#22A447',
  lowLight: '#EAF7EC',
  medium: '#E9A23B',
  mediumLight: '#FFF4DE',
  high: '#D95C55',
  highLight: '#FCEAE8',

  pothole: '#5A82D6',
  potholeLight: '#EEF3FD',
  garbage: '#22A447',
  garbageLight: '#EAF7EC',
  streetlight: '#E9A23B',
  streetlightLight: '#FFF4DE',
  roadDamage: '#D95C55',
  roadDamageLight: '#FCEAE8',
  other: '#8C63D9',
  otherLight: '#F3EEFC',

  border: '#E8E8E3',
  borderLight: '#F1F1ED',
  borderFocus: '#21B83A',
  borderSubtle: '#ECEBE5',

  textPrimary: '#171817',
  textSecondary: '#626762',
  textMuted: '#9A9E99',
  textInverse: '#FFFFFF',

  tabBar: 'rgba(255, 255, 255, 0.96)',
  tabBarBorder: 'rgba(232, 232, 227, 0.72)',
  tabBarActive: '#21B83A',
  tabBarInactive: '#9A9E99',
  header: '#F7F5F1',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
};

export const RADIUS = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  full: 9999,
};

export const TYPOGRAPHY = {
  display: {
    fontFamily: 'serif',
    fontSize: 36,
    fontWeight: '500' as const,
    letterSpacing: -1.1,
    lineHeight: 42,
  },
  heading: {
    fontFamily: 'sans-serif',
    fontSize: 27,
    fontWeight: '600' as const,
    letterSpacing: -0.6,
    lineHeight: 33,
  },
  subheading: {
    fontFamily: 'sans-serif',
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  body: {
    fontFamily: 'sans-serif',
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodyMedium: {
    fontFamily: 'sans-serif',
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 22,
  },
  caption: {
    fontFamily: 'sans-serif',
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 17,
  },
  label: {
    fontFamily: 'sans-serif',
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 0.7,
    textTransform: 'uppercase' as const,
  },
  metric: {
    fontFamily: 'sans-serif',
    fontSize: 34,
    fontWeight: '600' as const,
    letterSpacing: -1,
    lineHeight: 40,
  },
};

export const SHADOWS = {
  card: {
    shadowColor: '#171817',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.035,
    shadowRadius: 16,
    elevation: 2,
  },
  button: {
    shadowColor: '#171817',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  subtle: {
    shadowColor: '#171817',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.025,
    shadowRadius: 8,
    elevation: 1,
  },
  small: {
    shadowColor: '#171817',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 9,
    elevation: 2,
  },
  medium: {
    shadowColor: '#171817',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 4,
  },
  large: {
    shadowColor: '#171817',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  floating: {
    shadowColor: '#171817',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 8,
  },
};
