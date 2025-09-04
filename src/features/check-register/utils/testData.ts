/**
 * SmartLedger Check Register - Test Data Generation
 * Utilities for creating realistic test data for development and testing
 */

import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import type {
  CreateAccountInput,
  CreateTransactionInput,
  CreateCategoryInput,
} from '../types';

// Firebase config import with fallback for tests
import { db } from '@/services/firebase/config';

// ============================================================================
// TEST DATA GENERATORS
// ============================================================================

/**
 * Generate realistic test accounts
 */
export const generateTestAccounts = (userId: string): CreateAccountInput[] => [
  {
    name: 'Primary Checking',
    type: 'checking',
    startingBalance: 2500.0,
    currency: 'USD',
    description: 'Main checking account for daily expenses',
    institution: 'Chase Bank',
    accountNumber: '1234',
    color: '#0a7ea4',
    icon: 'account-balance',
    includeInTotals: true,
    sortOrder: 0,
  },
  {
    name: 'Emergency Savings',
    type: 'savings',
    startingBalance: 10000.0,
    currency: 'USD',
    description: 'Emergency fund savings account',
    institution: 'Chase Bank',
    accountNumber: '5678',
    color: '#16a34a',
    icon: 'savings',
    includeInTotals: true,
    sortOrder: 1,
  },
  {
    name: 'Travel Fund',
    type: 'savings',
    startingBalance: 1500.0,
    currency: 'USD',
    description: 'Saving for vacation and travel',
    institution: 'Ally Bank',
    accountNumber: '9012',
    color: '#dc2626',
    icon: 'flight',
    includeInTotals: true,
    sortOrder: 2,
  },
  {
    name: 'Cash Wallet',
    type: 'cash',
    startingBalance: 150.0,
    currency: 'USD',
    description: 'Physical cash on hand',
    color: '#059669',
    icon: 'account-balance-wallet',
    includeInTotals: true,
    sortOrder: 3,
  },
  {
    name: 'Credit Card',
    type: 'credit',
    startingBalance: 0.0,
    currency: 'USD',
    description: 'Rewards credit card',
    institution: 'Capital One',
    accountNumber: '3456',
    color: '#7c3aed',
    icon: 'credit-card',
    includeInTotals: false,
    sortOrder: 4,
  },
];

/**
 * Generate realistic test transactions
 */
export const generateTestTransactions = (
  userId: string,
  accountId: string,
  categoryIds: { [key: string]: string }
): CreateTransactionInput[] => {
  const transactions: CreateTransactionInput[] = [];
  const currentDate = new Date();

  // Generate transactions for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);

    // Random number of transactions per day (0-3)
    const transactionCount = Math.floor(Math.random() * 4);

    for (let j = 0; j < transactionCount; j++) {
      const transaction = generateRandomTransaction(
        date,
        accountId,
        categoryIds
      );
      if (transaction) {
        transactions.push(transaction);
      }
    }
  }

  return transactions.sort((a, b) => a.date.getTime() - b.date.getTime());
};

/**
 * Generate a single random transaction
 */
function generateRandomTransaction(
  date: Date,
  accountId: string,
  categoryIds: { [key: string]: string }
): CreateTransactionInput | null {
  const transactionTypes = ['deposit', 'withdrawal'] as const;
  const type =
    transactionTypes[Math.floor(Math.random() * transactionTypes.length)];

  if (type === 'deposit') {
    return generateDepositTransaction(date, accountId, categoryIds);
  } else {
    return generateWithdrawalTransaction(date, accountId, categoryIds);
  }
}

/**
 * Generate a deposit transaction
 */
