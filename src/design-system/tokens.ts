/**
 * SmartLedger Design System Tokens
 * Centralized design tokens for consistent UI across the app
 */

// ============================================================================
// SPACING SYSTEM (8pt grid system)
// ============================================================================
export const spacing = {
  xxs: 2,   // 2pt
  xs: 4,    // 4pt
  sm: 8,    // 8pt
  md: 16,   // 16pt
  lg: 24,   // 24pt
  xl: 32,   // 32pt
  xxl: 40,  // 40pt
  xxxl: 48, // 48pt
} as const;

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================
export const typography = {
  // Font Families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
    mono: 'SpaceMono-Regular',
  },

  // Font Sizes
  fontSize: {
    // Headings
    h1: 32,
    h2: 28,
    h3: 24,
    h4: 20,
    h5: 18,
    h6: 16,
    
    // Body
    xl: 18,
    lg: 16,
    md: 14,
    sm: 12,
    xs: 10,
    
    // Special
    button: 16,
    caption: 12,
    overline: 10,
  },

  // Font Weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================
export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
} as const;

// ============================================================================
// SHADOWS (iOS and Android optimized)
// ============================================================================
export const shadows = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  xxl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 16,
  },
} as const;

// ============================================================================
// Z-INDEX LAYERS
// ============================================================================
export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  popover: 500,
  toast: 600,
  tooltip: 700,
} as const;

// ============================================================================
// ANIMATION DURATIONS
// ============================================================================
export const animation = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 700,
  },
  easing: {
    linear: [0, 0, 1, 1],
    easeIn: [0.42, 0, 1, 1],
    easeOut: [0, 0, 0.58, 1],
    easeInOut: [0.42, 0, 0.58, 1],
  },
} as const;

// ============================================================================
// BREAKPOINTS (for responsive design if needed)
// ============================================================================
export const breakpoints = {
  sm: 360,
  md: 414,
  lg: 768,
  xl: 1024,
} as const;

// ============================================================================
// LAYOUT
// ============================================================================
export const layout = {
  // Container padding
  containerPadding: {
    sm: spacing.md,
    md: spacing.lg,
    lg: spacing.xl,
  },
  
  // Max widths
  maxWidth: {
    sm: 400,
    md: 600,
    lg: 800,
    xl: 1200,
  },

  // Component heights
  componentHeight: {
    inputSm: 36,
    inputMd: 44,
    inputLg: 52,
    buttonSm: 32,
    buttonMd: 44,
    buttonLg: 44, // Make large same as medium
    headerHeight: 56,
    tabBarHeight: 60,
  },
} as const;

// ============================================================================
// OPACITY LEVELS
// ============================================================================
export const opacity = {
  transparent: 0,
  disabled: 0.38,
  hint: 0.6,
  divider: 0.12,
  overlay: 0.7,
  full: 1,
} as const;