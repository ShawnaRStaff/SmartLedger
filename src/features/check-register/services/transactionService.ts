/**
 * SmartLedger Check Register - Transaction Service
 * Firestore operations for transaction management with balance calculations
 */

import {
  collection,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  runTransaction,
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { accountService } from './accountService';
import {
  validateSchema,
  CreateTransactionSchema,
  UpdateTransactionSchema,
} from '../utils/validation';
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionType,
  TransactionStatus,
  TransactionFilters,
  TransactionQueryOptions,
} from '../types/transaction.types';

// ============================================================================
// SERVICE INTERFACES
// ============================================================================

export interface TransactionServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateTransactionResult
  extends TransactionServiceResult<Transaction> {
  /** Updated account balance after transaction */
  newBalance?: number;
  /** Transaction count for the account */
  transactionCount?: number;
}

// ============================================================================
// TRANSACTION SERVICE CLASS
// ============================================================================

export class TransactionService {
  private readonly COLLECTION_NAME = 'transactions';

  /**
   * Create a new transaction with automatic balance calculation
   */
  async createTransaction(
    userId: string,
    transactionData: CreateTransactionInput
  ): Promise<CreateTransactionResult> {
    try {
      // Validate input data
      const validation = validateSchema(
        CreateTransactionSchema,
        transactionData
      );
      if (!validation.success) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors?.message || 'Invalid data'}`,
        };
      }

      const validatedData = validation.data;

      // Verify account ownership and get current balance
      const accountResult = await accountService.getAccount(
        validatedData.accountId,
        userId
      );

      if (!accountResult.success || !accountResult.data) {
        return {
          success: false,
          error: 'Account not found or access denied',
        };
      }

      const account = accountResult.data;

      // Use Firestore transaction to ensure data consistency
      const result = await runTransaction(db, async (transaction) => {
        const accountRef = doc(db, 'accounts', validatedData.accountId);
        const accountSnap = await transaction.get(accountRef);

        if (!accountSnap.exists()) {
          throw new Error('Account not found');
        }

        const currentBalance = accountSnap.data().currentBalance || 0;
        const transactionCount = (accountSnap.data().transactionCount || 0) + 1;

        // Calculate new balance based on transaction type
        let newBalance = currentBalance;
        switch (validatedData.type) {
          case 'deposit':
            newBalance = currentBalance + validatedData.amount;
            break;
          case 'withdrawal':
            newBalance = currentBalance - validatedData.amount;
            break;
          case 'transfer':
            if (!validatedData.transferAccountId) {
              throw new Error('Transfer requires destination account');
            }
            // For transfers, we subtract from source account
            newBalance = currentBalance - validatedData.amount;
            break;
        }

        // Prepare transaction document
        const transactionDoc = {
          ...validatedData,
          balance: newBalance,
          status: validatedData.status || 'pending',
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        // Add transaction to Firestore
        const transactionRef = doc(collection(db, this.COLLECTION_NAME));
        transaction.set(transactionRef, transactionDoc);

        // Update account balance and transaction count
        transaction.update(accountRef, {
          currentBalance: newBalance,
          transactionCount: transactionCount,
          lastTransactionDate: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // Handle transfer to destination account
        if (
          validatedData.type === 'transfer' &&
          validatedData.transferAccountId
        ) {
          const destinationAccountRef = doc(
            db,
            'accounts',
            validatedData.transferAccountId
          );
          const destinationSnap = await transaction.get(destinationAccountRef);

          if (!destinationSnap.exists()) {
            throw new Error('Destination account not found');
          }

          const destinationData = destinationSnap.data();
          if (destinationData.userId !== userId) {
            throw new Error('Destination account access denied');
          }

          const destinationBalance = destinationData.currentBalance || 0;
          const destinationTransactionCount =
            (destinationData.transactionCount || 0) + 1;
          const newDestinationBalance =
            destinationBalance + validatedData.amount;

          // Create corresponding deposit transaction in destination account
          const destinationTransactionDoc = {
            accountId: validatedData.transferAccountId,
            type: 'deposit' as TransactionType,
            amount: validatedData.amount,
            description: `Transfer from ${account.name}`,
            categoryId: validatedData.categoryId,
            date: validatedData.date,
            status: validatedData.status || 'pending',
            balance: newDestinationBalance,
            transferAccountId: validatedData.accountId,
            transferTransactionId: transactionRef.id,
            referenceNumber: validatedData.referenceNumber,
            memo: validatedData.memo,
            userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };

          const destinationTransactionRef = doc(
            collection(db, this.COLLECTION_NAME)
          );
          transaction.set(destinationTransactionRef, destinationTransactionDoc);

          // Update original transaction with transfer reference
          transaction.update(transactionRef, {
            transferTransactionId: destinationTransactionRef.id,
          });

          // Update destination account balance
          transaction.update(destinationAccountRef, {
            currentBalance: newDestinationBalance,
            transactionCount: destinationTransactionCount,
            lastTransactionDate: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        return {
          transactionId: transactionRef.id,
          newBalance,
          transactionCount,
        };
      });

      // Return created transaction
      const createdTransaction: Transaction = {
        id: result.transactionId,
        ...validatedData,
        balance: result.newBalance,
        status: validatedData.status || 'pending',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return {
        success: true,
        data: createdTransaction,
        newBalance: result.newBalance,
        transactionCount: result.transactionCount,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Update an existing transaction
   */
  async updateTransaction(
    transactionId: string,
    userId: string,
    updates: UpdateTransactionInput
  ): Promise<TransactionServiceResult<Transaction>> {
    try {
      // Validate input data
      const validation = validateSchema(UpdateTransactionSchema, updates);
      if (!validation.success) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors?.message || 'Invalid data'}`,
        };
      }

      // Check if transaction exists and belongs to user
      const transactionRef = doc(db, this.COLLECTION_NAME, transactionId);
      const transactionSnap = await getDoc(transactionRef);

      if (!transactionSnap.exists()) {
        return {
          success: false,
          error: 'Transaction not found',
        };
      }

      const transactionData = transactionSnap.data();
      if (transactionData.userId !== userId) {
        return {
          success: false,
          error: 'Transaction not found',
        };
      }

      // For now, simple update without balance recalculation
      // TODO: Implement balance recalculation for amount changes
      const updateData = {
        ...validation.data,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(transactionRef, updateData);

      const updatedTransaction: Transaction = {
        id: transactionId,
        ...transactionData,
        ...updates,
        updatedAt: new Date(),
      } as Transaction;

      return {
        success: true,
        data: updatedTransaction,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Delete a transaction and update account balance
   */
  async deleteTransaction(
    transactionId: string,
    userId: string
  ): Promise<TransactionServiceResult<void>> {
    try {
      // Get transaction details first
      const transactionResult = await this.getTransaction(
        transactionId,
        userId
      );
      if (!transactionResult.success || !transactionResult.data) {
        return {
          success: false,
          error: transactionResult.error || 'Transaction not found',
        };
      }

      const transaction = transactionResult.data;

      // Use Firestore transaction to ensure consistency
      await runTransaction(db, async (firestoreTransaction) => {
        const transactionRef = doc(db, this.COLLECTION_NAME, transactionId);
        const accountRef = doc(db, 'accounts', transaction.accountId);

        const accountSnap = await firestoreTransaction.get(accountRef);
        if (!accountSnap.exists()) {
          throw new Error('Account not found');
        }

        const accountData = accountSnap.data();
        const currentBalance = accountData.currentBalance || 0;

        // Reverse the transaction effect on balance
        let newBalance = currentBalance;
        switch (transaction.type) {
          case 'deposit':
            newBalance = currentBalance - transaction.amount;
            break;
          case 'withdrawal':
            newBalance = currentBalance + transaction.amount;
            break;
          case 'transfer':
            newBalance = currentBalance + transaction.amount;
            break;
        }

        // Delete transaction
        firestoreTransaction.delete(transactionRef);

        // Update account balance
        firestoreTransaction.update(accountRef, {
          currentBalance: newBalance,
          transactionCount: Math.max(
            0,
            (accountData.transactionCount || 1) - 1
          ),
          updatedAt: serverTimestamp(),
        });

        // Handle transfer transaction cleanup
        if (
          transaction.type === 'transfer' &&
          transaction.transferTransactionId
        ) {
          const transferTransactionRef = doc(
            db,
            this.COLLECTION_NAME,
            transaction.transferTransactionId
          );
          firestoreTransaction.delete(transferTransactionRef);

          // Update destination account balance
          if (transaction.transferAccountId) {
            const destinationAccountRef = doc(
              db,
              'accounts',
              transaction.transferAccountId
            );
            const destinationSnap = await firestoreTransaction.get(
              destinationAccountRef
            );

            if (destinationSnap.exists()) {
              const destinationData = destinationSnap.data();
              const destinationBalance = destinationData.currentBalance || 0;

              firestoreTransaction.update(destinationAccountRef, {
                currentBalance: destinationBalance - transaction.amount,
                transactionCount: Math.max(
                  0,
                  (destinationData.transactionCount || 1) - 1
                ),
                updatedAt: serverTimestamp(),
              });
            }
          }
        }
      });

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get a single transaction by ID
   */
  async getTransaction(
    transactionId: string,
    userId: string
  ): Promise<TransactionServiceResult<Transaction>> {
    try {
      const transactionRef = doc(db, this.COLLECTION_NAME, transactionId);
      const transactionSnap = await getDoc(transactionRef);

      if (!transactionSnap.exists()) {
        return {
          success: false,
          error: 'Transaction not found',
        };
      }

      const transactionData = transactionSnap.data();
      if (transactionData.userId !== userId) {
        return {
          success: false,
          error: 'Transaction not found',
        };
      }

      const transaction: Transaction = {
        id: transactionId,
        ...transactionData,
        date: transactionData.date?.toDate() || new Date(),
        createdAt: transactionData.createdAt?.toDate() || new Date(),
        updatedAt: transactionData.updatedAt?.toDate() || new Date(),
      } as Transaction;

      return {
        success: true,
        data: transaction,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get transactions by account with optional filtering and pagination
   */
  async getTransactionsByAccount(
    accountId: string,
    userId: string,
    options: TransactionQueryOptions = {}
  ): Promise<TransactionServiceResult<Transaction[]>> {
    try {
      let transactionQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('accountId', '==', accountId),
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        orderBy('createdAt', 'desc')
      );

      // Apply limit if specified
      if (options.limit) {
        transactionQuery = query(transactionQuery, limit(options.limit));
      }

      const querySnapshot = await getDocs(transactionQuery);
      const transactions: Transaction[] = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate() || new Date(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          }) as Transaction
      );

      return {
        success: true,
        data: transactions,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get transactions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get all transactions for a user with optional filtering
   */
  async getTransactions(
    userId: string,
    filters: TransactionFilters = {},
    options: TransactionQueryOptions = {}
  ): Promise<TransactionServiceResult<Transaction[]>> {
    try {
      let transactionQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        orderBy('createdAt', 'desc')
      );

      // Apply account filter
      if (filters.accountIds && filters.accountIds.length > 0) {
        // For multiple accounts, we need to make separate queries
        // This is a limitation of Firestore's compound queries
        if (filters.accountIds.length === 1) {
          transactionQuery = query(
            transactionQuery,
            where('accountId', '==', filters.accountIds[0])
          );
        }
      }

      // Apply type filter
      if (filters.types && filters.types.length > 0) {
        transactionQuery = query(
          transactionQuery,
          where('type', 'in', filters.types)
        );
      }

      // Apply status filter
      if (filters.statuses && filters.statuses.length > 0) {
        transactionQuery = query(
          transactionQuery,
          where('status', 'in', filters.statuses)
        );
      }

      // Apply limit if specified
      if (options.limit) {
        transactionQuery = query(transactionQuery, limit(options.limit));
      }

      const querySnapshot = await getDocs(transactionQuery);
      let transactions: Transaction[] = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate() || new Date(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          }) as Transaction
      );

      // Apply client-side filters for complex queries
      if (filters.accountIds && filters.accountIds.length > 1) {
        transactions = transactions.filter((t) =>
          filters.accountIds!.includes(t.accountId)
        );
      }

      if (filters.searchText) {
        const searchTerm = filters.searchText.toLowerCase();
        transactions = transactions.filter(
          (t) =>
            t.description.toLowerCase().includes(searchTerm) ||
            t.memo?.toLowerCase().includes(searchTerm) ||
            t.referenceNumber?.toLowerCase().includes(searchTerm)
        );
      }

      if (filters.dateRange) {
        transactions = transactions.filter(
          (t) =>
            t.date >= filters.dateRange!.startDate &&
            t.date <= filters.dateRange!.endDate
        );
      }

      if (filters.amountRange) {
        transactions = transactions.filter(
          (t) =>
            t.amount >= filters.amountRange!.minAmount &&
            t.amount <= filters.amountRange!.maxAmount
        );
      }

      return {
        success: true,
        data: transactions,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get transactions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get recent transactions across all accounts
   */
  async getRecentTransactions(
    userId: string,
    limitCount: number = 10
  ): Promise<TransactionServiceResult<Transaction[]>> {
    return this.getTransactions(userId, {}, { limit: limitCount });
  }

  /**
   * Update transaction status (for clearing/reconciliation)
   */
  async updateTransactionStatus(
    transactionId: string,
    userId: string,
    status: TransactionStatus
  ): Promise<TransactionServiceResult<void>> {
    try {
      const transactionResult = await this.getTransaction(
        transactionId,
        userId
      );
      if (!transactionResult.success) {
        return {
          success: false,
          error: transactionResult.error,
        };
      }

      const transactionRef = doc(db, this.COLLECTION_NAME, transactionId);
      await updateDoc(transactionRef, {
        status,
        updatedAt: serverTimestamp(),
      });

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update transaction status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Recalculate balances for an account (data consistency utility)
   */
  async recalculateAccountBalances(
    accountId: string,
    userId: string
  ): Promise<TransactionServiceResult<void>> {
    try {
      // Get account details
      const accountResult = await accountService.getAccount(accountId, userId);
      if (!accountResult.success || !accountResult.data) {
        return {
          success: false,
          error: 'Account not found',
        };
      }

      const account = accountResult.data;

      // Get all transactions for account ordered by date
      const transactionsResult = await this.getTransactionsByAccount(
        accountId,
        userId,
        { limit: 1000 }
      );

      if (!transactionsResult.success || !transactionsResult.data) {
        return {
          success: false,
          error: 'Failed to get transactions for balance calculation',
        };
      }

      const transactions = transactionsResult.data.sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      );

      // Recalculate running balances
      let runningBalance = account.startingBalance;
      const batch = writeBatch(db);

      for (const transaction of transactions) {
        switch (transaction.type) {
          case 'deposit':
            runningBalance += transaction.amount;
            break;
          case 'withdrawal':
            runningBalance -= transaction.amount;
            break;
          case 'transfer':
            if (transaction.accountId === accountId) {
              runningBalance -= transaction.amount;
            } else {
              runningBalance += transaction.amount;
            }
            break;
        }

        // Update transaction balance
        const transactionRef = doc(db, this.COLLECTION_NAME, transaction.id);
        batch.update(transactionRef, {
          balance: runningBalance,
          updatedAt: serverTimestamp(),
        });
      }

      // Update account current balance
      const accountRef = doc(db, 'accounts', accountId);
      batch.update(accountRef, {
        currentBalance: runningBalance,
        updatedAt: serverTimestamp(),
      });

      await batch.commit();

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to recalculate balances: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const transactionService = new TransactionService();