function generateDepositTransaction(
  date: Date,
  accountId: string,
  categoryIds: { [key: string]: string }
): CreateTransactionInput {
  const deposits = [
    { description: 'Salary Deposit', amount: 3200.0, category: 'Salary' },
    {
      description: 'Freelance Payment',
      amount: 750.0,
      category: 'Freelance Income',
    },
    {
      description: 'Dividend Payment',
      amount: 125.5,
      category: 'Investment Income',
    },
    { description: 'Tax Refund', amount: 890.0, category: 'Other Income' },
    {
      description: 'Side Gig Payment',
      amount: 200.0,
      category: 'Freelance Income',
    },
    {
      description: 'Interest Payment',
      amount: 45.25,
      category: 'Investment Income',
    },
  ];

  const deposit = deposits[Math.floor(Math.random() * deposits.length)];

  return {
    accountId,
    type: 'deposit',
    amount: deposit.amount,
    description: deposit.description,
    categoryId: categoryIds[deposit.category] || categoryIds['Other Income'],
    date,
    status: Math.random() > 0.3 ? 'cleared' : 'pending',
    referenceNumber: `DEP${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
  };
}

/**
 * Generate a withdrawal transaction
 */
function generateWithdrawalTransaction(
  date: Date,
  accountId: string,
  categoryIds: { [key: string]: string }
): CreateTransactionInput {
  const withdrawals = [
    { description: 'Whole Foods', amount: 89.45, category: 'Groceries' },
    { description: 'Electric Bill', amount: 145.5, category: 'Utilities' },
    { description: 'Rent Payment', amount: 1200.0, category: 'Rent/Mortgage' },
    { description: 'Gas Station', amount: 45.0, category: 'Transportation' },
    {
      description: 'Netflix Subscription',
      amount: 15.99,
      category: 'Entertainment',
    },
    { description: 'Starbucks', amount: 6.75, category: 'Dining Out' },
    { description: 'Amazon Purchase', amount: 34.99, category: 'Shopping' },
    { description: 'Doctor Visit', amount: 75.0, category: 'Healthcare' },
    { description: 'Uber Ride', amount: 18.5, category: 'Transportation' },
    { description: 'Movie Tickets', amount: 24.0, category: 'Entertainment' },
    { description: 'Grocery Outlet', amount: 67.23, category: 'Groceries' },
    { description: 'Car Insurance', amount: 125.0, category: 'Insurance' },
    { description: 'Target', amount: 45.67, category: 'Shopping' },
    { description: 'Restaurant Dinner', amount: 78.9, category: 'Dining Out' },
  ];

  const withdrawal =
    withdrawals[Math.floor(Math.random() * withdrawals.length)];

  return {
    accountId,
    type: 'withdrawal',
    amount: withdrawal.amount,
    description: withdrawal.description,
    categoryId:
      categoryIds[withdrawal.category] || categoryIds['Other Expenses'],
    date,
    status: Math.random() > 0.2 ? 'cleared' : 'pending',
    referenceNumber: `WTH${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
  };
}

/**
 * Generate realistic test categories
 */
export const generateTestCategories = (
  userId: string
): CreateCategoryInput[] => [
  // Income categories
  {
    name: 'Salary',
    type: 'income',
    color: '#4CAF50',
    icon: 'work',
    description: 'Regular salary and wages',
    keywords: ['salary', 'wage', 'payroll', 'income'],
    sortOrder: 0,
  },
  {
    name: 'Freelance Income',
    type: 'income',
    color: '#8BC34A',
    icon: 'laptop',
    description: 'Freelance and contract work',
    keywords: ['freelance', 'contract', 'consulting', 'gig'],
    sortOrder: 1,
  },
  {
    name: 'Investment Income',
    type: 'income',
    color: '#CDDC39',
    icon: 'trending-up',
    description: 'Dividends, interest, and investment returns',
    keywords: ['dividend', 'interest', 'investment', 'return'],
    sortOrder: 2,
  },
  {
    name: 'Other Income',
    type: 'income',
    color: '#9CCC65',
    icon: 'attach-money',
    description: 'Miscellaneous income sources',
    keywords: ['bonus', 'gift', 'refund', 'other'],
    sortOrder: 3,
  },

  // Expense categories
  {
    name: 'Groceries',
    type: 'expense',
    color: '#FF5722',
    icon: 'shopping-cart',
    description: 'Food and household items',
    budgetAmount: 400.0,
    keywords: ['grocery', 'food', 'supermarket', 'household'],
    sortOrder: 10,
  },
  {
    name: 'Utilities',
    type: 'expense',
    color: '#FF9800',
    icon: 'flash-on',
    description: 'Electric, gas, water, internet',
    budgetAmount: 200.0,
    keywords: ['electric', 'gas', 'water', 'internet', 'utility'],
    sortOrder: 11,
  },
  {
    name: 'Rent/Mortgage',
    type: 'expense',
    color: '#F44336',
    icon: 'home',
    description: 'Housing payments',
    budgetAmount: 1200.0,
    keywords: ['rent', 'mortgage', 'housing', 'apartment'],
    sortOrder: 12,
  },
  {
    name: 'Transportation',
    type: 'expense',
    color: '#9C27B0',
    icon: 'directions-car',
    description: 'Gas, parking, public transit',
    budgetAmount: 300.0,
    keywords: ['gas', 'parking', 'transit', 'uber', 'car'],
    sortOrder: 13,
  },
  {
    name: 'Healthcare',
    type: 'expense',
    color: '#E91E63',
    icon: 'local-hospital',
    description: 'Medical expenses and insurance',
    budgetAmount: 150.0,
    keywords: ['medical', 'doctor', 'pharmacy', 'health'],
    sortOrder: 14,
  },
  {
    name: 'Entertainment',
    type: 'expense',
    color: '#673AB7',
    icon: 'movie',
    description: 'Movies, streaming, hobbies',
    budgetAmount: 100.0,
    keywords: ['movie', 'streaming', 'hobby', 'fun', 'entertainment'],
    sortOrder: 15,
  },
  {
    name: 'Dining Out',
    type: 'expense',
    color: '#3F51B5',
    icon: 'restaurant',
    description: 'Restaurants and takeout',
    budgetAmount: 250.0,
    keywords: ['restaurant', 'takeout', 'dining', 'food'],
    sortOrder: 16,
  },
  {
    name: 'Shopping',
    type: 'expense',
    color: '#2196F3',
    icon: 'shopping-bag',
    description: 'Clothing, electronics, misc purchases',
    budgetAmount: 200.0,
    keywords: ['shopping', 'clothing', 'electronics', 'amazon'],
    sortOrder: 17,
  },
  {
    name: 'Insurance',
    type: 'expense',
    color: '#03DAC6',
    icon: 'security',
    description: 'Auto, health, life insurance',
    budgetAmount: 300.0,
    keywords: ['insurance', 'auto', 'health', 'life'],
    sortOrder: 18,
  },
  {
    name: 'Other Expenses',
    type: 'expense',
    color: '#607D8B',
    icon: 'receipt',
    description: 'Miscellaneous expenses',
    budgetAmount: 100.0,
    keywords: ['misc', 'other', 'miscellaneous'],
    sortOrder: 19,
  },

  // Transfer category
  {
    name: 'Account Transfer',
    type: 'transfer',
    color: '#009688',
    icon: 'swap-horiz',
    description: 'Transfers between accounts',
    keywords: ['transfer', 'move', 'between'],
    sortOrder: 20,
  },
];

// ============================================================================
// DATABASE POPULATION FUNCTIONS
// ============================================================================

/**
 * Create test data for a user account
 */
export async function createTestDataForUser(
  userId: string,
  options: {
    includeAccounts?: boolean;
    includeCategories?: boolean;
    includeTransactions?: boolean;
    transactionCount?: number;
  } = {}
): Promise<{
  success: boolean;
  accountsCreated?: number;
  categoriesCreated?: number;
  transactionsCreated?: number;
  errors?: string[];
}> {
  const {
    includeAccounts = true,
    includeCategories = true,
    includeTransactions = true,
    transactionCount = 50,
  } = options;

  const result = {
    success: false,
    accountsCreated: 0,
    categoriesCreated: 0,
    transactionsCreated: 0,
    errors: [] as string[],
  };

  try {
    const categoryIds: { [key: string]: string } = {};
    let primaryAccountId = '';

    // Create categories first
    if (includeCategories) {
      const categories = generateTestCategories(userId);

      for (const categoryData of categories) {
        const categoryDoc = {
          ...categoryData,
          userId,
          isDefault: true,
          isSystem: false,
          status: 'active' as const,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        const categoryRef = doc(collection(db, 'categories'));
        await setDoc(categoryRef, categoryDoc);
        categoryIds[categoryData.name] = categoryRef.id;
        result.categoriesCreated++;
      }
    }

    // Create accounts
    if (includeAccounts) {
      const accounts = generateTestAccounts(userId);

      for (const accountData of accounts) {
        const accountDoc = {
          ...accountData,
          currentBalance: accountData.startingBalance,
          status: 'active' as const,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        const accountRef = doc(collection(db, 'accounts'));
        await setDoc(accountRef, accountDoc);

        if (result.accountsCreated === 0) {
          primaryAccountId = accountRef.id;
        }
        result.accountsCreated++;
      }
    }

    // Create transactions
    if (
      includeTransactions &&
      primaryAccountId &&
      Object.keys(categoryIds).length > 0
    ) {
      const transactions = generateTestTransactions(
        userId,
        primaryAccountId,
        categoryIds
      );
      const limitedTransactions = transactions.slice(0, transactionCount);

      let runningBalance = 2500.0; // Starting balance from primary account

      for (const transactionData of limitedTransactions) {
        // Calculate running balance
        if (transactionData.type === 'deposit') {
          runningBalance += transactionData.amount;
        } else {
          runningBalance -= transactionData.amount;
        }

        const transactionDoc = {
          ...transactionData,
          balance: runningBalance,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        const transactionRef = doc(collection(db, 'transactions'));
        await setDoc(transactionRef, transactionDoc);
        result.transactionsCreated++;
      }
    }

    result.success = true;
  } catch (error) {
    result.success = false;
    result.errors.push(
      `Test data creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  return result;
}

/**
 * Clear all test data for a user
 */
export async function clearTestDataForUser(userId: string): Promise<{
  success: boolean;
  accountsDeleted?: number;
  categoriesDeleted?: number;
  transactionsDeleted?: number;
  errors?: string[];
}> {
  const result = {
    success: false,
    accountsDeleted: 0,
    categoriesDeleted: 0,
    transactionsDeleted: 0,
    errors: [] as string[],
  };

  try {
    // Note: In a real app, you'd want to use Firebase Admin SDK for bulk deletes
    // This is a simplified version for development/testing

    console.warn(
      'clearTestDataForUser: This function should use Firebase Admin SDK for production'
    );

    result.success = true;
    result.errors.push(
      'Clear function not implemented - use Firebase console for manual cleanup'
    );
  } catch (error) {
    result.success = false;
    result.errors.push(
      `Test data cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  return result;
}

// ============================================================================
// DEVELOPMENT UTILITIES
// ============================================================================

/**
 * Generate sample data for component development
 */
export const SAMPLE_ACCOUNT = {
  id: 'sample-account-1',
  name: 'Sample Checking',
  type: 'checking' as const,
  startingBalance: 1000.0,
  currentBalance: 1234.56,
  currency: 'USD',
  status: 'active' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: 'sample-user',
  color: '#0a7ea4',
  icon: 'account-balance',
  includeInTotals: true,
  sortOrder: 0,
};

export const SAMPLE_TRANSACTIONS = [
  {
    id: 'sample-txn-1',
    accountId: 'sample-account-1',
    type: 'deposit' as const,
    amount: 2500.0,
    balance: 3500.0,
    description: 'Salary Deposit',
    categoryId: 'sample-category-income',
    date: new Date('2024-01-15'),
    status: 'cleared' as const,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    userId: 'sample-user',
  },
  {
    id: 'sample-txn-2',
    accountId: 'sample-account-1',
    type: 'withdrawal' as const,
    amount: 89.45,
    balance: 3410.55,
    description: 'Whole Foods',
    categoryId: 'sample-category-groceries',
    date: new Date('2024-01-14'),
    status: 'cleared' as const,
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
    userId: 'sample-user',
  },
];

export const SAMPLE_CATEGORIES = generateTestCategories('sample-user').map(
  (cat, index) => ({
    id: `sample-category-${index}`,
    ...cat,
    userId: 'sample-user',
    isDefault: true,
    isSystem: false,
    status: 'active' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
);
