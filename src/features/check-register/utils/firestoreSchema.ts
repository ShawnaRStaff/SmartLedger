/**
 * SmartLedger Check Register - Firestore Schema Design
 * Collection structure, indexes, and query patterns
 */

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// COLLECTION STRUCTURE
// ============================================================================

/**
 * Firestore collection paths for check register
 */
export const COLLECTIONS = {
  ACCOUNTS: 'accounts',
  TRANSACTIONS: 'transactions', 
  CATEGORIES: 'categories',
  USER_SETTINGS: 'userSettings',
} as const;

/**
 * Firestore document structure for accounts
 * Collection: /accounts/{accountId}
 */
export interface AccountDocument {
  // Core fields
  name: string;
  type: 'checking' | 'savings' | 'cash' | 'credit' | 'investment' | 'other';
  startingBalance: number;
  currentBalance: number;
  currency: string;
  status: 'active' | 'inactive' | 'closed';
  
  // Optional fields
  description?: string;
  institution?: string;
  accountNumber?: string;
  sortOrder: number;
  includeInTotals: boolean;
  color: string;
  icon: string;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
  
  // Computed fields (updated by cloud functions)
  transactionCount?: number;
  lastTransactionDate?: Timestamp;
}

/**
 * Firestore document structure for transactions
 * Collection: /transactions/{transactionId}
 */
export interface TransactionDocument {
  // Core fields
  accountId: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  description: string;
  categoryId: string;
  date: Timestamp;
  status: 'pending' | 'cleared' | 'reconciled';
  balance: number;
  
  // Transfer fields
  transferAccountId?: string;
  transferTransactionId?: string;
  
  // Optional fields
  referenceNumber?: string;
  memo?: string;
  tags?: string[];
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
  
  // Computed fields for queries
  month: string; // YYYY-MM format for monthly queries
  year: number;
  dayOfYear: number; // For efficient date range queries
}

/**
 * Firestore document structure for categories
 * Collection: /categories/{categoryId}
 */
export interface CategoryDocument {
  // Core fields
  name: string;
  type: 'income' | 'expense' | 'transfer';
  description?: string;
  color: string;
  icon: string;
  isDefault: boolean;
  isSystem: boolean;
  
  // Hierarchy
  parentCategoryId?: string;
  status: 'active' | 'inactive' | 'archived';
  sortOrder: number;
  
  // Budget
  budgetAmount?: number;
  keywords?: string[];
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string | null; // null for system categories
  
  // Usage statistics (updated by cloud functions)
  transactionCount?: number;
  totalAmount?: number;
  lastUsedDate?: Timestamp;
}

// ============================================================================
// FIRESTORE INDEXES
// ============================================================================

/**
 * Required Firestore indexes for optimal query performance
 */
export const REQUIRED_INDEXES = [
  // Accounts
  {
    collection: 'accounts',
    fields: [
      { field: 'userId', direction: 'asc' },
      { field: 'status', direction: 'asc' },
      { field: 'sortOrder', direction: 'asc' }
    ]
  },
  {
    collection: 'accounts',
    fields: [
      { field: 'userId', direction: 'asc' },
      { field: 'type', direction: 'asc' },
      { field: 'name', direction: 'asc' }
    ]
  },
  
  // Transactions - Primary queries
  {
    collection: 'transactions',
    fields: [
      { field: 'userId', direction: 'asc' },
      { field: 'accountId', direction: 'asc' },
      { field: 'date', direction: 'desc' }
    ]
  },
  {
    collection: 'transactions',
    fields: [
      { field: 'userId', direction: 'asc' },
      { field: 'date', direction: 'desc' }
    ]
  },
  
  // Transactions - Category queries
  {
    collection: 'transactions',
    fields: [
      { field: 'userId', direction: 'asc' },
      { field: 'categoryId', direction: 'asc' },
      { field: 'date', direction: 'desc' }
    ]
  },
  
  // Transactions - Monthly/yearly queries
  {
    collection: 'transactions',
    fields: [
      { field: 'userId', direction: 'asc' },
      { field: 'month', direction: 'asc' },
      { field: 'date', direction: 'desc' }
    ]
  },
  {
    collection: 'transactions',
    fields: [
      { field: 'userId', direction: 'asc' },
      { field: 'year', direction: 'asc' },
      { field: 'date', direction: 'desc' }
    ]
  },
  
  // Transactions - Status and type queries
  {
    collection: 'transactions',
    fields: [
      { field: 'userId', direction: 'asc' },
      { field: 'status', direction: 'asc' },
      { field: 'date', direction: 'desc' }
    ]
  },
  {
    collection: 'transactions',
    fields: [
      { field: 'userId', direction: 'asc' },
      { field: 'type', direction: 'asc' },
      { field: 'date', direction: 'desc' }
    ]
  },
  
  // Categories
  {
    collection: 'categories',
    fields: [
      { field: 'userId', direction: 'asc' },
      { field: 'type', direction: 'asc' },
      { field: 'sortOrder', direction: 'asc' }
    ]
  },
  {
    collection: 'categories',
    fields: [
      { field: 'userId', direction: 'asc' },
      { field: 'status', direction: 'asc' },
      { field: 'name', direction: 'asc' }
    ]
  }
] as const;

