// Test setup file for React Native Testing Library
// Global test configuration

// Extend Jest matchers (built into @testing-library/react-native v12.4+)
// No additional imports needed for basic Jest matchers

// Global test environment setup (React Native already declares __DEV__)
if (typeof __DEV__ === 'undefined') {
  (global as any).__DEV__ = true;
}

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
};

// Mock timers for consistent testing
jest.useFakeTimers();