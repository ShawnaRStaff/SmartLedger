# Testing Framework Guide

**System**: Jest + React Native Testing Library  
**Status**: ✅ Production Ready  
**Last Updated**: 2025-08-11

## 🧪 **Overview**

SmartLedger uses a comprehensive testing stack with Jest and React Native Testing Library for unit, integration, and component testing with 80%+ coverage requirements.

## 🛠️ **Testing Stack**

### **Core Technologies**
- **Jest**: JavaScript testing framework with snapshot testing
- **React Native Testing Library**: Component testing utilities
- **jest-expo**: Expo-specific Jest preset and utilities
- **@testing-library/jest-native**: Additional Jest matchers for React Native

### **Coverage Requirements**
```javascript
// jest.config.js - Coverage thresholds
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80, 
    lines: 80,
    statements: 80
  }
}
```

## ⚙️ **Configuration**

### **Jest Configuration (jest.config.js)**
```javascript
/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/src/__tests__/setup.ts'
  ],
  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/src/__tests__/setup.ts',
    '<rootDir>/node_modules/'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**/*',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!app/**/*.test.{ts,tsx}',
    '!app/**/*.spec.{ts,tsx}',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/design-system$': '<rootDir>/src/design-system/index.ts'
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*)'
  ]
};
```

### **Test Setup (src/__tests__/setup.ts)**
```typescript
import '@testing-library/jest-native/extend-expect';

// Mock React Native modules
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock Expo modules
jest.mock('expo-constants', () => ({
  manifest: {},
}));

// Mock Firebase
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

// Global test utilities
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
```

## 📝 **Test Commands**

### **Available Scripts**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests with specific pattern
npm test -- --testPathPattern=Button

# Run tests in CI mode
npm test -- --watchAll=false --coverage
```

### **Package.json Scripts**
```json
{
  "scripts": {
    "test": "npx jest",
    "test:watch": "npx jest --watch", 
    "test:coverage": "npx jest --coverage",
    "test:ci": "npx jest --watchAll=false --coverage"
  }
}
```

## 🧩 **Testing Patterns**

### **Component Testing**
```typescript
// Example: Button component test
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';
import { ThemeProvider } from '../../theme';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    {children}
  </ThemeProvider>
);

describe('Button Component', () => {
  it('should render correctly with basic props', () => {
    const { getByText } = render(
      <TestWrapper>
        <Button onPress={jest.fn()}>
          Test Button
        </Button>
      </TestWrapper>
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const mockOnPress = jest.fn();
    
    const { getByText } = render(
      <TestWrapper>
        <Button onPress={mockOnPress}>
          Click Me
        </Button>
      </TestWrapper>
    );

    const button = getByText('Click Me');
    fireEvent.press(button);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should not call onPress when disabled', () => {
    const mockOnPress = jest.fn();
    
    const { getByText } = render(
      <TestWrapper>
        <Button onPress={mockOnPress} disabled>
          Disabled Button
        </Button>
      </TestWrapper>
    );

    const button = getByText('Disabled Button');
    fireEvent.press(button);

    expect(mockOnPress).not.toHaveBeenCalled();
  });
});
```

### **Hook Testing**
```typescript
// Example: Custom hook test
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from '../useAuth';

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
});
```

### **Screen Testing**
```typescript
// Example: Screen component test with navigation
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SignInScreen from '../sign-in';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
  },
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

