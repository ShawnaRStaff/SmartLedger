# Pre-commit Hooks Guide

**System**: Husky + lint-staged Quality Gates  
**Status**: ✅ Production Ready  
**Last Updated**: 2025-08-11

## 🛡️ **Overview**

SmartLedger enforces code quality through automated pre-commit hooks that run TypeScript validation, linting, testing, and formatting before every commit.

## 🔧 **Technology Stack**

### **Core Tools**
- **Husky**: Git hooks management
- **lint-staged**: Run linters on staged files only
- **TypeScript**: Type checking validation
- **ESLint**: Code quality and style enforcement  
- **Prettier**: Code formatting
- **Jest**: Automated testing

### **Quality Gates Enforced**
1. ✅ TypeScript validation (0 errors)
2. ✅ ESLint validation (0 warnings/errors)
3. ✅ Jest test suite (all tests must pass)
4. ✅ Prettier formatting (automatic fix)

## ⚙️ **Configuration**

### **Husky Setup**
```json
// package.json
{
  "scripts": {
    "prepare": "husky"
  },
  "devDependencies": {
    "husky": "^9.1.7",
    "lint-staged": "^16.1.5"
  }
}
```

### **Pre-commit Hook (.husky/pre-commit)**
```bash
# Run type checking
echo "🔍 Running TypeScript validation..."
npx tsc --noEmit

# Run linting
echo "🧹 Running ESLint..."
npx eslint . --ext .ts,.tsx --max-warnings 0

# Run tests
echo "🧪 Running tests..."
npx jest --passWithNoTests

# Run lint-staged for staged files
echo "🎨 Running lint-staged..."
npx lint-staged
```

### **lint-staged Configuration**
```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "npx eslint --fix",
      "npx prettier --write"
    ],
    "*.{js,jsx,json,md}": [
      "npx prettier --write"
    ]
  }
}
```

## 🚀 **Installation & Setup**

### **Initial Setup**
```bash
# Install dependencies
npm install --save-dev husky lint-staged

# Initialize Husky
npx husky init

# Make pre-commit hook executable
chmod +x .husky/pre-commit
```

### **Creating Hooks**
```bash
# Add pre-commit hook
echo 'npm test' > .husky/pre-commit

# Add pre-push hook (optional)
echo 'npm run type-check' > .husky/pre-push

# Add commit-msg hook (optional)
echo 'npx commitlint --edit $1' > .husky/commit-msg
```

## 🔍 **Quality Gates Breakdown**

### **1. TypeScript Validation**
```bash
# Command executed
npx tsc --noEmit

# What it checks
- Type safety violations
- Interface mismatches  
- Missing type annotations
- Import/export errors

# Success criteria
- Zero TypeScript errors
- All types properly defined
- No 'any' types in production code
```

### **2. ESLint Validation**
```bash
# Command executed
npx eslint . --ext .ts,.tsx --max-warnings 0

# What it checks
- Code style violations
- Potential bugs and issues
- React hooks rules
- Import/export order
- Unused variables/imports

# Success criteria
- Zero ESLint errors
- Zero ESLint warnings  
- All rules passed
```

### **3. Test Suite Execution**
```bash
# Command executed
npx jest --passWithNoTests

# What it checks
- All existing tests pass
- No broken functionality
- Test coverage maintained
- Mock configurations valid

# Success criteria
- 100% test pass rate
- No test failures
- Coverage thresholds met
```

### **4. Code Formatting**
```bash
# Commands executed (via lint-staged)
npx eslint --fix
npx prettier --write

# What it does
- Automatically fixes ESLint issues
- Formats code according to Prettier rules
- Ensures consistent code style
- Sorts imports/exports

# Success criteria
- All auto-fixable issues resolved
- Code formatted consistently
- No manual formatting needed
```

## 📋 **Hook Execution Flow**

### **Pre-commit Process**
```
1. Developer runs: git commit
2. Husky intercepts commit
3. Runs TypeScript validation → ❌ FAIL = commit blocked
4. Runs ESLint validation → ❌ FAIL = commit blocked  
5. Runs test suite → ❌ FAIL = commit blocked
6. Runs lint-staged on staged files
   - Auto-fixes ESLint issues
   - Formats with Prettier
   - Re-stages fixed files
7. ✅ SUCCESS = commit proceeds
```

### **Error Handling**
```bash
# If any step fails:
echo "❌ Pre-commit checks failed!"
echo "Fix the issues above before committing."
exit 1

# Commit is blocked until all issues resolved
```

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **TypeScript Errors**
```bash
# Error example
src/components/Button.tsx(15,3): error TS2322: Type 'string' is not assignable to type 'number'

# Resolution
1. Fix the type error in the code
2. Ensure all props have proper interfaces
3. Run `npx tsc --noEmit` manually to verify
```

