# Code Quality Standards Guide

**System**: ESLint, Prettier, TypeScript Configuration  
**Status**: ✅ Production Ready  
**Last Updated**: 2025-08-12

## 🎯 **Overview**

SmartLedger enforces strict code quality standards through TypeScript, ESLint, and Prettier to maintain consistent, bug-free, and maintainable code.

## 🛠️ **Technology Stack**

### **Quality Tools**
- **TypeScript**: Static type checking with strict mode
- **ESLint**: Code quality and style enforcement
- **Prettier**: Automatic code formatting
- **expo-doctor**: Expo-specific diagnostics

## ⚙️ **TypeScript Configuration**

### **tsconfig.json**
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "esnext",
    "jsx": "react-native",
    
    // Strict Type Checking
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    
    // Additional Checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    
    // Module Resolution
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    
    // Path Mapping
    "baseUrl": ".",
    "paths": {
      "@/*": ["*"],
      "@/components/*": ["src/components/*"],
      "@/design-system": ["src/design-system/index.ts"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    "**/*.js",
    "**/*.jsx"
  ],
  "exclude": [
    "node_modules",
    "babel.config.js",
    "metro.config.js",
    "jest.config.js"
  ]
}
```

### **TypeScript Best Practices**
```typescript
// ✅ GOOD: Explicit types and interfaces
interface UserData {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

function processUser(user: UserData): void {
  // Type-safe operations
}

// ❌ BAD: Using 'any' type
function processData(data: any) {
  // Loses type safety
}

// ✅ GOOD: Strict null checks
function getUser(id: string): UserData | null {
  const user = findUserById(id);
  return user ?? null;
}

// ✅ GOOD: Type guards
function isUserData(data: unknown): data is UserData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'email' in data
  );
}
```

## 🔍 **ESLint Configuration**

### **.eslintrc.js**
```javascript
module.exports = {
  root: true,
  extends: [
    'expo',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'react-native',
    'import'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    },
    project: './tsconfig.json'
  },
  env: {
    es6: true,
    node: true,
    'react-native/react-native': true
  },
  rules: {
    // TypeScript Rules
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    
    // React Rules
    'react/prop-types': 'off', // Using TypeScript for props
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // React Native Rules
    'react-native/no-unused-styles': 'error',
    'react-native/split-platform-components': 'warn',
    'react-native/no-inline-styles': 'warn',
    
    // Import Rules
    'import/order': ['error', {
      'groups': [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index'
      ],
      'newlines-between': 'always',
      'alphabetize': {
        'order': 'asc',
        'caseInsensitive': true
      }
    }],
    'import/no-duplicates': 'error',
    
    // General Rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
```

### **ESLint Commands**
```bash
# Run ESLint
npx eslint . --ext .ts,.tsx

# Run with auto-fix
npx eslint . --ext .ts,.tsx --fix

# Run with max warnings (CI/CD)
npx eslint . --ext .ts,.tsx --max-warnings 0

# Check specific file
npx eslint src/components/Button.tsx
```

## 🎨 **Prettier Configuration**

### **.prettierrc**
```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "jsxBracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### **.prettierignore**
```
node_modules/
.expo/
dist/
build/
coverage/
*.min.js
*.bundle.js
android/
ios/
```

### **Prettier Commands**
```bash
# Format all files
npx prettier --write .

# Check formatting
npx prettier --check .

# Format specific file types
npx prettier --write "**/*.{ts,tsx,js,jsx,json,md}"
```

## 🔗 **Integration**

### **VS Code Settings**
```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### **Recommended VS Code Extensions**
```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "styled-components.vscode-styled-components",
    "dsznajder.es7-react-js-snippets"
  ]
}
```

## 📊 **Code Quality Metrics**

### **Quality Thresholds**
- **TypeScript**: 0 errors allowed
- **ESLint**: 0 errors, 0 warnings in CI
- **Test Coverage**: 80% minimum
- **Bundle Size**: Monitor for regressions
- **Cyclomatic Complexity**: Max 10 per function

### **Monitoring Scripts**
```json
// package.json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "quality": "npm run type-check && npm run lint && npm run format:check",
    "quality:fix": "npm run lint:fix && npm run format"
  }
}
```

## 🚨 **Common Issues & Solutions**

### **TypeScript Errors**

#### **Cannot find module**
```typescript
// Problem
import { Button } from '@/components/Button';
// Error: Cannot find module '@/components/Button'

// Solution: Check tsconfig.json paths
"paths": {
  "@/components/*": ["src/components/*"]
}
```

#### **Type inference issues**
```typescript
// Problem
const data = fetchData(); // Type 'any'

// Solution: Explicit typing
const data: UserData[] = await fetchData();
```

### **ESLint Issues**

#### **Unused variables**
```typescript
// Problem
const unused = 'value'; // ESLint: 'unused' is assigned but never used

// Solution: Remove or use underscore
const _intentionallyUnused = 'value';
```

#### **Import order**
```typescript
// Problem (wrong order)
import { Button } from './Button';
import React from 'react';

// Solution (correct order)
import React from 'react';

import { Button } from './Button';
```

### **Prettier Conflicts**
```bash
# If ESLint and Prettier conflict
npm install --save-dev eslint-config-prettier
# Add 'prettier' to extends in .eslintrc.js (last)
```

## 🎯 **Best Practices**

### **Type Safety**
1. ✅ Always define interfaces for component props
2. ✅ Use strict TypeScript configuration
3. ✅ Avoid 'any' type - use 'unknown' if needed
4. ✅ Define return types for complex functions
5. ✅ Use type guards for runtime validation

### **Code Organization**
1. ✅ One component per file
2. ✅ Group related files in folders
3. ✅ Consistent file naming (PascalCase for components)
4. ✅ Keep files under 300 lines
5. ✅ Extract complex logic to hooks/utils

### **Import Management**
1. ✅ Use absolute imports with @ alias
2. ✅ Group imports by type
3. ✅ Remove unused imports
4. ✅ Avoid circular dependencies
5. ✅ Use barrel exports sparingly

## 🔄 **CI/CD Integration**

### **GitHub Actions Quality Check**
```yaml
name: Code Quality

on: [push, pull_request]

jobs:
  quality:
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
    
    - name: TypeScript check
      run: npm run type-check
    
    - name: ESLint check
      run: npm run lint
    
    - name: Prettier check
      run: npm run format:check
```

## 📈 **Quality Reporting**

### **Generate Reports**
```bash
# ESLint report
npx eslint . --ext .ts,.tsx --format json > eslint-report.json

# TypeScript report
npx tsc --noEmit --pretty false > typescript-report.txt

# Combined quality report
npm run quality -- --json > quality-report.json
```

### **Quality Dashboard**
- Track ESLint violations over time
- Monitor TypeScript strict mode compliance
- Measure code formatting consistency
- Review complexity metrics

## 📚 **Related Documentation**

- [Pre-commit Hooks](./Pre-commit-Hooks.md) - Automated quality enforcement
- [Testing Framework](./Testing-Framework.md) - Test quality standards
- [CI/CD Pipeline](./CI-CD-Pipeline.md) - Automated quality checks

---

**Maintainer**: Development Team  
**Review**: Code quality standards reviewed each sprint  
**Support**: Team leads for quality standard exceptions