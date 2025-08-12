# Design System Guide

**System**: UI Components & Design Tokens  
**Status**: ✅ Production Ready  
**Last Updated**: 2025-08-11

## 🎨 **Overview**

SmartLedger's design system provides consistent, reusable UI components with built-in theming, dark mode support, and accessibility features.

## 📁 **Architecture**

```
src/design-system/
├── components/          # Core UI components
│   ├── Button.tsx      # Primary/secondary/outline variants
│   ├── TextInput.tsx   # Form inputs with validation
│   ├── Typography.tsx  # Text components with variants  
│   └── Card.tsx       # Container components
├── colors.ts          # Color palette (light/dark)
├── tokens.ts          # Design tokens (spacing, typography)
├── theme.tsx          # Theme provider and context
└── index.ts           # Unified exports
```

## 🎯 **Core Components**

### **Button Component**
```typescript
// Usage Examples
<Button variant="primary" size="lg" fullWidth>
  Primary Action
</Button>

<Button variant="outline" size="md">
  Secondary Action  
</Button>

<Button variant="secondary" loading disabled>
  Loading State
</Button>

// Props Interface
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
  children: React.ReactNode;
}
```

### **TextInput Component**
```typescript
// Usage Examples
<TextInput
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  error={errors.email}
  required
/>

<TextInput
  label="Password"
  secureTextEntry
  showPasswordToggle
  hint="Minimum 6 characters"
/>

// Props Interface
interface TextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  required?: boolean;
}
```

### **Typography Component**
```typescript
// Usage Examples
<Typography variant="h1">Main Heading</Typography>
<Typography variant="body1" color="textSecondary">
  Body text with secondary color
</Typography>
<Typography variant="caption" weight="bold" align="center">
  Small bold centered text
</Typography>

// Available Variants
type TypographyVariant = 
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'subtitle1' | 'subtitle2'
  | 'body1' | 'body2'
  | 'caption' | 'overline';

type TypographyColor = 
  | 'primary' | 'secondary' | 'text' 
  | 'textSecondary' | 'textTertiary'
  | 'success' | 'warning' | 'error';
```

## 🌈 **Color System**

### **Color Palette**
```typescript
// Brand Colors
const brandColors = {
  primary: {
    50: '#F0FDFA',
    100: '#CCFBF1', 
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#0a7ea4',  // Main brand color
    600: '#0891B2',
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
  }
};

// Semantic Colors
const semanticColors = {
  success: { light: '#10B981', main: '#059669', dark: '#047857' },
  warning: { light: '#F59E0B', main: '#D97706', dark: '#B45309' },
  error: { light: '#EF4444', main: '#DC2626', dark: '#B91C1C' },
  info: { light: '#3B82F6', main: '#2563EB', dark: '#1D4ED8' }
};
```

### **Theme Usage**
```typescript
// Access theme colors in components
const { theme } = useTheme();

// Direct color access
const primaryColor = theme.colors.primary;
const backgroundColor = theme.colors.background;

// Specific color hook
const textColor = useThemeColor('text');
```

## 📏 **Design Tokens**

### **Spacing System (8pt Grid)**
```typescript
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

// Usage in components
<View style={{ marginBottom: theme.spacing.lg }}>
  <Text>Content with 24pt bottom margin</Text>
</View>
```

### **Typography Scale**
```typescript
export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System', 
    bold: 'System',
  },
  fontSize: {
    xs: 12,   sm: 14,   base: 16,  lg: 18,
    xl: 20,   '2xl': 24, '3xl': 30, '4xl': 36,
  },
  lineHeight: {
    tight: 1.25,  normal: 1.5,  relaxed: 1.75,
  },
  letterSpacing: {
    tight: -0.05,  normal: 0,  wide: 0.1,
  }
};
```

### **Border Radius**
```typescript
export const borderRadius = {
  none: 0,    xs: 2,     sm: 4,     base: 6,
  md: 8,      lg: 12,    xl: 16,    '2xl': 20,
  '3xl': 24,  full: 9999,
};
```

