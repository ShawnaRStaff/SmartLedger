/**
 * SmartLedger Check Register - Data Structure Tests
 * Tests for data validation and structure without Firebase dependencies
 */

import { 
  validateSchema, 
  CreateAccountSchema, 
  CreateCategorySchema 
} from '../utils/validation';

// Test data constants (avoiding Firebase imports)
const DEFAULT_CATEGORIES = [
  {
    name: 'Salary',
    type: 'income' as const,
    color: '#4CAF50',
    icon: 'work',
    isDefault: true,
    isSystem: false,
    sortOrder: 0
  },
  {
    name: 'Groceries',
    type: 'expense' as const,
    color: '#FF5722',
    icon: 'shopping-cart',
    isDefault: true,
    isSystem: false,
    sortOrder: 10
  },
  {
    name: 'Account Transfer',
    type: 'transfer' as const,
    color: '#009688',
    icon: 'swap-horiz',
    isDefault: true,
    isSystem: false,
    sortOrder: 20
  }
];

const DEFAULT_STARTER_ACCOUNT = {
  name: 'My Checking Account',
  type: 'checking' as const,
  startingBalance: 0,
  currency: 'USD',
  description: 'Your primary checking account',
  color: '#0a7ea4',
  icon: 'account-balance-wallet',
  includeInTotals: true,
  sortOrder: 0
};

