/**
 * SmartLedger Check Register - Data Migration Utilities
 * Handles data structure migrations and initial user setup
 */

import { 
  doc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';

// Firebase config import with fallback for tests
let db: any;
try {
  const firebaseConfig = require('@/services/firebase/config');
  db = firebaseConfig.db;
} catch {
  // Fallback for test environment
  db = {};
}
import { validateSchema } from './validation';
import { CreateCategorySchema, CreateAccountSchema } from './validation';

// ============================================================================
// DEFAULT DATA STRUCTURES
// ============================================================================

/**
 * Default system categories for new users
 */
export const DEFAULT_CATEGORIES = [
  // Income Categories
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
    name: 'Freelance Income',
    type: 'income' as const,
    color: '#8BC34A',
    icon: 'laptop',
    isDefault: true,
    isSystem: false,
    sortOrder: 1
  },
  {
    name: 'Investment Income',
    type: 'income' as const,
    color: '#CDDC39',
    icon: 'trending-up',
    isDefault: true,
    isSystem: false,
    sortOrder: 2
  },
  {
    name: 'Other Income',
    type: 'income' as const,
    color: '#9CCC65',
    icon: 'attach-money',
    isDefault: true,
    isSystem: false,
    sortOrder: 3
  },

  // Expense Categories
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
    name: 'Utilities',
    type: 'expense' as const,
    color: '#FF9800',
    icon: 'flash-on',
    isDefault: true,
    isSystem: false,
    sortOrder: 11
  },
  {
    name: 'Rent/Mortgage',
    type: 'expense' as const,
    color: '#F44336',
    icon: 'home',
    isDefault: true,
    isSystem: false,
    sortOrder: 12
  },
  {
    name: 'Transportation',
    type: 'expense' as const,
    color: '#9C27B0',
    icon: 'directions-car',
    isDefault: true,
    isSystem: false,
    sortOrder: 13
  },
  {
    name: 'Healthcare',
    type: 'expense' as const,
    color: '#E91E63',
    icon: 'local-hospital',
    isDefault: true,
    isSystem: false,
    sortOrder: 14
  },
  {
    name: 'Entertainment',
    type: 'expense' as const,
    color: '#673AB7',
    icon: 'movie',
    isDefault: true,
    isSystem: false,
    sortOrder: 15
  },
  {
    name: 'Dining Out',
    type: 'expense' as const,
    color: '#3F51B5',
    icon: 'restaurant',
    isDefault: true,
    isSystem: false,
    sortOrder: 16
  },
  {
    name: 'Shopping',
    type: 'expense' as const,
    color: '#2196F3',
    icon: 'shopping-bag',
    isDefault: true,
    isSystem: false,
    sortOrder: 17
  },
  {
    name: 'Insurance',
    type: 'expense' as const,
    color: '#03DAC6',
    icon: 'security',
    isDefault: true,
    isSystem: false,
    sortOrder: 18
  },
  {
    name: 'Other Expenses',
    type: 'expense' as const,
    color: '#607D8B',
    icon: 'receipt',
    isDefault: true,
    isSystem: false,
    sortOrder: 19
  },

  // Transfer Category
  {
    name: 'Account Transfer',
    type: 'transfer' as const,
    color: '#009688',
    icon: 'swap-horiz',
    isDefault: true,
    isSystem: false,
    sortOrder: 20
  }
] as const;

/**
 * Default starter account for new users
 */
export const DEFAULT_STARTER_ACCOUNT = {
  name: 'My Checking Account',
  type: 'checking' as const,
  startingBalance: 0,
  currency: 'USD',
  description: 'Your primary checking account',
  color: '#0a7ea4',
  icon: 'account-balance-wallet',
  includeInTotals: true,
  sortOrder: 0
} as const;

// ============================================================================
// MIGRATION INTERFACE
// ============================================================================

export interface MigrationResult {
  success: boolean;
  categoriesCreated?: number;
  accountsCreated?: number;
  errors?: string[];
  timestamp: Date;
}

export interface UserInitializationOptions {
  createDefaultCategories?: boolean;
  createStarterAccount?: boolean;
  starterAccountBalance?: number;
  customCategories?: Array<typeof DEFAULT_CATEGORIES[number]>;
}