#### **ESLint Violations**
```bash
# Error example
src/utils/helpers.ts:10:7: error 'unusedVariable' is assigned a value but never used

# Resolution
1. Remove unused variables
2. Fix import/export issues
3. Run `npx eslint . --fix` to auto-fix
```

#### **Test Failures**
```bash
# Error example
FAIL src/__tests__/Button.test.tsx
● Button › should render correctly
  expect(received).toBeTruthy()

# Resolution  
1. Fix failing tests
2. Update test expectations if needed
3. Run `npm test` to verify locally
```

#### **Husky Not Working**
```bash
# If hooks aren't running
npx husky install
chmod +x .husky/pre-commit

# Verify hook exists
ls -la .husky/pre-commit
```

### **Bypass Options (Emergency Only)**
```bash
# Skip pre-commit hooks (NOT RECOMMENDED)
git commit --no-verify -m "Emergency commit"

# Skip specific checks (NOT RECOMMENDED)
SKIP_PRETTIER=true git commit -m "Skip prettier"
```

## 📊 **Performance Optimization**

### **Speed Improvements**
```json
// Only run lint-staged on staged files
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",           // Only staged TS files
      "prettier --write"        // Only staged TS files  
    ]
  }
}
```

### **Parallel Execution**
```bash
# Run checks in parallel where possible
npx concurrently \
  "npx tsc --noEmit" \
  "npx jest --passWithNoTests"
```

### **Incremental Checks**
```bash
# Only check changed files for some operations
npx eslint $(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$')
```

## 🔄 **CI/CD Integration**

### **GitHub Actions Workflow**
```yaml
# .github/workflows/quality-check.yml
name: Code Quality Check

on: 
  pull_request:
    branches: [main, develop]

jobs:
  quality-check:
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
    
    - name: Run TypeScript check
      run: npx tsc --noEmit
    
    - name: Run ESLint
      run: npx eslint . --ext .ts,.tsx --max-warnings 0
    
    - name: Run tests
      run: npm test -- --watchAll=false
```

### **Quality Status Checks**
- Pull requests blocked until all checks pass
- Status badges showing quality metrics
- Automatic deployment only after quality gates pass

## 📈 **Metrics & Monitoring**

### **Quality Metrics Tracked**
- ✅ Commit success rate (should be >95%)
- ✅ Average commit validation time
- ✅ Most common quality gate failures
- ✅ Developer feedback on hook effectiveness

### **Reporting**
```bash
# Generate quality report
npx eslint . --ext .ts,.tsx --format json > quality-report.json

# Test coverage report
npm run test:coverage

# TypeScript strict mode compliance
npx tsc --noEmit --strict
```

## 🎯 **Best Practices**

### **Developer Workflow**
1. ✅ Run checks locally before committing
2. ✅ Fix issues incrementally, not in large batches
3. ✅ Use IDE plugins for real-time feedback
4. ✅ Commit frequently with small, focused changes

### **Team Guidelines**
- 🚫 Never bypass hooks without team approval
- ✅ Update hook configuration as project evolves
- ✅ Share knowledge of common fixes
- ✅ Monitor hook performance and adjust timeouts

### **Hook Maintenance**
```bash
# Regular maintenance tasks
npm update husky lint-staged    # Update dependencies
npx husky install              # Reinstall hooks after npm install  
chmod +x .husky/*              # Ensure hooks are executable
```

## 🔧 **Advanced Configuration**

### **Conditional Hooks**
```bash
# Skip hooks for certain commit types
if [[ $1 == *"WIP"* ]]; then
  echo "Skipping checks for WIP commit"
  exit 0
fi
```

### **Custom Quality Gates**
```bash
# Add custom checks
echo "📦 Checking bundle size..."
npm run build:analyze

echo "🔐 Security audit..."
npm audit --audit-level moderate
```

### **Environment-Specific Hooks**
```bash
# Different rules for different branches
if [[ $(git branch --show-current) == "main" ]]; then
  # Stricter checks for main branch
  npm run test:coverage -- --coverageThreshold='{"global":{"statements":90}}'
fi
```

## 📚 **Related Documentation**

- [Code Quality](./Code-Quality.md) - ESLint and Prettier configuration
- [Testing Framework](./Testing-Framework.md) - Jest test requirements
- [CI/CD Pipeline](./CI-CD-Pipeline.md) - Automated quality checks

---

**Maintainer**: DevOps Team  
**Review**: Hook configuration reviewed each sprint  
**Support**: Team leads for hook bypass approval and troubleshooting