## 🌙 **Dark Mode Integration**

### **Automatic Theme Detection**
```typescript
// Theme provider automatically detects system preference
export function ThemeProvider({ children, theme = 'auto' }) {
  const systemColorScheme = useColorScheme();
  
  const currentTheme = useMemo(() => {
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
```

### **Color Definitions**
```typescript
// Light Theme Colors
export const lightColors = {
  primary: '#0a7ea4',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#6B7280',
  // ...
};

// Dark Theme Colors  
export const darkColors = {
  primary: '#0a7ea4',
  background: '#000000',
  surface: '#1F2937',
  text: '#FFFFFF', 
  textSecondary: '#9CA3AF',
  // ...
};
```

## 🔧 **Component Development Patterns**

### **Theme-Aware Styling**
```typescript
// Using theme hook in components
export function CustomComponent() {
  const theme = useTheme();
  
  return (
    <View style={[
      styles.container,
      { backgroundColor: theme.colors.surface }
    ]}>
      <Text style={{ color: theme.colors.text }}>
        Theme-aware text
      </Text>
    </View>
  );
}

// Static styles with dynamic theme colors
const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
  }
});
```

### **Component Props Pattern**
```typescript
// Consistent prop interface pattern
interface BaseComponentProps {
  children?: React.ReactNode;
  style?: ViewStyle | TextStyle;
  testID?: string;
}

// Variant-based styling
interface ComponentProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}
```

## ♿ **Accessibility Support**

### **Accessibility Properties**
```typescript
// Built-in accessibility support
<Button
  accessibilityRole="button"
  accessibilityLabel="Sign in to your account"
  accessibilityHint="Navigates to dashboard after successful login"
>
  Sign In
</Button>

<TextInput
  accessibilityLabel="Email address"
  accessibilityHint="Enter your email address"
  accessibilityInvalid={!!error}
/>
```

### **Screen Reader Support**
- All components include proper accessibility roles
- Form inputs have descriptive labels
- Error states announced to screen readers
- Color contrast meets WCAG AA standards

## 📱 **Platform Adaptations**

### **iOS Specific**
- Native SF Symbols integration
- Platform-appropriate haptic feedback
- iOS blur effects for tab bars

### **Android Specific**
- Material Design icon fallbacks
- Platform-appropriate elevation
- Android-specific touch feedback

## 🧪 **Testing Components**

### **Component Testing Pattern**
```typescript
// Design system component tests
describe('Button Component', () => {
  it('renders with correct variant styles', () => {
    const { getByText } = render(
      <ThemeProvider>
        <Button variant="primary">Test Button</Button>
      </ThemeProvider>
    );
    
    expect(getByText('Test Button')).toBeTruthy();
  });
});
```

### **Theme Testing**
```typescript
// Test both light and dark themes
const TestWrapper = ({ children, isDark = false }) => (
  <ThemeProvider theme={isDark ? 'dark' : 'light'}>
    {children}
  </ThemeProvider>
);
```

## 🚀 **Usage Guidelines**

### **Do's**
- ✅ Use design system components exclusively
- ✅ Follow spacing token system (8pt grid)
- ✅ Implement proper accessibility properties
- ✅ Test components in both light and dark themes
- ✅ Use semantic color names (not hex values)

### **Don'ts**
- ❌ Create custom components without design system patterns
- ❌ Use hardcoded spacing values
- ❌ Skip accessibility properties
- ❌ Use theme colors outside of theme context
- ❌ Mix design system and non-design system components

## 📚 **Related Documentation**

- [NativeWind Setup](./NativeWind-Setup.md) - Tailwind CSS integration
- [Dark Mode Implementation](./Dark-Mode.md) - Theme switching details
- [Component Architecture](../Architecture/Component-Architecture.md) - Development patterns

---

**Maintainer**: UI/UX Team  
**Review**: Design tokens updated each design review  
**Support**: Individual component documentation in Storybook (future)