describe('Data Structure Validation', () => {
  
  describe('Default Categories', () => {
    
    test('should have valid default categories', () => {
      DEFAULT_CATEGORIES.forEach(category => {
        const categoryWithUser = {
          ...category,
          userId: 'test-user',
          status: 'active' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const result = validateSchema(CreateCategorySchema, categoryWithUser);
        expect(result.success).toBe(true);
      });
    });
    
    test('should have all required category types', () => {
      const types = DEFAULT_CATEGORIES.map(cat => cat.type);
      
      expect(types).toContain('income');
      expect(types).toContain('expense');
      expect(types).toContain('transfer');
    });
    
    test('should have unique category names', () => {
      const names = DEFAULT_CATEGORIES.map(cat => cat.name);
      const uniqueNames = [...new Set(names)];
      
      expect(names.length).toBe(uniqueNames.length);
    });
    
    test('should have proper sort order', () => {
      const sortOrders = DEFAULT_CATEGORIES.map(cat => cat.sortOrder);
      const sortedOrders = [...sortOrders].sort((a, b) => a - b);
      
      expect(sortOrders).toEqual(sortedOrders);
    });
    
    test('should have valid colors and icons', () => {
      DEFAULT_CATEGORIES.forEach(category => {
        expect(category.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(typeof category.icon).toBe('string');
        expect(category.icon.length).toBeGreaterThan(0);
      });
    });
  });
  
  describe('Default Starter Account', () => {
    
    test('should have valid default starter account', () => {
      const accountWithUser = {
        ...DEFAULT_STARTER_ACCOUNT,
        currentBalance: DEFAULT_STARTER_ACCOUNT.startingBalance,
        status: 'active' as const,
        userId: 'test-user',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = validateSchema(CreateAccountSchema, accountWithUser);
      expect(result.success).toBe(true);
    });
    
    test('should have proper account structure', () => {
      expect(DEFAULT_STARTER_ACCOUNT.name).toBeTruthy();
      expect(['checking', 'savings', 'cash', 'credit', 'investment', 'other'])
        .toContain(DEFAULT_STARTER_ACCOUNT.type);
      expect(DEFAULT_STARTER_ACCOUNT.startingBalance).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_STARTER_ACCOUNT.currency).toBe('USD');
      expect(DEFAULT_STARTER_ACCOUNT.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
  
  describe('Schema Validation Edge Cases', () => {
    
    test('should reject invalid category data', () => {
      const invalidCategory = {
        name: '', // Invalid: empty name
        type: 'income' as const,
        color: '#4CAF50',
        icon: 'work',
        userId: 'test-user',
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = validateSchema(CreateCategorySchema, invalidCategory);
      expect(result.success).toBe(false);
    });
    
    test('should reject invalid account data', () => {
      const invalidAccount = {
        name: 'Valid Name',
        type: 'checking' as const,
        startingBalance: -100, // Invalid: negative balance
        currency: 'USD',
        currentBalance: 0,
        status: 'active' as const,
        userId: 'test-user',
        createdAt: new Date(),
        updatedAt: new Date(),
        color: '#0a7ea4',
        icon: 'account-balance-wallet',
        includeInTotals: true,
        sortOrder: 0
      };
      
      const result = validateSchema(CreateAccountSchema, invalidAccount);
      expect(result.success).toBe(false);
    });
    
    test('should handle extreme values', () => {
      const extremeAccount = {
        name: 'a'.repeat(50), // Max length
        type: 'checking' as const,
        startingBalance: 999999999.99, // Large amount
        currency: 'USD',
        currentBalance: 999999999.99,
        status: 'active' as const,
        userId: 'test-user',
        createdAt: new Date(),
        updatedAt: new Date(),
        color: '#0a7ea4',
        icon: 'account-balance-wallet',
        includeInTotals: true,
        sortOrder: 0
      };
      
      const result = validateSchema(CreateAccountSchema, extremeAccount);
      expect(result.success).toBe(true);
    });
  });
  
  describe('Data Type Completeness', () => {
    
    test('should cover essential expense categories', () => {
      const expenseCategories = DEFAULT_CATEGORIES.filter(cat => cat.type === 'expense');
      expect(expenseCategories.length).toBeGreaterThan(0);
      
      const hasEssentialExpenses = expenseCategories.some(cat => 
        cat.name.toLowerCase().includes('groceries') ||
        cat.name.toLowerCase().includes('food')
      );
      expect(hasEssentialExpenses).toBe(true);
    });
    
    test('should have income categories', () => {
      const incomeCategories = DEFAULT_CATEGORIES.filter(cat => cat.type === 'income');
      expect(incomeCategories.length).toBeGreaterThan(0);
      
      const hasSalaryIncome = incomeCategories.some(cat => 
        cat.name.toLowerCase().includes('salary')
      );
      expect(hasSalaryIncome).toBe(true);
    });
    
    test('should have transfer capability', () => {
      const transferCategories = DEFAULT_CATEGORIES.filter(cat => cat.type === 'transfer');
      expect(transferCategories.length).toBeGreaterThan(0);
    });
  });
  
  describe('Data Consistency', () => {
    
    test('should have consistent sorting', () => {
      const incomeCategories = DEFAULT_CATEGORIES.filter(cat => cat.type === 'income');
      const expenseCategories = DEFAULT_CATEGORIES.filter(cat => cat.type === 'expense');
      
      // Income categories should have lower sort order than expenses
      const maxIncomeSort = Math.max(...incomeCategories.map(cat => cat.sortOrder));
      const minExpenseSort = Math.min(...expenseCategories.map(cat => cat.sortOrder));
      
      expect(maxIncomeSort).toBeLessThan(minExpenseSort);
    });
    
    test('should have no duplicate sort orders within type', () => {
      const types = ['income', 'expense', 'transfer'];
      
      types.forEach(type => {
        const categoriesOfType = DEFAULT_CATEGORIES.filter(cat => cat.type === type);
        const sortOrders = categoriesOfType.map(cat => cat.sortOrder);
        const uniqueSortOrders = [...new Set(sortOrders)];
        
        expect(sortOrders.length).toBe(uniqueSortOrders.length);
      });
    });
  });
  
  describe('Utility Functions', () => {
    
    test('should generate unique account names', () => {
      const generateUniqueAccountName = (existingNames: string[], baseType: string): string => {
        const baseName = baseType.charAt(0).toUpperCase() + baseType.slice(1) + ' Account';
        
        if (!existingNames.includes(baseName)) {
          return baseName;
        }
      
        let counter = 2;
        while (existingNames.includes(`${baseName} ${counter}`)) {
          counter++;
        }
        
        return `${baseName} ${counter}`;
      };
      
      const existingNames = ['Checking Account', 'Checking Account 2'];
      
      const newName1 = generateUniqueAccountName(existingNames, 'checking');
      expect(newName1).toBe('Checking Account 3');
      
      const newName2 = generateUniqueAccountName([], 'savings');
      expect(newName2).toBe('Savings Account');
      
      const newName3 = generateUniqueAccountName(['Savings Account'], 'savings');
      expect(newName3).toBe('Savings Account 2');
    });
  });
  
  describe('Performance', () => {
    
    test('should validate data efficiently', () => {
      const startTime = Date.now();
      
      // Validate all default categories
      DEFAULT_CATEGORIES.forEach(category => {
        const categoryWithUser = {
          ...category,
          userId: 'test-user',
          status: 'active' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        validateSchema(CreateCategorySchema, categoryWithUser);
      });
      
      // Validate starter account
      const accountWithUser = {
        ...DEFAULT_STARTER_ACCOUNT,
        currentBalance: DEFAULT_STARTER_ACCOUNT.startingBalance,
        status: 'active' as const,
        userId: 'test-user',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      validateSchema(CreateAccountSchema, accountWithUser);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete in reasonable time (less than 50ms)
      expect(duration).toBeLessThan(50);
    });
  });
});