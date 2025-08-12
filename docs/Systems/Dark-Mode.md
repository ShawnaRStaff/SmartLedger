# Dark Mode Implementation Guide

**System**: Theme Switching & Dark Mode  
**Status**: ✅ Production Ready  
**Last Updated**: 2025-08-12

## 🌙 **Overview**

SmartLedger provides seamless dark mode support with automatic system preference detection, manual theme switching, and consistent theming across all components.

## 🏗️ **Architecture**

### **Theme System Structure**
```
src/design-system/
├── theme.tsx              # Theme provider & context
├── colors.ts             # Light & dark color palettes  
├── tokens.ts             # Design tokens (spacing, typography)
└── hooks/
    └── useTheme.ts       # Theme access hook

app/
└── _layout.tsx           # Root theme provider wrapper
```

### **Theme Flow**
```
System Preference → Theme Detection → Theme Provider → Component Styling
      ↓                    ↓               ↓               ↓
  Light/Dark        Auto Detection    Context Value    Dynamic Colors
```

## 🎨 **Color System**

### **Color Palette Definition**
```typescript
// src/design-system/colors.ts
export const lightColors = {
  // Brand colors
  primary: '#0a7ea4',
  secondary: '#6B7280',
  
  // Backgrounds
  background: '#FFFFFF',
  surface: '#FFFFFF',
  card: '#F9FAFB',
  
  // Text colors
  text: '#000000',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  
  // UI elements
  border: '#E5E7EB',
  divider: '#F3F4F6',
  shadow: '#00000010',
  
  // States
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

export const darkColors = {
  // Brand colors (same primary)
  primary: '#0a7ea4',
  secondary: '#9CA3AF',
  
  // Backgrounds  
  background: '#000000',
  surface: '#111827',
  card: '#1F2937',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',
  
  // UI elements
  border: '#374151',
  divider: '#4B5563',
  shadow: '#00000050',
  
  // States (slightly adjusted for dark mode)
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
};
```

### **Theme Configuration**
```typescript
// src/design-system/theme.tsx
export interface Theme {
  colors: typeof lightColors;
  spacing: typeof spacing;
  typography: typeof typography;
  borderRadius: typeof borderRadius;
  isDark: boolean;
}

export const lightTheme: Theme = {
  colors: lightColors,
  spacing,
  typography, 
  borderRadius,
  isDark: false,
};

export const darkTheme: Theme = {
  colors: darkColors,
  spacing,
  typography,
  borderRadius,
  isDark: true,
};
```

## 🔧 **Theme Provider Implementation**

### **Theme Context**
```typescript
// src/design-system/theme.tsx
import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

export function useThemeColor(colorName: keyof Theme['colors']) {
  const { theme } = useTheme();
  return theme.colors[colorName];
}
```

### **Auto-detecting Theme Provider**
```typescript
// src/design-system/theme.tsx
interface ThemeProviderProps {
  children: React.ReactNode;
  forcedTheme?: 'light' | 'dark' | 'auto';
}

export function ThemeProvider({ 
  children, 
  forcedTheme = 'auto' 
}: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [manualTheme, setManualTheme] = useState<'light' | 'dark' | null>(null);
  
  const currentTheme = useMemo(() => {
    // Priority: Manual override > Forced theme > System preference
    if (manualTheme) {
      return manualTheme === 'dark' ? darkTheme : lightTheme;
    }
    
    if (forcedTheme !== 'auto') {
      return forcedTheme === 'dark' ? darkTheme : lightTheme;
    }
    
    return systemColorScheme === 'dark' ? darkTheme : lightTheme;
  }, [systemColorScheme, manualTheme, forcedTheme]);

  const toggleTheme = useCallback(() => {
    setManualTheme(prev => 
      prev === 'dark' ? 'light' : 'dark'
    );
  }, []);

  const contextValue = useMemo(() => ({
    theme: currentTheme,
    isDark: currentTheme.isDark,
    toggleTheme,
  }), [currentTheme, toggleTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
```

## 📱 **Component Dark Mode Support**