// ============================================================================
// QUERY PATTERNS
// ============================================================================

/**
 * Common Firestore query patterns for check register
 */
export const QUERY_PATTERNS = {
  // Account queries
  USER_ACCOUNTS: (userId: string) => ({
    collection: 'accounts',
    where: [['userId', '==', userId]],
    orderBy: [['sortOrder', 'asc']]
  }),
  
  ACTIVE_ACCOUNTS: (userId: string) => ({
    collection: 'accounts', 
    where: [
      ['userId', '==', userId],
      ['status', '==', 'active']
    ],
    orderBy: [['sortOrder', 'asc']]
  }),
  
  // Transaction queries
  ACCOUNT_TRANSACTIONS: (userId: string, accountId: string, limit = 50) => ({
    collection: 'transactions',
    where: [
      ['userId', '==', userId],
      ['accountId', '==', accountId]
    ],
    orderBy: [['date', 'desc']],
    limit
  }),
  
  USER_TRANSACTIONS: (userId: string, limit = 50) => ({
    collection: 'transactions',
    where: [['userId', '==', userId]],
    orderBy: [['date', 'desc']],
    limit
  }),
  
  MONTHLY_TRANSACTIONS: (userId: string, month: string) => ({
    collection: 'transactions',
    where: [
      ['userId', '==', userId],
      ['month', '==', month]
    ],
    orderBy: [['date', 'desc']]
  }),
  
  CATEGORY_TRANSACTIONS: (userId: string, categoryId: string) => ({
    collection: 'transactions',
    where: [
      ['userId', '==', userId],
      ['categoryId', '==', categoryId]
    ],
    orderBy: [['date', 'desc']]
  }),
  
  // Category queries
  USER_CATEGORIES: (userId: string) => ({
    collection: 'categories',
    where: [['userId', '==', userId]],
    orderBy: [['sortOrder', 'asc']]
  }),
  
  SYSTEM_CATEGORIES: () => ({
    collection: 'categories',
    where: [['isSystem', '==', true]],
    orderBy: [['sortOrder', 'asc']]
  }),
  
  CATEGORIES_BY_TYPE: (userId: string, type: string) => ({
    collection: 'categories',
    where: [
      ['userId', '==', userId],
      ['type', '==', type],
      ['status', '==', 'active']
    ],
    orderBy: [['sortOrder', 'asc']]
  })
} as const;

// ============================================================================
// FIELD TRANSFORMATIONS
// ============================================================================

/**
 * Transform client data to Firestore document format
 */
export const toFirestoreDocument = {
  account: (account: any): Partial<AccountDocument> => ({
    ...account,
    createdAt: account.createdAt ? 
      Timestamp.fromDate(account.createdAt) : 
      Timestamp.now(),
    updatedAt: Timestamp.now(),
  }),
  
  transaction: (transaction: any): Partial<TransactionDocument> => {
    const date = new Date(transaction.date);
    return {
      ...transaction,
      date: Timestamp.fromDate(date),
      createdAt: transaction.createdAt ? 
        Timestamp.fromDate(transaction.createdAt) : 
        Timestamp.now(),
      updatedAt: Timestamp.now(),
      // Computed fields for efficient queries
      month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      year: date.getFullYear(),
      dayOfYear: Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000)
    };
  },
  
  category: (category: any): Partial<CategoryDocument> => ({
    ...category,
    createdAt: category.createdAt ? 
      Timestamp.fromDate(category.createdAt) : 
      Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
};

/**
 * Transform Firestore document to client format
 */
export const fromFirestoreDocument = {
  account: (doc: any): any => ({
    ...doc,
    createdAt: doc.createdAt?.toDate(),
    updatedAt: doc.updatedAt?.toDate(),
    lastTransactionDate: doc.lastTransactionDate?.toDate(),
  }),
  
  transaction: (doc: any): any => ({
    ...doc,
    date: doc.date?.toDate(),
    createdAt: doc.createdAt?.toDate(),
    updatedAt: doc.updatedAt?.toDate(),
    // Remove computed fields from client object
    month: undefined,
    year: undefined,
    dayOfYear: undefined,
  }),
  
  category: (doc: any): any => ({
    ...doc,
    createdAt: doc.createdAt?.toDate(),
    updatedAt: doc.updatedAt?.toDate(),
    lastUsedDate: doc.lastUsedDate?.toDate(),
  })
};

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Firestore field validation
 */
export const validateFirestoreFields = {
  userId: (userId: string): boolean => {
    return typeof userId === 'string' && userId.length > 0;
  },
  
  amount: (amount: number): boolean => {
    return typeof amount === 'number' && amount >= 0 && Number.isFinite(amount);
  },
  
  date: (date: any): boolean => {
    return date instanceof Date || date instanceof Timestamp;
  },
  
  accountId: (accountId: string): boolean => {
    return typeof accountId === 'string' && accountId.length > 0;
  },
  
  categoryId: (categoryId: string): boolean => {
    return typeof categoryId === 'string' && categoryId.length > 0;
  }
};