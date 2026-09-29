/**
 * FixMyWay Premium Design System
 * Warm, editorial, calm and human — built for a consumer civic product.
 */

export const COLORS = {
  background: '#F7F5F1',
  surface: '#FFFFFF',
  surfaceWarm: '#FBFAF7',
  surfaceElevated: '#FFFFFF',
  surfaceHighlight: '#F1F0EB',
  surfaceGlass: 'rgba(255,255,255,0.92)',
  surfaceGlassBorder: 'rgba(255,255,255,0.72)',

  primary: '#21B83A',
  primaryDark: '#16852A',
  primaryLight: '#EAF7EC',
  primaryMuted: '#DDF4E2',
  primaryGlow: 'rgba(33,184,58,0.14)',
  primaryGradientStart: '#21B83A',
  primaryGradientEnd: '#16852A',

  textPrimary: '#171817',
  textSecondary: '#626762',
  textMuted: '#9A9E99',
  textInverse: '#FFFFFF',

  border: '#E8E8E3',
  borderLight: '#F0F0EB',
  borderFocus: '#21B83A',
  borderSubtle: '#ECEBE6',

  success: '#22A447',
  successLight: '#EAF7EC',
  warning: '#E9A23B',
  warningLight: '#FFF4DF',
  error: '#D95C55',
  errorLight: '#FBEAE8',
  active: '#21B83A',
  activeLight: '#EAF7EC',
  resolved: '#22A447',
  resolvedLight: '#EAF7EC',

  low: '#22A447',
  lowLight: '#EAF7EC',
  medium: '#E9A23B',
  mediumLight: '#FFF4DF',
  high: '#D95C55',
  highLight: '#FBEAE8',

  pothole: '#5A82D6',
  potholeLight: '#EDF2FC',
  garbage: '#21B83A',
  garbageLight: '#EAF7EC',
  streetlight: '#E9A23B',
  streetlightLight: '#FFF4DF',
  roadDamage: '#D95C55',
  roadDamageLight: '#FBEAE8',
  other: '#8C63D9',
  otherLight: '#F2EDFB',

  purple: '#8C63D9',
  blue: '#5A82D6',
  softGreen: '#DDF4E2',
  mapGreen: '#DCEFE0',

  // Compatibility aliases retained for existing screens/services.
  primaryNavy: '#171817',
  accentEmerald: '#21B83A',
  accentGreen: '#21B83A',
  accentAmber: '#E9A23B',
  accentRuby: '#D95C55',
  accentRed: '#D95C55',
  accentAmethyst: '#8C63D9',
  accentPurple: '#8C63D9',
  accentCyan: '#5A82D6',
  surfaceDark: '#171817',
  surfaceDarkElevated: '#292B29',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E8E8E3',
  tabBarActive: '#21B83A',
  tabBarInactive: '#9A9E99',
  header: '#FFFFFF',
};

export const SPACING = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  huge: 40,
  display: 48,
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
    fontSize: 36,
    fontWeight: '400' as const,
    letterSpacing: -1,
    lineHeight: 42,
    fontFamily: 'serif',
  },
  displaySmall: {
    fontSize: 30,
    fontWeight: '400' as const,
    letterSpacing: -0.7,
    lineHeight: 36,
    fontFamily: 'serif',
  },
  heading: {
    fontSize: 26,
    fontWeight: '500' as const,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  subheading: {
    fontSize: 19,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    lineHeight: 25,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 17,
  },
  label: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  number: {
    fontSize: 34,
    fontWeight: '600' as const,
    letterSpacing: -1,
    lineHeight: 40,
  },
};

export const SHADOWS = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  button: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  subtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.025,
    shadowRadius: 10,
    elevation: 1,
  },
  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.045,
    shadowRadius: 10,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  large: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 22,
    elevation: 5,
  },
  floating: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 6,
  },
};

export const ANIMATION = {
  micro: 180,
  standard: 260,
  transition: 420,
};

export const ICON_SIZE = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
};
