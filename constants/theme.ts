/**
 * CivicLens Design System
 * Aesthetic: MINIMAL + HUMAN + PREMIUM + FUNCTIONAL + CIVIC
 */

export const COLORS = {
  // Confident Civic Blue
  primary: '#1D4ED8',
  primaryDark: '#1E3A8A',
  primaryNavy: '#0F172A',
  primaryLight: '#EFF6FF',
  primaryMuted: '#DBEAFE',
  primaryGlow: 'rgba(29, 78, 216, 0.08)',
  primaryGradientStart: '#1D4ED8',
  primaryGradientEnd: '#1E40AF',

  // Subtle Supporting Accents
  accentEmerald: '#059669',
  accentGreen: '#059669',
  accentAmber: '#D97706',
  accentRuby: '#DC2626',
  accentRed: '#DC2626',
  accentAmethyst: '#6D28D9',
  accentPurple: '#6D28D9',
  accentCyan: '#0284C7',

  // Surfaces & Backgrounds
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceHighlight: '#F1F5F9',
  surfaceGlass: 'rgba(255, 255, 255, 0.96)',
  surfaceGlassBorder: '#E2E8F0',
  surfaceDark: '#0F172A',
  surfaceDarkElevated: '#1E293B',

  // Semantic Status Feedback (Used Sparingly)
  success: '#059669',
  successLight: '#ECFDF5',
  warning: '#D97706',
  warningLight: '#FFFBEB',
  error: '#DC2626',
  errorLight: '#FEF2F2',
  active: '#2563EB',
  activeLight: '#EFF6FF',
  resolved: '#059669',
  resolvedLight: '#ECFDF5',

  // Severity specific
  low: '#059669',
  lowLight: '#ECFDF5',
  medium: '#D97706',
  mediumLight: '#FFFBEB',
  high: '#DC2626',
  highLight: '#FEF2F2',

  // Civic Categories
  pothole: '#1D4ED8',
  potholeLight: '#EFF6FF',
  garbage: '#059669',
  garbageLight: '#ECFDF5',
  streetlight: '#D97706',
  streetlightLight: '#FFFBEB',
  roadDamage: '#DC2626',
  roadDamageLight: '#FEF2F2',
  other: '#6D28D9',
  otherLight: '#F5F3FF',

  // Borders & Dividers
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderFocus: '#1D4ED8',
  borderSubtle: '#EDE8F5',

  // Typography
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Navigation
  tabBar: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  tabBarActive: '#1D4ED8',
  tabBarInactive: '#64748B',
  header: '#FFFFFF',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const RADIUS = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
};

export const TYPOGRAPHY = {
  display: {
    fontSize: 26,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  subheading: {
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
    textTransform: 'uppercase' as const,
  },
};

export const SHADOWS = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  button: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  subtle: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  small: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  large: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 16,
    elevation: 6,
  },
  floating: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
    elevation: 7,
  },
};