// ============================================================================
// CORE MIGRATION FUNCTIONS
// ============================================================================

/**
 * Initialize a new user with default data structure
 */
export async function initializeNewUser(
  userId: string,
  options: UserInitializationOptions = {}
): Promise<MigrationResult> {
  const {
    createDefaultCategories = true,
    createStarterAccount = true,
    starterAccountBalance = 0,
    customCategories = []
  } = options;

  const result: MigrationResult = {
    success: false,
    categoriesCreated: 0,
    accountsCreated: 0,
    errors: [],
    timestamp: new Date()
  };

  try {
    const batch = writeBatch(db);
    let operationCount = 0;

    // Create default categories
    if (createDefaultCategories) {
      const categories = [...DEFAULT_CATEGORIES, ...customCategories];
      
      for (const categoryData of categories) {
        const categoryWithUser = {
          ...categoryData,
          userId,
          status: 'active' as const,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        // Validate category data
        const validation = validateSchema(CreateCategorySchema, categoryWithUser);
        if (!validation.success) {
          result.errors?.push(`Invalid category ${categoryData.name}: ${validation.errors?.message}`);
          continue;
        }

        const categoryRef = doc(collection(db, 'categories'));
        batch.set(categoryRef, categoryWithUser);
        operationCount++;
        result.categoriesCreated = (result.categoriesCreated || 0) + 1;
      }
    }

    // Create starter account
    if (createStarterAccount) {
      const accountData = {
        ...DEFAULT_STARTER_ACCOUNT,
        startingBalance: starterAccountBalance,
        currentBalance: starterAccountBalance,
        status: 'active' as const,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Validate account data
      const validation = validateSchema(CreateAccountSchema, accountData);
      if (validation.success) {
        const accountRef = doc(collection(db, 'accounts'));
        batch.set(accountRef, accountData);
        operationCount++;
        result.accountsCreated = 1;
      } else {
        result.errors?.push(`Invalid starter account: ${validation.errors?.message}`);
      }
    }

    // Execute batch operation
    if (operationCount > 0) {
      await batch.commit();
      result.success = true;
    } else {
      result.success = false;
      result.errors?.push('No operations to perform');
    }

  } catch (error) {
    result.success = false;
    result.errors?.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}

/**
 * Check if user has been initialized with default data
 */
export async function isUserInitialized(userId: string): Promise<boolean> {
  try {
    // Check if user has any accounts
    const accountsQuery = query(
      collection(db, 'accounts'),
      where('userId', '==', userId)
    );
    const accountsSnapshot = await getDocs(accountsQuery);

    // Check if user has any categories
    const categoriesQuery = query(
      collection(db, 'categories'),
      where('userId', '==', userId)
    );
    const categoriesSnapshot = await getDocs(categoriesQuery);

    return accountsSnapshot.size > 0 || categoriesSnapshot.size > 0;
  } catch (error) {
    console.error('Error checking user initialization:', error);
    return false;
  }
}

/**
 * Migrate existing user data to new schema version
 */
export async function migrateUserData(
  userId: string,
  fromVersion: string,
  toVersion: string
): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    errors: [],
    timestamp: new Date()
  };

  try {
    // For now, we only have version 1.0.0
    if (fromVersion === '1.0.0' && toVersion === '1.0.0') {
      result.success = true;
      return result;
    }

    // Future migration logic would go here
    result.errors?.push(`Migration from ${fromVersion} to ${toVersion} not implemented`);
    
  } catch (error) {
    result.success = false;
    result.errors?.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}

/**
 * Recreate default categories for existing user
 */
export async function recreateDefaultCategories(userId: string): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    categoriesCreated: 0,
    errors: [],
    timestamp: new Date()
  };

  try {
    const batch = writeBatch(db);

    for (const categoryData of DEFAULT_CATEGORIES) {
      const categoryWithUser = {
        ...categoryData,
        userId,
        status: 'active' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Validate category data
      const validation = validateSchema(CreateCategorySchema, categoryWithUser);
      if (!validation.success) {
        result.errors?.push(`Invalid category ${categoryData.name}: ${validation.errors?.message}`);
        continue;
      }

      const categoryRef = doc(collection(db, 'categories'));
      batch.set(categoryRef, categoryWithUser);
      result.categoriesCreated = (result.categoriesCreated || 0) + 1;
    }

    await batch.commit();
    result.success = true;

  } catch (error) {
    result.success = false;
    result.errors?.push(`Category recreation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}

/**
 * Validate existing user data integrity
 */
export async function validateUserDataIntegrity(userId: string): Promise<{
  valid: boolean;
  issues: string[];
  suggestions: string[];
}> {
  const issues: string[] = [];
  const suggestions: string[] = [];

  try {
    // Check accounts
    const accountsQuery = query(
      collection(db, 'accounts'),
      where('userId', '==', userId)
    );
    const accountsSnapshot = await getDocs(accountsQuery);

    if (accountsSnapshot.empty) {
      issues.push('No accounts found');
      suggestions.push('Create at least one account to start tracking transactions');
    }

    // Check categories
    const categoriesQuery = query(
      collection(db, 'categories'),
      where('userId', '==', userId)
    );
    const categoriesSnapshot = await getDocs(categoriesQuery);

    if (categoriesSnapshot.empty) {
      issues.push('No categories found');
      suggestions.push('Run initializeNewUser() to create default categories');
    }

    // Check for required category types
    const categories = categoriesSnapshot.docs.map(doc => doc.data());
    const hasIncome = categories.some(cat => cat.type === 'income');
    const hasExpense = categories.some(cat => cat.type === 'expense');
    const hasTransfer = categories.some(cat => cat.type === 'transfer');

    if (!hasIncome) {
      issues.push('No income categories found');
      suggestions.push('Add income categories for deposit transactions');
    }

    if (!hasExpense) {
      issues.push('No expense categories found');
      suggestions.push('Add expense categories for withdrawal transactions');
    }

    if (!hasTransfer) {
      issues.push('No transfer category found');
      suggestions.push('Add transfer category for account-to-account transfers');
    }

    return {
      valid: issues.length === 0,
      issues,
      suggestions
    };

  } catch (error) {
    return {
      valid: false,
      issues: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      suggestions: ['Check Firebase connection and permissions']
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a unique account name for user
 */
export function generateUniqueAccountName(existingNames: string[], baseType: string): string {
  const baseName = baseType.charAt(0).toUpperCase() + baseType.slice(1) + ' Account';
  
  if (!existingNames.includes(baseName)) {
    return baseName;
  }

  let counter = 2;
  while (existingNames.includes(`${baseName} ${counter}`)) {
    counter++;
  }
  
  return `${baseName} ${counter}`;
}

/**
 * Get category by name for user
 */
export async function getCategoryByName(userId: string, categoryName: string) {
  try {
    const categoriesQuery = query(
      collection(db, 'categories'),
      where('userId', '==', userId),
      where('name', '==', categoryName)
    );
    const snapshot = await getDocs(categoriesQuery);
    
    return snapshot.empty ? null : {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data()
    };
  } catch (error) {
    console.error('Error getting category by name:', error);
    return null;
  }
}

/**
 * Cleanup orphaned data for user
 */
export async function cleanupOrphanedData(userId: string): Promise<{
  transactionsDeleted: number;
  issues: string[];
}> {
  const result = {
    transactionsDeleted: 0,
    issues: [] as string[]
  };

  try {
    // Get all user accounts
    const accountsQuery = query(
      collection(db, 'accounts'),
      where('userId', '==', userId)
    );
    const accountsSnapshot = await getDocs(accountsQuery);
    const accountIds = accountsSnapshot.docs.map(doc => doc.id);

    // Get all user transactions
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', userId)
    );
    const transactionsSnapshot = await getDocs(transactionsQuery);

    // Find orphaned transactions
    const batch = writeBatch(db);
    for (const transactionDoc of transactionsSnapshot.docs) {
      const transaction = transactionDoc.data();
      if (!accountIds.includes(transaction.accountId)) {
        batch.delete(transactionDoc.ref);
        result.transactionsDeleted++;
      }
    }

    if (result.transactionsDeleted > 0) {
      await batch.commit();
    }

  } catch (error) {
    result.issues.push(`Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}