describe('SignInScreen', () => {
  it('should render sign in form correctly', () => {
    const { getByText, getByDisplayValue } = render(<SignInScreen />);

    expect(getByText('Welcome Back')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('should show validation errors for empty fields', async () => {
    const { getByText } = render(<SignInScreen />);

    const signInButton = getByText('Sign In');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(getByText('Email is required')).toBeTruthy();
      expect(getByText('Password is required')).toBeTruthy();
    });
  });
});
```

## 🎯 **Testing Strategy**

### **Test Categories**

#### **Unit Tests** 
- Individual component functionality
- Custom hook behavior  
- Utility function logic
- Service layer methods

#### **Integration Tests**
- Component interaction workflows
- Authentication flow end-to-end
- Form submission and validation
- Navigation between screens

#### **Snapshot Tests**
- Component render consistency
- Theme application verification
- Style regression prevention

### **Test Structure**
```
src/
├── components/
│   ├── Button.tsx
│   └── __tests__/
│       └── Button.test.tsx
├── hooks/
│   ├── useAuth.ts
│   └── __tests__/
│       └── useAuth.test.ts
├── services/
│   ├── authService.ts
│   └── __tests__/
│       └── authService.test.ts
└── __tests__/
    ├── setup.ts
    └── global-mocks.ts
```

## 🎭 **Mocking Strategies**

### **Firebase Mocking**
```typescript
// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null); // Mock no user initially
    return jest.fn(); // Mock unsubscribe function
  }),
  signInWithEmailAndPassword: jest.fn(() => 
    Promise.resolve({ user: { uid: '123', email: 'test@example.com' } })
  ),
}));

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
}));
```

### **Navigation Mocking**
```typescript
// Mock Expo Router
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  },
  Link: ({ children, href }: any) => children,
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
}));
```

### **React Native Mocking**
```typescript
// Mock React Native components
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      alert: jest.fn(),
    },
    Linking: {
      openURL: jest.fn(),
    },
  };
});
```

## 📊 **Coverage Reporting**

### **Coverage Reports**
```bash
# Generate coverage report
npm run test:coverage

# Coverage files generated
coverage/
├── lcov-report/
│   └── index.html      # HTML coverage report
├── lcov.info           # LCOV format for CI
└── coverage-final.json # JSON coverage data
```

### **Coverage Analysis**
```bash
# View coverage in browser
open coverage/lcov-report/index.html

# Coverage summary in terminal
npm test -- --coverage --verbose
```

### **Coverage Thresholds**
- **Statements**: 80% minimum
- **Branches**: 80% minimum  
- **Functions**: 80% minimum
- **Lines**: 80% minimum

## 🚀 **CI/CD Integration**

### **GitHub Actions Integration**
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

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
    
    - name: Run tests with coverage
      run: npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

### **Pre-commit Testing**
```bash
# Automatic testing in pre-commit hooks
echo "🧪 Running tests..."
npx jest --passWithNoTests
```

## 🐛 **Debugging Tests**

### **Debug Mode**
```bash
# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Run specific test in debug mode
npm test -- --testNamePattern="should render correctly"
```

### **Test Debugging Tips**
```typescript
// Add debug output in tests
import { screen, debug } from '@testing-library/react-native';

it('should render component', () => {
  render(<MyComponent />);
  
  // Print component tree
  debug();
  
  // Print specific elements
  screen.debug(screen.getByTestId('my-element'));
});
```

## 📋 **Test Writing Guidelines**

### **Best Practices**
- ✅ Write tests before or alongside implementation
- ✅ Use descriptive test names explaining behavior
- ✅ Follow AAA pattern (Arrange, Act, Assert)
- ✅ Mock external dependencies (Firebase, navigation)
- ✅ Test user interactions, not implementation details
- ✅ Maintain 80%+ coverage on all new code

### **Test Naming Convention**
```typescript
// Good test names
describe('Button Component', () => {
  it('should render with correct text when title prop is provided', () => {});
  it('should call onPress handler when button is pressed', () => {});
  it('should be disabled when loading prop is true', () => {});
  it('should show loading indicator when loading prop is true', () => {});
});
```

### **What to Test**
- ✅ Component renders without crashing
- ✅ Props are properly applied
- ✅ User interactions work correctly
- ✅ State changes trigger expected behavior
- ✅ Error states are handled gracefully
- ✅ Accessibility properties are present

### **What NOT to Test**
- ❌ Implementation details (internal state)
- ❌ Third-party library functionality
- ❌ Styling specifics (unless critical to UX)
- ❌ Console logs or debug output

## 📚 **Related Documentation**

- [Code Quality](./Code-Quality.md) - ESLint and TypeScript integration
- [Pre-commit Hooks](./Pre-commit-Hooks.md) - Automated testing in Git workflow  
- [CI/CD Pipeline](./CI-CD-Pipeline.md) - Automated testing in deployment

---

**Maintainer**: Development Team  
**Review**: Test coverage reviewed each sprint  
**Support**: Jest documentation and React Native Testing Library guides