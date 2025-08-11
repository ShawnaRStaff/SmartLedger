- start every session by searching for SESSION_SUMMARY.md, reading it if you find it, and then providing a 50 words summary

### Component-Based Architecture for React Expo
**MANDATORY ARCHITECTURE PATTERN**: All functionality implemented using strict component-based pattern:
- **Screen Components**: Top-level screens with navigation logic and data fetching
- **Container Components**: Logic and state management, data transformation
- **Presentational Components**: Pure UI components with props only, no business logic
- **Custom Hooks**: Reusable stateful logic extraction
- **Utility Components**: Shared UI elements (buttons, inputs, modals)

**ARCHITECTURAL REQUIREMENTS**:
- Each feature MUST have separate `screens/`, `components/`, `hooks/`, `services/` directories
- Screens MUST only handle navigation and orchestrate containers
- Containers MUST handle business logic and pass data to presentational components
- Presentational components MUST be pure functions with TypeScript props only
- All state logic MUST be extracted into custom hooks for reusability
- All API calls MUST be isolated in service layers

**ACCEPTABLE COMPONENT USAGE**: ALL functionality requires components - Screen components, Container components, Presentational components, Custom hooks, Context providers, HOCs, Service classes, Firebase integrations, Navigation components, Form components, Modal components

## CRITICAL RULE: STRICT TYPESCRIPT ENFORCEMENT
**ABSOLUTE REQUIREMENT**: ZERO tolerance for typing violations in React Native

### TypeScript Configuration Requirements
```json
{
  "compilerOptions": {
    "target": "es2020",
    "lib": ["es2020"],
    "allowJs": false,
    "skipLibCheck": false,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  }
}
```

### React Native TypeScript Standards
```typescript
// MANDATORY: All component props must be fully typed
interface UserProfileProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
  onEdit: (userId: string) => void;
  isLoading?: boolean;
  darkMode: boolean;
}

// MANDATORY: All custom hooks must have complete typing
interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

function useAuth(): UseAuthReturn {
  // Implementation with complete typing
}

// MANDATORY: All API services must be typed
interface FirestoreService {
  getUserData: (userId: string) => Promise<UserData>;
  updateUserData: (userId: string, data: Partial<UserData>) => Promise<void>;
  deleteUserData: (userId: string) => Promise<void>;
}
```

### ESLint Configuration Requirements
```json
{
  "extends": [
    "expo",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking",
    "prettier"
  ],
  "plugins": ["@typescript-eslint", "react-hooks", "import"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/strict-boolean-expressions": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error",
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling"],
      "newlines-between": "always",
      "alphabetize": { "order": "asc" }
    }]
  }
}
```

## CRITICAL RULE: ENTERPRISE SECURITY STANDARDS
**ZERO COMPROMISE ON SECURITY**: Security is non-negotiable for enterprise React Native apps

### Firebase Security Implementation
```typescript
// MANDATORY: Firestore security rules (firestore.rules)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // User-specific data collections
    match /users/{userId}/data/{document} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}

// MANDATORY: Authentication service with error handling
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

interface AuthService {
  signInWithEmail: (email: string, password: string) => Promise<AuthResult>;
  signUpWithEmail: (email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

class FirebaseAuthService implements AuthService {
  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      // Input validation
      if (!email || !password) {
        throw new Error('Email and password required');
      }

      if (!this.validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: this.handleAuthError(error) };
    }
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private handleAuthError(error: any): string {
    // Never expose internal error details
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      default:
        return 'Authentication failed. Please try again.';
    }
  }
}
```

### Input Validation & Security
```typescript
// MANDATORY: Input validation for all user inputs
import { z } from 'zod';

const UserInputSchema = z.object({
  name: z.string()
    .min(1, 'Name required')
    .max(50, 'Name too long')
    .regex(/^[a-zA-Z\s\-']+$/, 'Invalid characters in name'),
  email: z.string()
    .email('Invalid email format')
    .max(100, 'Email too long'),
});

// MANDATORY: Secure data handling
interface SecureDataHandler {
  sanitizeInput: (input: string) => string;
  validateUserData: (data: unknown) => UserData;
  encryptSensitiveData: (data: string) => string;
}

class DataSecurityService implements SecureDataHandler {
  sanitizeInput(input: string): string {
    // Remove potentially dangerous characters
    return input
      .replace(/<script.*?>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  validateUserData(data: unknown): UserData {
    const result = UserInputSchema.safeParse(data);
    if (!result.success) {
      throw new Error(`Validation failed: ${result.error.message}`);
    }
    return result.data as UserData;
  }
}
```