### **Theme-Aware Component Pattern**
```typescript
// Example: Button component with dark mode
export function Button({ 
  variant = 'primary', 
  children, 
  ...props 
}: ButtonProps) {
  const { theme } = useTheme();

  const buttonStyles = useMemo(() => [
    styles.base,
    variant === 'primary' && {
      backgroundColor: theme.colors.primary,
    },
    variant === 'secondary' && {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
  ], [theme, variant]);

  const textStyles = useMemo(() => [
    styles.text,
    variant === 'primary' && { color: '#FFFFFF' },
    variant === 'secondary' && { color: theme.colors.text },
  ], [theme, variant]);

  return (
    <TouchableOpacity style={buttonStyles} {...props}>
      <Text style={textStyles}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### **Using Theme Hook**
```typescript
// Simple theme color access
export function Card({ children }: { children: React.ReactNode }) {
  const backgroundColor = useThemeColor('card');
  const borderColor = useThemeColor('border');
  const textColor = useThemeColor('text');

  return (
    <View style={{
      backgroundColor,
      borderColor,
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
    }}>
      <Text style={{ color: textColor }}>
        {children}
      </Text>
    </View>
  );
}
```

## 🌬️ **NativeWind Dark Mode Integration**

### **Automatic Dark Mode Classes**
```tsx
// NativeWind classes automatically switch based on theme
<View className="bg-white dark:bg-gray-800">
  <Text className="text-black dark:text-white">
    Auto-switching text color
  </Text>
  <TouchableOpacity className="bg-blue-500 dark:bg-blue-600 
                                 active:bg-blue-600 dark:active:bg-blue-700 
                                 px-4 py-2 rounded-lg">
    <Text className="text-white">Button</Text>
  </TouchableOpacity>
</View>
```

### **Custom Dark Mode Classes**
```css
/* src/styles/global.css */
@layer components {
  .card {
    @apply bg-white dark:bg-gray-800;
    @apply border border-gray-200 dark:border-gray-700;
    @apply rounded-xl p-4 shadow-sm;
  }
  
  .text-primary {
    @apply text-gray-900 dark:text-white;
  }
  
  .text-secondary {
    @apply text-gray-600 dark:text-gray-400;
  }
  
  .btn-primary {
    @apply bg-primary-500 active:bg-primary-600;
    @apply text-white px-4 py-2 rounded-lg;
  }
  
  .input {
    @apply border border-gray-300 dark:border-gray-600;
    @apply bg-white dark:bg-gray-800;
    @apply text-gray-900 dark:text-white;
    @apply px-3 py-2 rounded-lg;
  }
}
```

## ⚙️ **Manual Theme Control**

### **Theme Toggle Component**
```typescript
import { Moon, Sun } from 'lucide-react-native';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
      accessibilityRole="button"
      accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun size={20} color="#F59E0B" />
      ) : (
        <Moon size={20} color="#6B7280" />
      )}
    </TouchableOpacity>
  );
}
```

### **Settings Screen Integration**
```typescript
export function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="card mx-4 my-2">
        <Text className="text-lg font-semibold text-primary mb-4">
          Appearance
        </Text>
        
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="font-medium text-primary">
              Dark Mode
            </Text>
            <Text className="text-secondary text-sm mt-1">
              {isDark ? 'Dark theme enabled' : 'Light theme enabled'}
            </Text>
          </View>
          
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ 
              false: '#E5E7EB', 
              true: theme.colors.primary 
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
}
```

## 🎯 **Screen-Level Implementation**

### **App Layout with Theme**
```typescript
// app/_layout.tsx
import { ThemeProvider } from '@/design-system/theme';
import '@/styles/global.css';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <StatusBarManager />
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}

// Status bar theme management
function StatusBarManager() {
  const { isDark } = useTheme();
  
  return (
    <StatusBar 
      style={isDark ? 'light' : 'dark'}
      backgroundColor="transparent"
      translucent
    />
  );
}
```

### **Screen with Theme Support**
```typescript
export default function HomeScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={{ 
      flex: 1, 
      backgroundColor: theme.colors.background 
    }}>
      <ScrollView className="flex-1">
        <View className="p-4">
          <Text className="text-2xl font-bold text-primary mb-4">
            Welcome to SmartLedger
          </Text>
          
          <View className="card mb-4">
            <Text className="text-primary font-semibold mb-2">
              Account Balance
            </Text>
            <Text className="text-3xl font-bold text-success">
              $2,847.32
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

## 💾 **Theme Persistence**

