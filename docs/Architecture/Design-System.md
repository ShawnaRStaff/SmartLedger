# SmartLedger Design System

**Version**: 1.0  
**Status**: Implementation Ready  
**Date**: 2025-08-11  

## Overview

SmartLedger uses a hybrid design system combining NativeWind (Tailwind CSS) with React Native's built-in theming for automatic dark/light mode support and consistent component styling.

## Design Principles

1. **Accessibility First**: WCAG 2.1 AA compliance
2. **Dark Mode Native**: System-aware with manual override
3. **Consistent Spacing**: 4px base unit system
4. **Semantic Colors**: Meaning-based color naming
5. **Component-Based**: Reusable, composable components
6. **TypeScript Strict**: Full type safety

## Color System

### Primary Palette
```typescript
// Financial App Themed Colors
primary: {
  50: '#f0f9ff',   // Lightest blue
  500: '#0ea5e9',  // Brand primary
  600: '#0284c7',  // Primary hover
  700: '#0369a1',  // Primary active
  900: '#0c4a6e',  // Primary dark
}
```

### Semantic Colors
```typescript
success: {
  50: '#f0fdf4',   // Success light
  500: '#22c55e',  // Success primary
  600: '#16a34a',  // Success dark
}

warning: {
  50: '#fffbeb',   // Warning light
  500: '#f59e0b',  // Warning primary
  600: '#d97706',  // Warning dark
}

error: {
  50: '#fef2f2',   // Error light
  500: '#ef4444',  // Error primary
  600: '#dc2626',  // Error dark
}
```

### Financial Context Colors
```typescript
income: 'text-success-600 dark:text-success-400'
expense: 'text-error-600 dark:text-error-400'
balance: 'text-primary-700 dark:text-primary-300'
savings: 'text-warning-600 dark:text-warning-400'
```

## Typography System

### Font Scale (Tailwind Classes)
- **Heading 1**: `text-3xl font-bold` (32px)
- **Heading 2**: `text-2xl font-bold` (24px)
- **Heading 3**: `text-xl font-semibold` (20px)
- **Body**: `text-base` (16px)
- **Small**: `text-sm` (14px)
- **Caption**: `text-xs` (12px)

### Font Weights
- **Regular**: `font-normal` (400)
- **Medium**: `font-medium` (500)
- **Semi-bold**: `font-semibold` (600)
- **Bold**: `font-bold` (700)

## Spacing System (4px base)

```typescript
// Tailwind spacing classes
xs: 'p-1',     // 4px
sm: 'p-2',     // 8px
md: 'p-4',     // 16px
lg: 'p-6',     // 24px
xl: 'p-8',     // 32px
2xl: 'p-12',   // 48px
```

## Component Library

### 1. Text Components
```typescript
<Text variant="h1" className="text-gray-900 dark:text-gray-100">
<Text variant="body" className="text-gray-700 dark:text-gray-300">
<Text variant="caption" className="text-gray-500 dark:text-gray-400">
```

### 2. Button Components
```typescript
<Button variant="primary" size="lg">Primary Action</Button>
<Button variant="secondary" size="md">Secondary Action</Button>
<Button variant="outline" size="sm">Tertiary Action</Button>
```

### 3. Input Components
```typescript
<TextInput
  label="Email"
  placeholder="Enter your email"
  error="Invalid email address"
  className="bg-white dark:bg-gray-800"
/>
```

### 4. Card Components
```typescript
<Card className="bg-white dark:bg-gray-800 shadow-md">
  <CardHeader>
    <CardTitle>Transaction Summary</CardTitle>
  </CardHeader>
  <CardContent>
    // Card content
  </CardContent>
</Card>
```

## Dark Mode Implementation