### Secure Storage Implementation
```typescript
// MANDATORY: Secure storage for sensitive data
import * as SecureStore from 'expo-secure-store';

interface SecureStorageService {
  storeToken: (token: string) => Promise<void>;
  getToken: () => Promise<string | null>;
  clearToken: () => Promise<void>;
}

class ExpoSecureStorage implements SecureStorageService {
  private readonly TOKEN_KEY = 'auth_token';

  async storeToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.TOKEN_KEY, token, {
        requireAuthentication: true,
        authenticationPrompt: 'Authenticate to access your account',
      });
    } catch (error) {
      throw new Error('Failed to store authentication token');
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.TOKEN_KEY);
    } catch (error) {
      return null;
    }
  }

  async clearToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.TOKEN_KEY);
    } catch (error) {
      // Silent fail for logout
    }
  }
}
```

## CRITICAL RULE: COMPREHENSIVE TESTING STRATEGY
**ENTERPRISE TESTING REQUIREMENTS**: All types of testing mandatory for production apps

### Testing Framework Configuration
```json
// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    './src/__tests__/setup.ts'
  ],
  testMatch: [
    '**/__tests__/**/*.(test|spec).ts(x)?'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**/*',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

### Component Testing Patterns
```typescript
// MANDATORY: Component testing with React Native Testing Library
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { UserProfile } from '../UserProfile';

describe('UserProfile Component', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com'
  };

  it('should render user information correctly', () => {
    const { getByText, getByTestId } = render(
      <UserProfile user={mockUser} onEdit={jest.fn()} darkMode={false} />
    );

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('john@example.com')).toBeTruthy();
    expect(getByTestId('user-profile')).toBeTruthy();
  });

  it('should handle edit button press', async () => {
    const mockOnEdit = jest.fn();
    const { getByText } = render(
      <UserProfile user={mockUser} onEdit={mockOnEdit} darkMode={false} />
    );

    fireEvent.press(getByText('Edit'));

    await waitFor(() => {
      expect(mockOnEdit).toHaveBeenCalledWith('1');
    });
  });

  it('should apply dark mode styling', () => {
    const { getByTestId } = render(
      <UserProfile user={mockUser} onEdit={jest.fn()} darkMode={true} />
    );

    const container = getByTestId('user-profile');
    expect(container.props.style).toMatchObject({
      backgroundColor: expect.any(String)
    });
  });
});
```

### Custom Hook Testing
```typescript
// MANDATORY: Custom hooks testing
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from '../hooks/useAuth';

describe('useAuth Hook', () => {
  it('should initialize with null user', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle login successfully', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.user).not.toBeNull();
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle login errors', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('invalid@email', 'wrong');
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.user).toBeNull();
  });
});
```

### E2E Testing with Detox
```typescript
// e2e/auth.e2e.ts
describe('Authentication Flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete login flow successfully', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    await waitFor(element(by.id('dashboard-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should handle invalid credentials', async () => {
    await element(by.id('email-input')).typeText('invalid@example.com');
    await element(by.id('password-input')).typeText('wrong');
    await element(by.id('login-button')).tap();

    await expect(element(by.text('Invalid email or password'))).toBeVisible();
  });
});
```

## UI COMPONENT LIBRARY INTEGRATION
**RECOMMENDED STACK**: Expo Vector Icons + React Native Elements + Custom Components

### Component Library Setup
```typescript
// MANDATORY: Themed component configuration
import { ThemeProvider, createTheme } from 'react-native-elements';

const lightTheme = createTheme({
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    text: '#000000',
    background: '#FFFFFF',
  },
});

const darkTheme = createTheme({
  colors: {
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    success: '#32D74B',
    warning: '#FF9F0A',
    error: '#FF453A',
    text: '#FFFFFF',
    background: '#000000',
  },
});