### **AsyncStorage Implementation**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = 'app_theme_preference';

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [storedTheme, setStoredTheme] = useState<'light' | 'dark' | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load stored theme preference
  useEffect(() => {
    async function loadTheme() {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') {
          setStoredTheme(saved);
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
      } finally {
        setIsLoaded(true);
      }
    }
    
    loadTheme();
  }, []);

  // Save theme preference
  const setTheme = useCallback(async (newTheme: 'light' | 'dark' | 'auto') => {
    try {
      if (newTheme === 'auto') {
        await AsyncStorage.removeItem(THEME_STORAGE_KEY);
        setStoredTheme(null);
      } else {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
        setStoredTheme(newTheme);
      }
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }, []);

  const currentTheme = useMemo(() => {
    if (!isLoaded) return lightTheme; // Default while loading
    
    if (storedTheme) {
      return storedTheme === 'dark' ? darkTheme : lightTheme;
    }
    
    return systemColorScheme === 'dark' ? darkTheme : lightTheme;
  }, [systemColorScheme, storedTheme, isLoaded]);

  // Show loading screen while theme is loading
  if (!isLoaded) {
    return <LoadingScreen />;
  }

  return (
    <ThemeContext.Provider value={{
      theme: currentTheme,
      isDark: currentTheme.isDark,
      setTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

## 🧪 **Testing Dark Mode**

### **Theme Testing Utilities**
```typescript
// src/__tests__/utils/theme-test-utils.tsx
export const renderWithTheme = (
  component: React.ReactElement,
  theme: 'light' | 'dark' = 'light'
) => {
  const ThemeWrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider forcedTheme={theme}>
      {children}
    </ThemeProvider>
  );

  return render(component, { wrapper: ThemeWrapper });
};

// Test both themes
export const renderWithBothThemes = (component: React.ReactElement) => {
  return {
    light: renderWithTheme(component, 'light'),
    dark: renderWithTheme(component, 'dark'),
  };
};
```

### **Component Theme Tests**
```typescript
// __tests__/components/Button.test.tsx
describe('Button Dark Mode', () => {
  it('should apply correct colors in light theme', () => {
    const { getByRole } = renderWithTheme(
      <Button>Test Button</Button>,
      'light'
    );
    
    const button = getByRole('button');
    expect(button.props.style).toMatchObject({
      backgroundColor: lightColors.primary,
    });
  });

  it('should apply correct colors in dark theme', () => {
    const { getByRole } = renderWithTheme(
      <Button>Test Button</Button>,
      'dark'
    );
    
    const button = getByRole('button');
    expect(button.props.style).toMatchObject({
      backgroundColor: darkColors.primary,
    });
  });

  it('should match snapshots for both themes', () => {
    const { light, dark } = renderWithBothThemes(
      <Button>Snapshot Test</Button>
    );
    
    expect(light.toJSON()).toMatchSnapshot('button-light-theme');
    expect(dark.toJSON()).toMatchSnapshot('button-dark-theme');
  });
});
```

## 🚀 **Performance Optimization**

### **Memoization Best Practices**
```typescript
// Memoize theme-dependent styles
const useButtonStyles = (variant: string, theme: Theme) => {
  return useMemo(() => ({
    base: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
    },
    primary: {
      backgroundColor: theme.colors.primary,
    },
    secondary: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
  }), [theme, variant]);
};
```

### **Reduce Re-renders**
```typescript
// Avoid recreating objects in render
const ThemeAwareComponent = React.memo(({ title }: { title: string }) => {
  const theme = useTheme();
  
  // ✅ Good - memoized styles
  const styles = useMemo(() => ({
    container: { backgroundColor: theme.colors.background },
    text: { color: theme.colors.text },
  }), [theme]);
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
});
```

## 📊 **Dark Mode Metrics**

### **Usage Analytics**
```typescript
import { logEvent } from 'firebase/analytics';

export function trackThemeChange(newTheme: 'light' | 'dark') {
  logEvent(analytics, 'theme_changed', {
    theme: newTheme,
    timestamp: Date.now(),
  });
}

export function trackThemePreference() {
  const { isDark } = useTheme();
  
  logEvent(analytics, 'theme_preference', {
    theme: isDark ? 'dark' : 'light',
    auto_detect: true,
  });
}
```

## 📚 **Related Documentation**

- [Design System](./Design-System.md) - Theme-aware component library
- [NativeWind Setup](./NativeWind-Setup.md) - Tailwind dark mode classes
- [Testing Framework](./Testing-Framework.md) - Theme testing strategies

---

**Maintainer**: UI/UX Team  
**Review**: Dark mode implementation reviewed with each design system update  
**Support**: Theme system maintained as part of design system updates