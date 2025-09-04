/**
 * SmartLedger Check Register - Account Service
 * Firestore operations for account management
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import {
  validateSchema,
  CreateAccountSchema,
  UpdateAccountSchema,
} from '../utils/validation';
import type {
  Account,
  CreateAccountInput,
  UpdateAccountInput,
  AccountStatus,
  AccountType,
} from '../types';

// ============================================================================
// SERVICE INTERFACES
// ============================================================================

export interface AccountFilters {
  userId?: string;
  types?: AccountType[];
  statuses?: AccountStatus[];
  includeInTotals?: boolean;
  searchText?: string;
}

export interface AccountSummary {
  totalAccounts: number;
  activeAccounts: number;
  totalBalance: number;
  accountsByType: Record<AccountType, number>;
}

export interface AccountServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// ACCOUNT SERVICE CLASS
// ============================================================================

export class AccountService {
  private readonly COLLECTION_NAME = 'accounts';

  /**
   * Create a new account
   */
  async createAccount(
    userId: string,
    accountData: CreateAccountInput
  ): Promise<AccountServiceResult<Account>> {
    try {
      // Validate input data
      const validation = validateSchema(CreateAccountSchema, accountData);
      if (!validation.success) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors?.message || 'Invalid data'}`,
        };
      }

      // Prepare account document
      const accountDoc = {
        ...validation.data,
        currentBalance: validation.data.startingBalance,
        status: 'active' as AccountStatus,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        transactionCount: 0,
        lastTransactionDate: null,
      };

      // Add to Firestore
      const docRef = await addDoc(
        collection(db, this.COLLECTION_NAME),
        accountDoc
      );

      // Return created account
      const createdAccount: Account = {
        id: docRef.id,
        ...accountData,
        currency: accountData.currency || 'USD', // Ensure currency is always a string
        sortOrder: accountData.sortOrder || 0, // Ensure sortOrder is always a number
        includeInTotals: accountData.includeInTotals ?? true, // Ensure includeInTotals is always a boolean
        color: accountData.color || '#0a7ea4', // Ensure color is always a string
        icon: accountData.icon || 'account-balance-wallet', // Ensure icon is always a string
        currentBalance: accountData.startingBalance,
        status: 'active',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        transactionCount: 0,
      };

      return {
        success: true,
        data: createdAccount,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create account: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Update an existing account
   */
  async updateAccount(
    accountId: string,
    userId: string,
    updates: UpdateAccountInput
  ): Promise<AccountServiceResult<Account>> {
    try {
      // Validate input data
      const validation = validateSchema(UpdateAccountSchema, updates);
      if (!validation.success) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors?.message || 'Invalid data'}`,
        };
      }

      // Check if account exists and belongs to user
      const accountRef = doc(db, this.COLLECTION_NAME, accountId);
      const accountSnap = await getDoc(accountRef);

      if (!accountSnap.exists()) {
        return {
          success: false,
          error: 'Account not found',
        };
      }

      const accountData = accountSnap.data();
      if (accountData.userId !== userId) {
        return {
          success: false,
          error: 'Account not found',
        };
      }

      // Prepare update data
      const updateData = {
        ...validation.data,
        updatedAt: serverTimestamp(),
      };

      // Update in Firestore
      await updateDoc(accountRef, updateData);

      // Return updated account
      const updatedAccount: Account = {
        id: accountId,
        ...accountData,
        ...updates,
        updatedAt: new Date(),
      } as Account;

      return {
        success: true,
        data: updatedAccount,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update account: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Delete an account (soft delete by setting status to closed)
   */
  async deleteAccount(
    accountId: string,
    userId: string,
    forceDelete: boolean = false
  ): Promise<AccountServiceResult<void>> {
    try {
      // Check if account exists and belongs to user
      const accountRef = doc(db, this.COLLECTION_NAME, accountId);
      const accountSnap = await getDoc(accountRef);

      if (!accountSnap.exists()) {
        return {
          success: false,
          error: 'Account not found',
        };
      }

      const accountData = accountSnap.data();
      if (accountData.userId !== userId) {
        return {
          success: false,
          error: 'Account not found',
        };
      }

      if (forceDelete) {
        // Hard delete (permanently remove)
        await deleteDoc(accountRef);
      } else {
        // Soft delete (mark as closed)
        await updateDoc(accountRef, {
          status: 'closed',
          updatedAt: serverTimestamp(),
        });
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete account: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get a single account by ID
   */
  async getAccount(
    accountId: string,
    userId: string
  ): Promise<AccountServiceResult<Account>> {
    try {
      const accountRef = doc(db, this.COLLECTION_NAME, accountId);
      const accountSnap = await getDoc(accountRef);

      if (!accountSnap.exists()) {
        return {
          success: false,
          error: 'Account not found',
        };
      }

      const accountData = accountSnap.data();
      if (accountData.userId !== userId) {
        return {
          success: false,
          error: 'Account not found',
        };
      }

      const account: Account = {
        id: accountId,
        ...accountData,
        createdAt: accountData.createdAt?.toDate() || new Date(),
        updatedAt: accountData.updatedAt?.toDate() || new Date(),
        lastTransactionDate: accountData.lastTransactionDate?.toDate(),
      } as Account;

      return {
        success: true,
        data: account,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get account: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get all accounts for a user with optional filtering
   */
  async getAccounts(
    userId: string,
    filters: AccountFilters = {}
  ): Promise<AccountServiceResult<Account[]>> {
    try {
      let accountQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('sortOrder', 'asc'),
        orderBy('createdAt', 'desc')
      );

      // Apply filters
      if (filters.statuses && filters.statuses.length > 0) {
        accountQuery = query(
          accountQuery,
          where('status', 'in', filters.statuses)
        );
      }

      if (filters.types && filters.types.length > 0) {
        accountQuery = query(accountQuery, where('type', 'in', filters.types));
      }

      if (filters.includeInTotals !== undefined) {
        accountQuery = query(
          accountQuery,
          where('includeInTotals', '==', filters.includeInTotals)
        );
      }

      const querySnapshot = await getDocs(accountQuery);
      let accounts: Account[] = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            lastTransactionDate: doc.data().lastTransactionDate?.toDate(),
          }) as Account
      );

      // Apply search filter (client-side)
      if (filters.searchText) {
        const searchTerm = filters.searchText.toLowerCase();
        accounts = accounts.filter(
          (account) =>
            account.name.toLowerCase().includes(searchTerm) ||
            account.description?.toLowerCase().includes(searchTerm) ||
            account.institution?.toLowerCase().includes(searchTerm)
        );
      }

      return {
        success: true,
        data: accounts,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get accounts: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get account summary/statistics
   */
  async getAccountSummary(
    userId: string
  ): Promise<AccountServiceResult<AccountSummary>> {
    try {
      const accountsResult = await this.getAccounts(userId);

      if (!accountsResult.success || !accountsResult.data) {
        return {
          success: false,
          error: accountsResult.error || 'Failed to get accounts for summary',
        };
      }

      const accounts = accountsResult.data;
      const activeAccounts = accounts.filter((acc) => acc.status === 'active');
      const accountsIncludedInTotals = accounts.filter(
        (acc) => acc.includeInTotals
      );

      const summary: AccountSummary = {
        totalAccounts: accounts.length,
        activeAccounts: activeAccounts.length,
        totalBalance: accountsIncludedInTotals.reduce(
          (sum, acc) => sum + acc.currentBalance,
          0
        ),
        accountsByType: {
          checking: accounts.filter((acc) => acc.type === 'checking').length,
          savings: accounts.filter((acc) => acc.type === 'savings').length,
          cash: accounts.filter((acc) => acc.type === 'cash').length,
          credit: accounts.filter((acc) => acc.type === 'credit').length,
          investment: accounts.filter((acc) => acc.type === 'investment')
            .length,
          other: accounts.filter((acc) => acc.type === 'other').length,
        },
      };

      return {
        success: true,
        data: summary,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get account summary: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Update account balance (usually called from transaction service)
   */
  async updateAccountBalance(
    accountId: string,
    userId: string,
    newBalance: number,
    transactionCount?: number
  ): Promise<AccountServiceResult<void>> {
    try {
      // Verify account ownership
      const accountResult = await this.getAccount(accountId, userId);
      if (!accountResult.success) {
        return {
          success: false,
          error: accountResult.error,
        };
      }

      const updateData: any = {
        currentBalance: newBalance,
        updatedAt: serverTimestamp(),
        lastTransactionDate: serverTimestamp(),
      };

      if (transactionCount !== undefined) {
        updateData.transactionCount = transactionCount;
      }

      const accountRef = doc(db, this.COLLECTION_NAME, accountId);
      await updateDoc(accountRef, updateData);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update account balance: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Batch update multiple accounts (for transfers)
   */
  async batchUpdateAccounts(
    userId: string,
    updates: {
      accountId: string;
      newBalance: number;
      transactionCount?: number;
    }[]
  ): Promise<AccountServiceResult<void>> {
    try {
      const batch = writeBatch(db);

      // Verify all accounts belong to user and prepare updates
      for (const update of updates) {
        const accountResult = await this.getAccount(update.accountId, userId);
        if (!accountResult.success) {
          return {
            success: false,
            error: `Account ${update.accountId} not found or access denied`,
          };
        }

        const accountRef = doc(db, this.COLLECTION_NAME, update.accountId);
        const updateData: any = {
          currentBalance: update.newBalance,
          updatedAt: serverTimestamp(),
          lastTransactionDate: serverTimestamp(),
        };

        if (update.transactionCount !== undefined) {
          updateData.transactionCount = update.transactionCount;
        }

        batch.update(accountRef, updateData);
      }

      await batch.commit();

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to batch update accounts: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Check if account name is unique for user
   */
  async isAccountNameUnique(
    userId: string,
    name: string,
    excludeAccountId?: string
  ): Promise<AccountServiceResult<boolean>> {
    try {
      let accountQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        where('name', '==', name)
      );

      const querySnapshot = await getDocs(accountQuery);

      if (excludeAccountId) {
        // Check if any found accounts are different from the one being updated
        const duplicates = querySnapshot.docs.filter(
          (doc) => doc.id !== excludeAccountId
        );
        return {
          success: true,
          data: duplicates.length === 0,
        };
      }

      return {
        success: true,
        data: querySnapshot.empty,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to check account name uniqueness: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get accounts by type
   */
  async getAccountsByType(
    userId: string,
    accountType: AccountType
  ): Promise<AccountServiceResult<Account[]>> {
    return this.getAccounts(userId, { types: [accountType] });
  }

  /**
   * Get active accounts only
   */
  async getActiveAccounts(
    userId: string
  ): Promise<AccountServiceResult<Account[]>> {
    return this.getAccounts(userId, { statuses: ['active'] });
  }

  /**
   * Archive old closed accounts (for cleanup)
   */
  async archiveClosedAccounts(
    userId: string,
    olderThanDays: number = 365
  ): Promise<AccountServiceResult<number>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const accountsResult = await this.getAccounts(userId, {
        statuses: ['closed'],
      });

      if (!accountsResult.success || !accountsResult.data) {
        return {
          success: false,
          error: 'Failed to get closed accounts',
        };
      }

      const oldAccounts = accountsResult.data.filter(
        (account) => account.updatedAt < cutoffDate
      );

      let archivedCount = 0;
      for (const account of oldAccounts) {
        const result = await this.deleteAccount(account.id, userId, true);
        if (result.success) {
          archivedCount++;
        }
      }

      return {
        success: true,
        data: archivedCount,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to archive accounts: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const accountService = new AccountService();