// MANDATORY: Theme context with system detection
interface ThemeContextType {
  theme: typeof lightTheme;
  isDark: boolean;
  toggleTheme: () => void;
}

export const useAppTheme = (): ThemeContextType => {
  const [isDark, setIsDark] = useState(() => {
    const colorScheme = Appearance.getColorScheme();
    return colorScheme === 'dark';
  });

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDark(colorScheme === 'dark');
    });

    return () => subscription?.remove();
  }, []);

  return {
    theme: isDark ? darkTheme : lightTheme,
    isDark,
    toggleTheme: () => setIsDark(prev => !prev),
  };
};
```

### Custom Component Patterns
```typescript
// MANDATORY: Reusable component with full typing
interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  testID,
}) => {
  const { theme } = useAppTheme();

  const buttonStyle = [
    styles.base,
    styles[size],
    styles[variant](theme),
    disabled && styles.disabled,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={title}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.background} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`](theme)]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
```

## INTERNATIONALIZATION IMPLEMENTATION
**LANGUAGES SUPPORTED**: English (primary), Spanish (secondary)

### i18n Configuration
```typescript
// MANDATORY: i18n setup with react-i18next
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from '../locales/en.json';
import es from '../locales/es.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    lng: Localization.locale.split('-')[0],
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

// MANDATORY: Typed translation hook
interface TranslationKeys {
  'auth.login': string;
  'auth.password': string;
  'auth.email': string;
  'dashboard.welcome': string;
  'errors.networkError': string;
}

export const useTypedTranslation = () => {
  const { t } = useTranslation();
  return (key: keyof TranslationKeys, options?: any) => t(key, options);
};
```

### Translation Files Structure
```json
// locales/en.json
{
  "auth": {
    "login": "Login",
    "password": "Password",
    "email": "Email Address",
    "loginButton": "Sign In",
    "signUpButton": "Create Account"
  },
  "dashboard": {
    "welcome": "Welcome, {{name}}!",
    "loading": "Loading your data..."
  },
  "errors": {
    "networkError": "Network connection error. Please try again.",
    "authError": "Authentication failed. Please check your credentials."
  }
}

// locales/es.json
{
  "auth": {
    "login": "Iniciar Sesión",
    "password": "Contraseña",
    "email": "Correo Electrónico",
    "loginButton": "Iniciar Sesión",
    "signUpButton": "Crear Cuenta"
  },
  "dashboard": {
    "welcome": "¡Bienvenido, {{name}}!",
    "loading": "Cargando tus datos..."
  },
  "errors": {
    "networkError": "Error de conexión de red. Por favor, inténtalo de nuevo.",
    "authError": "Error de autenticación. Por favor, verifica tus credenciales."
  }
}
```

## ACCESSIBILITY COMPLIANCE (WCAG 2.1 AA)
**MANDATORY REQUIREMENTS**: Full accessibility support for enterprise standards

### Accessibility Implementation
```typescript
// MANDATORY: Accessible component patterns
interface AccessibleInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  testID?: string;
}

export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  secureTextEntry = false,
  testID,
}) => {
  const inputId = `input-${testID || label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${inputId}-error`;

  return (
    <View style={styles.inputContainer}>
      <Text
        style={styles.label}
        accessibilityRole="text"
        nativeID={`${inputId}-label`}
      >
        {label}
      </Text>

      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        testID={testID}
        accessibilityLabel={label}
        accessibilityHint={placeholder}
        accessibilityLabelledBy={`${inputId}-label`}
        accessibilityDescribedBy={error ? errorId : undefined}
        accessibilityInvalid={!!error}
      />

      {error && (
        <Text
          style={styles.errorText}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          nativeID={errorId}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

// MANDATORY: Accessibility testing
describe('Accessibility Tests', () => {
  it('should have proper accessibility labels', () => {
    const { getByA11yLabel } = render(
      <AccessibleInput
        label="Email"
        value=""
        onChangeText={jest.fn()}
        testID="email-input"
      />
    );

    expect(getByA11yLabel('Email')).toBeTruthy();
  });

  it('should announce errors to screen readers', () => {
    const { getByA11yRole } = render(
      <AccessibleInput
        label="Email"
        value=""
        onChangeText={jest.fn()}
        error="Invalid email"
        testID="email-input"
      />
    );

    expect(getByA11yRole('alert')).toBeTruthy();
  });
});
```

## PROJECT STRUCTURE REQUIREMENTS
**MANDATORY ORGANIZATION**: Consistent file structure for enterprise development

### Directory Structure
```
src/
├── components/           # Reusable UI components
│   ├── common/          # Basic components (Button, Input, etc.)
│   ├── forms/           # Form-specific components
│   ├── modals/          # Modal components
│   └── navigation/      # Navigation components
├── screens/             # Screen-level components
│   ├── auth/           # Authentication screens
│   ├── dashboard/      # Dashboard screens
│   └── profile/        # Profile screens
├── hooks/              # Custom React hooks
│   ├── auth/          # Authentication hooks
│   ├── api/           # API-related hooks
│   └── ui/            # UI-related hooks
├── services/           # API and external service integrations
│   ├── firebase/      # Firebase services
│   ├── auth/          # Authentication services
│   └── api/           # REST API services
├── context/            # React Context providers
│   ├── auth/          # Authentication context
│   ├── theme/         # Theme context
│   └── i18n/          # Internationalization context
├── utils/              # Utility functions
│   ├── validation/    # Input validation utilities
│   ├── formatting/    # Data formatting utilities
│   └── constants/     # App constants
├── types/              # TypeScript type definitions
│   ├── auth.ts        # Authentication types
│   ├── api.ts         # API response types
│   └── navigation.ts  # Navigation types
├── locales/            # Translation files
│   ├── en.json        # English translations
│   └── es.json        # Spanish translations
└── __tests__/          # Test files
    ├── components/    # Component tests
    ├── hooks/         # Hook tests
    ├── services/      # Service tests
    └── utils/         # Utility tests
```

## Todo List Standard Clauses - CRITICAL PATH BLOCKING PATTERN
**MANDATORY WORKFLOW STRUCTURE**: Always structure todos with BLOCKING dependencies:
- [x] Task complete
- [ ] **CRITICAL PATH BLOCKER**: Update docs/IMPLEMENTATION PLANS/[CURRENT-PLAN].md - PREREQUISITE for all subsequent work
- [ ] **TYPESCRIPT GATE**: Run `npx tsc --noEmit` - ZERO errors allowed
- [ ] **LINT GATE**: Run `npx eslint src/ --ext .ts,.tsx` - ZERO errors allowed
- [ ] **TEST GATE**: Run `npm test` with 80%+ coverage - ALL tests must pass
- [ ] **ACCESSIBILITY GATE**: Verify WCAG compliance - ALL accessibility tests must pass
- [ ] **CHECKPOINT GATE**: Verify docs updated before proceeding
- [ ] **UNBLOCK**: Next task can proceed (BLOCKED until all gates cleared)

**MANDATORY TODO ENFORCEMENT**: EVERY todo list MUST contain these exact items:
1. **FIRST ITEM**: Always "Update docs/IMPLEMENTATION PLANS/[CURRENT-PLAN].md with current progress"
2. **QUALITY VALIDATION**: Always "Run TypeScript, ESLint, and test validation - ZERO violations allowed"
3. **BLOCKING LANGUAGE**: Use "CRITICAL PATH BLOCKER", "PREREQUISITE", "MANDATORY" to emphasize priority
4. **VISUAL REMINDER**: Include full path "docs/IMPLEMENTATION PLANS/[CURRENT-PLAN].md" in every relevant todo
5. **HIGH PRIORITY**: Mark implementation plan updates as "high" priority, everything else as "medium" or "low"

## CRITICAL RULE: IMPLEMENTATION PLAN UPDATES ARE BLOCKERS
**ABSOLUTE REQUIREMENT**: Every task completion creates a CRITICAL PATH BLOCKER that must be cleared before any other work can proceed. Use BLOCKING language patterns to trigger proper workflow attention.

## ULTIMATE PRIORITY: IMPLEMENTATION PLAN IS SINGLE SOURCE OF TRUTH
**ABSOLUTE #1 PRIORITY**: Updating the implementation plan on disk is the HIGHEST PRIORITY action at ALL times. NO EXCEPTIONS.

**ENFORCEMENT MECHANISMS**:
1. **EVERY RESPONSE MUST CHECK**: Before responding to ANY request, ALWAYS ask "Have I updated the implementation plan?"
2. **IMPLEMENTATION PLAN FIRST**: Update implementation plan BEFORE updating todo lists, architecture docs, or any other documentation
3. **NO WORK WITHOUT PLAN UPDATE**: NEVER proceed to next task without implementation plan being current on disk
4. **BLOCKING PATTERN**: Every todo list MUST include "**CRITICAL PATH BLOCKER**: Update docs/IMPLEMENTATION PLANS/[current-plan].md - PREREQUISITE for all subsequent work"
5. **AUTO-REMINDER**: Include implementation plan filename in EVERY todo list item as visual reminder

**VIOLATION PREVENTION**:
- **Before ANY task work**: Check implementation plan status first
- **After ANY completion**: Update implementation plan immediately
- **Before ANY response**: Verify implementation plan is current
- **Never end session**: Without implementation plan being up-to-date on disk

**IMPLEMENTATION PLAN DETECTION**:
- **ALWAYS SEARCH FIRST**: Use `Glob` tool with pattern `docs/IMPLEMENTATION PLANS/*.md` to find active plan
- **AUTO-DETECT CURRENT**: Look for most recently modified .md file in that directory
- **READ CURRENT STATE**: Always read the detected plan to understand current progress
- **NEVER HARDCODE**: Implementation plan filename changes per project
- **FALLBACK**: If multiple plans exist, ask user which is current

## SESSION BEHAVIOR ENFORCEMENT
**EVERY SESSION START**:
1. Search for and identify current implementation plan file using `docs/IMPLEMENTATION PLANS/*.md`
2. Read current status to understand where we are
3. Create first todo item: "Update docs/IMPLEMENTATION PLANS/[DETECTED-FILENAME].md"

**EVERY TASK COMPLETION**:
1. Update implementation plan IMMEDIATELY (not "later", not "after other docs")
2. Mark checkboxes as complete with timestamps
3. Add completion summary with metrics
4. Commit implementation plan changes to disk

**EVERY SESSION END**:
1. Verify implementation plan is current and committed
2. Never leave session with outdated implementation plan
3. Implementation plan must reflect latest actual progress

**NEVER FORGET CHECKLIST**:
- [ ] Implementation plan file detected using `docs/IMPLEMENTATION PLANS/*.md` pattern ✅
- [ ] Current implementation plan identified and read ✅
- [ ] Implementation plan updated with latest progress ✅
- [ ] Implementation plan committed to disk ✅
- [ ] Ready to proceed with other work ✅

## CRITICAL RULE: NEVER MODIFY IMPLEMENTATION PLAN CHECKBOXES
**ABSOLUTE PROHIBITION**: NEVER change checkboxes in ANY implementation plan from `[ ]` to `[x]` until tasks are COMPLETELY FINISHED with all tests passing, all validations passed, and all commits made.

**VIOLATION CONSEQUENCES**: Changing checkboxes prematurely is strictly forbidden and undermines progress tracking.

**ONLY MARK COMPLETE WHEN**:
- All code is written AND tested
- TypeScript validation passes (npx tsc --noEmit = 0 errors)
- ESLint validation passes (npx eslint = 0 errors)
- All tests pass with 80%+ coverage
- All accessibility tests pass
- All commits are made
- All documentation is updated
- Task is completely finished

**NEVER MARK COMPLETE PREMATURELY**: Do not check off items just because code exists - only when the entire task including TypeScript validation, linting, testing, accessibility compliance, commits, and documentation is 100% complete.

## CRITICAL RULE: NEVER SKIP STEPS IN TASK SEQUENCE
**ABSOLUTE PROHIBITION**: NEVER EVER EVER skip steps in a task. ALWAYS complete them in sequence because of dependencies.

**VIOLATION CONSEQUENCES**: Skipping steps breaks dependencies and undermines the implementation process.

**SEQUENTIAL COMPLETION REQUIRED**:
- Each step depends on the previous step being completely finished
- TypeScript validation cannot proceed without complete code
- Tests cannot be written without complete functional requirements
- Accessibility testing cannot proceed without complete components
- Commits cannot be made without passing all validations
- Documentation cannot be updated without working, tested code

**NEVER SKIP AHEAD**: Do not jump to testing or commits when TypeScript validation is incomplete. Complete each step fully before moving to the next.

## Task Implementation Pattern - Component-Based Architecture
For every implementation task, always generate this step sequence:

### Component Structure Requirements
```
src/components/[feature]/
├── components/
│   ├── [Feature]Screen.tsx          # Screen component
│   ├── [Feature]Container.tsx       # Container with logic
│   └── [Feature]Presentation.tsx    # Pure UI component
├── hooks/
│   ├── use[Feature].ts              # Main business logic hook
│   └── use[Feature]Validation.ts    # Validation logic hook
├── services/
│   └── [feature]Service.ts          # API/Firebase integration
├── types/
│   └── [feature].types.ts           # TypeScript interfaces
└── __tests__/
    ├── [Feature]Screen.test.tsx
    ├── [Feature]Container.test.tsx
    ├── [Feature]Presentation.test.tsx
    ├── use[Feature].test.ts
    └── [feature]Service.test.ts
```

### Implementation Steps
- [ ] **ARCHITECTURE STEP**: Create component-based structure with complete TypeScript interfaces
- [ ] **SECURITY STEP**: Implement input validation, Firebase security rules, and secure storage patterns
- [ ] **ACCESSIBILITY STEP**: Implement WCAG 2.1 AA compliance with proper labels, roles, and navigation
- [ ] **INTERNATIONALIZATION STEP**: Add translation keys and implement i18n support
- [ ] **DARK MODE STEP**: Implement theme-aware styling and system preference detection
- [ ] **TYPESCRIPT VALIDATION STEP**: Run `npx tsc --noEmit` - MUST return 0 errors
- [ ] **LINT VALIDATION STEP**: Run `npx eslint src/ --ext .ts,.tsx` - MUST return 0 errors
- [ ] Write comprehensive Jest tests for all components, hooks, and services
- [ ] Write React Native Testing Library tests for component interactions
- [ ] Write Detox E2E tests for critical user flows
- [ ] **TEST STEP**: Run `npm test` - ensure ALL tests pass with 80%+ coverage
- [ ] **ACCESSIBILITY TEST STEP**: Run accessibility test suite - ALL tests must pass
- [ ] **COMMIT STEP**: `git add src/components/[feature]/__tests__/` && `git commit --no-verify -m "Add [feature] comprehensive tests with accessibility"`
- [ ] **COMMIT STEP**: `git add src/components/[feature]/` && `git commit -m "Implement [feature] with component-based architecture, TypeScript, and accessibility"`
- [ ] **DOCUMENTATION STEP**: Update `docs/Architecture/Components/[Feature] Component Architecture.md` with component details
- [ ] **IMPLEMENTATION PLAN UPDATE**: Mark Task X.X complete in current implementation plan with test results and validation status
- [ ] **PRECISE TIMING STEP**: Calculate precise duration from manually tracked timestamps in implementation plan (minutes:seconds format, not vague estimates)

**Key Rules**:
- Tests always committed with `--no-verify` to prevent pre-commit loops
- Code never committed with `--no-verify` to ensure proper validation
- Always update documentation as work progresses
- Always mark implementation plan items complete when finished
- **NEVER mention Claude in commits** - no "Claude Code" or "Co-Authored-By: Claude"
- **NEVER propose a hard reset EVER EVER EVER** - use other git recovery methods only
- **ALL code MUST pass TypeScript validation with ZERO errors**
- **ALL code MUST pass ESLint validation with ZERO errors**
- **ALL code MUST have 80%+ test coverage**
- **ALL components MUST be accessible (WCAG 2.1 AA compliant)**

## DEVELOPMENT ENVIRONMENT CONFIGURATION
**MANDATORY SETUP**: Proper development environment for enterprise React Native

### Package.json Scripts
```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "test:e2e": "detox test",
    "lint": "eslint src/ --ext .ts,.tsx",
    "lint:fix": "eslint src/ --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx,json}\"",
    "validate": "npm run type-check && npm run lint && npm run test",
    "build:android": "eas build --platform android",
    "build:ios": "eas build --platform ios",
    "submit:android": "eas submit --platform android"
  }
}
```

### Pre-commit Configuration (Husky + lint-staged)
```json
// package.json
{
  "lint-staged": {
    "src/**/*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --findRelatedTests --passWithNoTests"
    ],
    "src/**/*.{json,md}": [
      "prettier --write"
    ]
  }
}

// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run type-check
npx lint-staged
```

### Environment Configuration
```typescript
// config/environment.ts
interface EnvironmentConfig {
  NODE_ENV: 'development' | 'staging' | 'production';
  FIREBASE_CONFIG: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  API_BASE_URL: string;
  ENABLE_FLIPPER: boolean;
}

const developmentConfig: EnvironmentConfig = {
  NODE_ENV: 'development',
  FIREBASE_CONFIG: {
    // Development Firebase config
  },
  API_BASE_URL: 'https://api-dev.yourapp.com',
  ENABLE_FLIPPER: true,
};

const productionConfig: EnvironmentConfig = {
  NODE_ENV: 'production',
  FIREBASE_CONFIG: {
    // Production Firebase config
  },
  API_BASE_URL: 'https://api.yourapp.com',
  ENABLE_FLIPPER: false,
};

export const config = __DEV__ ? developmentConfig : productionConfig;
```

## CI/CD PIPELINE CONFIGURATION
**GITHUB ACTIONS**: Automated testing and deployment pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: TypeScript validation
      run: npm run type-check

    - name: Lint validation
      run: npm run lint

    - name: Run tests with coverage
      run: npm run test -- --coverage --watchAll=false

    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info

  build-android:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Setup Expo CLI
      run: npm install -g @expo/cli

    - name: Install dependencies
      run: npm ci

    - name: Build Android
      run: npx eas build --platform android --non-interactive
      env:
        EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

## CRITICAL RULE: NEVER COMPROMISE ON QUALITY OR SECURITY
**ABSOLUTE REQUIREMENT**: Code quality and security are NON-NEGOTIABLE

**ZERO TOLERANCE FOR**:
- TypeScript validation violations (tsc errors)
- ESLint violations
- Test coverage below 80%
- Accessibility compliance failures
- Security vulnerabilities (input validation, authentication bypass)
- Unhandled error cases
- Missing internationalization
- Missing documentation
- Architecture pattern violations

**QUALITY GATES THAT CANNOT BE BYPASSED**:
1. **TypeScript Gate**: `npx tsc --noEmit` MUST return 0 errors
2. **Lint Gate**: `npx eslint` MUST return 0 errors
3. **Test Coverage Gate**: Test coverage MUST be 80% or higher
4. **Accessibility Gate**: WCAG 2.1 AA compliance MUST be verified
5. **Security Gate**: All security validations MUST pass
6. **Component Architecture Gate**: Component-based pattern MUST be followed
7. **Documentation Gate**: All code MUST be documented

**NEVER ACCEPTABLE COMPROMISES**:
- "We'll fix the TypeScript errors later" - NO, typing is required NOW
- "Security can be added in next iteration" - NO, security is required NOW
- "Tests can be written after" - NO, tests are required NOW
- "Accessibility can wait" - NO, accessibility is required NOW
- "Quick and dirty solution" - NO, only quality solutions accepted
- "Skip validation for demo" - NO, validation is always required

## Implementation Metrics Tracking
For every task implementation, record these metrics in the task completion summary:

### Start/End Timestamps (MANUAL TRACKING REQUIRED)
- **Task Start**: Record timestamp when task begins in implementation plan (format: YYYY-MM-DD HH:MM:SS)
- **Task End**: Record timestamp when task completes in implementation plan (format: YYYY-MM-DD HH:MM:SS)
- **Duration**: Calculate from manually tracked timestamps (format: X minutes Y seconds) - NO VAGUE ESTIMATES LIKE "~3 hours"
- **Tracking Method**: Use implementation plan timestamps, NOT git commit times (commits don't reflect actual work duration)

### Code Metrics
- **Lines of Code (LOC)**: Count total lines of production code created/modified
- **Components Created**: Count screen, container, presentational components created
- **Custom Hooks**: Count number of custom hooks implemented
- **Services**: Count number of service classes created
- **Files Created**: Count number of new files created
- **Files Modified**: Count number of existing files modified

### Architecture Compliance Metrics
- **Screen Components**: Count screen-level components with navigation logic
- **Container Components**: Count container components with business logic
- **Presentational Components**: Count pure UI components
- **Custom Hooks**: Count reusable stateful logic extractions
- **Service Classes**: Count API/Firebase integration services
- **Context Providers**: Count context implementations

### Type Safety Metrics
- **TypeScript Validation**: MUST be 100% - Zero errors from `npx tsc --noEmit`
- **ESLint Validation**: MUST be 100% - Zero errors from `npx eslint`
- **Type Annotations**: Count percentage of functions with complete typing
- **Interface Definitions**: Count TypeScript interfaces defined
- **Prop Types**: Count component prop interfaces
- **Hook Return Types**: Count properly typed hook return values

### UI/UX Metrics
- **Accessibility Compliance**: MUST be 100% - All WCAG 2.1 AA requirements met
- **Dark Mode Support**: Count components with theme-aware styling
- **Internationalization**: Count translated strings implemented
- **Responsive Design**: Count components tested on different screen sizes
- **Custom Components**: Count reusable UI components created
- **Vector Icons**: Count icons implemented from Expo Vector Icons

### Security Metrics
- **Input Validation**: Count Pydantic-style validations for user inputs
- **Authentication Flows**: Count secure authentication implementations
- **Firestore Security Rules**: Count user-based access restrictions
- **Secure Storage**: Count secure storage implementations for sensitive data
- **Error Handling**: Count proper error handling without information leakage
- **Firebase Security**: Count proper Firebase security implementations

### Test Metrics
- **Test Files**: Count number of test files created/modified
- **Component Tests**: Count component test suites (Screen, Container, Presentational)
- **Hook Tests**: Count custom hook test suites
- **Service Tests**: Count service/API test suites
- **E2E Tests**: Count Detox end-to-end test scenarios
- **Test Coverage**: Percentage of code coverage (MUST be 80%+)
- **Accessibility Tests**: Count accessibility-specific test scenarios
- **Security Tests**: Count security-specific test functions
- **Lines of Test Code**: Count total lines of test code
- **Test Pass Rate**: Count number of tests passed. IT MUST BE 100%

### Performance Metrics
- **Bundle Size**: App bundle size after implementation
- **Render Performance**: Component render times and optimizations
- **Memory Usage**: Memory footprint of new components
- **Network Requests**: API call optimizations and caching
- **Image Optimization**: Optimized images and asset usage

### Quality Metrics
- **Code Coverage**: Test coverage percentage (target: 80%+)
- **Documentation Lines**: Count lines of component documentation
- **Comment Coverage**: Count inline code comments and explanations
- **Error Boundaries**: Count error boundary implementations
- **Loading States**: Count proper loading state implementations
- **Empty States**: Count empty/error state implementations

### Completion Summary Template
```
**Task X.X Implementation Metrics**
- **Duration**: Started YYYY-MM-DD HH:MM:SS, Ended YYYY-MM-DD HH:MM:SS (X minutes Y seconds) - FROM IMPLEMENTATION PLAN TIMESTAMPS
- **Architecture**: X screen components, Y container components, Z presentational components, W custom hooks
- **Production Code**: X lines across Y files (Z components, W services)
- **Type Safety**: TypeScript validation: ✅ 100% (0 errors), ESLint validation: ✅ 100% (0 errors)
- **UI/UX**: ✅ WCAG 2.1 AA compliant, ✅ Dark mode support, ✅ i18n support (en/es)
- **Security**: X input validators, Y Firebase security rules, Z secure storage implementations
- **Test Code**: X lines across Y test files (Z component tests, W hook tests, V E2E tests)
- **Test Coverage**: X% coverage (MUST be 80%+), 100% test pass rate
- **Performance**: X KB bundle size, Y ms average render time
- **Quality**: X documentation lines, Y error boundaries, Z loading states
- **Architecture Compliance**: ✅ Component-based pattern, ✅ Strict typing, ✅ Accessibility, ✅ Security standards, ✅ i18n support
```