### NativeWind Dark Mode Classes
```typescript
// Background colors
'bg-white dark:bg-gray-900'
'bg-gray-50 dark:bg-gray-800'

// Text colors
'text-gray-900 dark:text-gray-100'
'text-gray-600 dark:text-gray-300'

// Border colors
'border-gray-200 dark:border-gray-700'
'border-gray-300 dark:border-gray-600'
```

### Theme Detection Hook
```typescript
const { isDark, theme } = useColorScheme();

// Apply conditional styling
className={`bg-white ${isDark ? 'dark:bg-gray-900' : ''}`}
```

## Authentication Screens Design

### Sign In Screen
- **Header**: Large title with subtitle
- **Form**: Email input, password input, forgot password link
- **Actions**: Sign in button, sign up link, social sign in
- **Layout**: Centered form with proper spacing

### Sign Up Screen
- **Header**: Welcome message
- **Form**: Display name, email, password, confirm password
- **Validation**: Real-time validation with error states
- **Actions**: Create account button, sign in link

### Password Reset Screen
- **Header**: Reset instructions
- **Form**: Email input only
- **Validation**: Email format validation
- **Actions**: Send reset button, back to sign in link

## Responsive Design

### Screen Breakpoints
- **Small**: 320px - 480px (phones)
- **Medium**: 481px - 768px (large phones, small tablets)
- **Large**: 769px+ (tablets, landscape)

### Layout Patterns
```typescript
// Mobile-first responsive padding
className="px-4 sm:px-6 lg:px-8"

// Responsive text sizing
className="text-lg sm:text-xl lg:text-2xl"

// Responsive grid
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
```

## Implementation Strategy

### Phase 1: Core Components
1. **Text Component**: Enhanced with Tailwind classes
2. **Button Component**: Multiple variants and sizes
3. **TextInput Component**: Form input with validation
4. **Card Component**: Container for content sections

### Phase 2: Authentication Components
1. **AuthForm**: Reusable form container
2. **FormField**: Input with label and error handling
3. **SocialSignIn**: Google sign-in button
4. **AuthLayout**: Consistent auth screen layout

### Phase 3: Advanced Components
1. **TransactionCard**: Financial transaction display
2. **ProgressBar**: Budget and goal progress
3. **Chart Components**: Financial data visualization
4. **NotificationBanner**: In-app notifications

## File Organization

```
src/components/
├── ui/
│   ├── Text.tsx
│   ├── Button.tsx
│   ├── TextInput.tsx
│   ├── Card.tsx
│   └── index.ts
├── auth/
│   ├── AuthForm.tsx
│   ├── FormField.tsx
│   ├── SocialSignIn.tsx
│   └── index.ts
├── financial/
│   ├── TransactionCard.tsx
│   ├── ProgressBar.tsx
│   └── index.ts
└── layout/
    ├── Screen.tsx
    ├── Container.tsx
    └── index.ts
```

## Usage Guidelines

### Consistent Class Application
```typescript
// Use semantic classes
className="bg-primary-500 text-white"  // ✅ Good
className="bg-blue-500 text-white"     // ❌ Avoid

// Use responsive classes
className="p-4 sm:p-6 lg:p-8"          // ✅ Good
className="p-4"                        // ❌ Not responsive

// Use dark mode classes
className="bg-white dark:bg-gray-900"  // ✅ Good
className="bg-white"                   // ❌ Not dark mode ready
```

### Component Composition
```typescript
// Build complex components from simple ones
<Card>
  <CardHeader>
    <Text variant="h2">Balance Overview</Text>
  </CardHeader>
  <CardContent>
    <Text variant="h1" className="text-success-600">
      $2,547.32
    </Text>
  </CardContent>
</Card>
```

## Next Steps

1. **Create Enhanced Text Component** with Tailwind integration
2. **Build Button Component** with all variants
3. **Develop TextInput Component** for forms
4. **Implement Auth Screen Components**
5. **Test Dark Mode** across all components
6. **Validate Accessibility** with screen readers

This design system provides a solid foundation for building consistent, accessible, and beautiful financial management interfaces.