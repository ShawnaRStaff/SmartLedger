import React, { createContext, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, ColorScheme } from './colors';
import { spacing, typography, borderRadius, shadows, layout, opacity, animation } from './tokens';

// ============================================================================
// THEME TYPE DEFINITION
// ============================================================================
export interface Theme {
  colors: ColorScheme;
  spacing: typeof spacing;
  typography: typeof typography;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  layout: typeof layout;
  opacity: typeof opacity;
  animation: typeof animation;
  isDark: boolean;
}

// ============================================================================
// THEME CONFIGURATIONS
// ============================================================================
const lightTheme: Theme = {
  colors: lightColors,
  spacing,
  typography,
  borderRadius,
  shadows,
  layout,
  opacity,
  animation,
  isDark: false,
};

const darkTheme: Theme = {
  colors: darkColors,
  spacing,
  typography,
  borderRadius,
  shadows,
  layout,
  opacity,
  animation,
  isDark: true,
};

// ============================================================================
// THEME CONTEXT
// ============================================================================
const ThemeContext = createContext<Theme | undefined>(undefined);

// ============================================================================
// THEME PROVIDER
// ============================================================================
interface ThemeProviderProps {
  children: ReactNode;
  theme?: 'light' | 'dark' | 'auto';
}

export function ThemeProvider({ children, theme = 'auto' }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  
  const currentTheme = React.useMemo(() => {
    if (theme === 'auto') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return theme === 'dark' ? darkTheme : lightTheme;
  }, [theme, systemColorScheme]);

  return (
    <ThemeContext.Provider value={currentTheme}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================================================
// USE THEME HOOK
// ============================================================================
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// ============================================================================
// HELPER HOOKS
// ============================================================================

/**
 * Get a specific color from the theme
 */
export function useThemeColor(colorKey: keyof ColorScheme) {
  const { colors } = useTheme();
  return colors[colorKey];
}

/**
 * Get multiple theme values at once
 */
export function useThemeValues<T extends keyof Theme>(
  ...keys: T[]
): Pick<Theme, T> {
  const theme = useTheme();
  const result = {} as Pick<Theme, T>;
  
  keys.forEach(key => {
    result[key] = theme[key];
  });
  
  return result;
}

// ============================================================================
// STYLE SHEET HELPER
// ============================================================================
import { StyleSheet } from 'react-native';

/**
 * Create a themed stylesheet
 */
export function createThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  stylesFn: (theme: Theme) => T
) {
  return () => {
    const theme = useTheme();
    return React.useMemo(() => {
      return StyleSheet.create(stylesFn(theme));
    }, [
      theme.colors,
      theme.spacing, 
      theme.typography,
      theme.borderRadius,
      theme.shadows,
      theme.isDark
    ]);
  };
}

// ============================================================================
// EXPORT EVERYTHING
// ============================================================================
export * from './colors';
export * from './tokens';