/**
 * SmartLedger Color System
 * Semantic color tokens for light and dark themes
 */

// ============================================================================
// BRAND COLORS (Financial/Trust inspired)
// ============================================================================
const brandColors = {
  primary: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#0a7ea4', // Main brand color - original teal
    600: '#0891B2',
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
  },
  
  secondary: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
  },

  accent: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },
} as const;

// ============================================================================
// NEUTRAL COLORS
// ============================================================================
const neutralColors = {
  gray: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
    950: '#09090B',
  },
} as const;

// ============================================================================
// SEMANTIC COLORS
// ============================================================================
const semanticColors = {
  success: {
    light: '#10B981',
    main: '#059669',
    dark: '#047857',
  },
  
  warning: {
    light: '#F59E0B',
    main: '#D97706',
    dark: '#B45309',
  },
  
  error: {
    light: '#EF4444',
    main: '#DC2626',
    dark: '#B91C1C',
  },
  
  info: {
    light: '#3B82F6',
    main: '#2563EB',
    dark: '#1D4ED8',
  },
} as const;

// ============================================================================
// LIGHT THEME COLORS
// ============================================================================
export const lightColors = {
  // Primary colors
  primary: brandColors.primary[500],
  primaryLight: brandColors.primary[100],
  primaryDark: brandColors.primary[700],
  
  // Secondary colors
  secondary: brandColors.secondary[500],
  secondaryLight: brandColors.secondary[100],
  secondaryDark: brandColors.secondary[700],
  
  // Accent colors
  accent: brandColors.accent[500],
  accentLight: brandColors.accent[100],
  accentDark: brandColors.accent[700],
  
  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: neutralColors.gray[50],
  backgroundTertiary: neutralColors.gray[100],
  
  // Surface colors (cards, modals, etc.)
  surface: '#FFFFFF',
  surfaceSecondary: neutralColors.gray[50],
  surfaceTertiary: neutralColors.gray[100],
  
  // Text colors
  text: neutralColors.gray[900],
  textSecondary: neutralColors.gray[600],
  textTertiary: neutralColors.gray[400],
  textInverse: '#FFFFFF',
  
  // Border colors
  border: neutralColors.gray[200],
  borderFocused: brandColors.primary[500],
  borderError: semanticColors.error.main,
  
  // Semantic colors
  success: semanticColors.success.main,
  successBackground: '#ECFDF5',
  
  warning: semanticColors.warning.main,
  warningBackground: '#FFFBEB',
  
  error: semanticColors.error.main,
  errorBackground: '#FEF2F2',
  
  info: semanticColors.info.main,
  infoBackground: '#EFF6FF',
  
  // Interactive states
  hover: brandColors.primary[600],
  pressed: brandColors.primary[700],
  disabled: neutralColors.gray[300],
  
  // Special colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  divider: neutralColors.gray[200],
  skeleton: neutralColors.gray[200],
  
  // Financial specific
  profit: '#10B981',
  loss: '#EF4444',
  pending: '#F59E0B',
} as const;

// ============================================================================
// DARK THEME COLORS
// ============================================================================
export const darkColors = {
  // Primary colors
  primary: brandColors.primary[400],
  primaryLight: brandColors.primary[300],
  primaryDark: brandColors.primary[600],
  
  // Secondary colors
  secondary: brandColors.secondary[400],
  secondaryLight: brandColors.secondary[300],
  secondaryDark: brandColors.secondary[600],
  
  // Accent colors
  accent: brandColors.accent[400],
  accentLight: brandColors.accent[300],
  accentDark: brandColors.accent[600],
  
  // Background colors
  background: neutralColors.gray[950],
  backgroundSecondary: neutralColors.gray[900],
  backgroundTertiary: neutralColors.gray[800],
  
  // Surface colors (cards, modals, etc.)
  surface: neutralColors.gray[900],
  surfaceSecondary: neutralColors.gray[800],
  surfaceTertiary: neutralColors.gray[700],
  
  // Text colors
  text: neutralColors.gray[50],
  textSecondary: neutralColors.gray[300],
  textTertiary: neutralColors.gray[500],
  textInverse: neutralColors.gray[900],
  
  // Border colors
  border: neutralColors.gray[700],
  borderFocused: brandColors.primary[400],
  borderError: semanticColors.error.light,
  
  // Semantic colors
  success: semanticColors.success.light,
  successBackground: 'rgba(16, 185, 129, 0.1)',
  
  warning: semanticColors.warning.light,
  warningBackground: 'rgba(245, 158, 11, 0.1)',
  
  error: semanticColors.error.light,
  errorBackground: 'rgba(239, 68, 68, 0.1)',
  
  info: semanticColors.info.light,
  infoBackground: 'rgba(59, 130, 246, 0.1)',
  
  // Interactive states
  hover: brandColors.primary[300],
  pressed: brandColors.primary[500],
  disabled: neutralColors.gray[600],
  
  // Special colors
  overlay: 'rgba(0, 0, 0, 0.7)',
  divider: neutralColors.gray[700],
  skeleton: neutralColors.gray[700],
  
  // Financial specific
  profit: '#34D399',
  loss: '#F87171',
  pending: '#FBB040',
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================
export type ColorScheme = typeof lightColors;
export type ColorKey = keyof ColorScheme;