/**
 * SmartLedger Check Register - Transaction Hook
 * Custom hook for transaction form state management and operations
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/auth/AuthContext';
import { transactionService } from '../services/transactionService';
import { accountService } from '../services/accountService';
import {
  validateSchema,
  CreateTransactionSchema,
  formatValidationErrors,
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
import type { Account } from '../types';

// ============================================================================
// HOOK INTERFACES
// ============================================================================

export interface TransactionFormData {
  accountId: string;
  type: TransactionType;
  amount: string; // Keep as string for input handling
  description: string;
  categoryId: string;
  date: Date;
  status: TransactionStatus;
  transferAccountId?: string;
  referenceNumber?: string;
  memo?: string;
  tags?: string[];
}

export interface TransactionFormErrors {
  accountId?: string;
  type?: string;
  amount?: string;
  description?: string;
  categoryId?: string;
  date?: string;
  status?: string;
  transferAccountId?: string;
  referenceNumber?: string;
  memo?: string;
  tags?: string;
  general?: string;
}

export interface UseTransactionFormOptions {
  /** Initial form data */
  initialData?: Partial<TransactionFormData>;
  /** Auto-save on changes */
  autoSave?: boolean;
  /** Validation mode */
  validateOnChange?: boolean;
}

export interface UseTransactionFormReturn {
  // Form state
  formData: TransactionFormData;
  errors: TransactionFormErrors;
  isDirty: boolean;
  isValid: boolean;

  // Form operations
  setValue: (field: keyof TransactionFormData, value: any) => void;
  setValues: (values: Partial<TransactionFormData>) => void;
  resetForm: () => void;
  validateForm: () => boolean;

  // Transaction operations
  createTransaction: () => Promise<{
    success: boolean;
    data?: Transaction;
    error?: string;
  }>;
  isSubmitting: boolean;

  // Utility functions
  formatAmount: (amount: string) => string;
  parseAmount: (formattedAmount: string) => number;
}

export interface UseTransactionListReturn {
  // Transaction data
  transactions: Transaction[];
  loading: boolean;
  error: string | null;

  // Filtering and pagination
  filters: TransactionFilters;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  clearFilters: () => void;
  hasMore: boolean;
  loadMore: () => Promise<void>;

  // Operations
  refreshTransactions: () => Promise<void>;
  updateTransaction: (
    id: string,
    updates: UpdateTransactionInput
  ) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<boolean>;
  updateTransactionStatus: (
    id: string,
    status: TransactionStatus
  ) => Promise<boolean>;
}

// ============================================================================
// TRANSACTION FORM HOOK
// ============================================================================

export function useTransactionForm(
  options: UseTransactionFormOptions = {}
): UseTransactionFormReturn {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default form data - wrapped in useMemo to prevent unnecessary re-renders
  const defaultFormData = useMemo<TransactionFormData>(
    () => ({
      accountId: '',
      type: 'deposit',
      amount: '',
      description: '',
      categoryId: '',
      date: new Date(),
      status: 'pending',
      transferAccountId: '',
      referenceNumber: '',
      memo: '',
      tags: [],
      ...options.initialData,
    }),
    [options.initialData]
  );

  const [formData, setFormData] =
    useState<TransactionFormData>(defaultFormData);
  const [originalData] = useState<TransactionFormData>(defaultFormData);
  const [errors, setErrors] = useState<TransactionFormErrors>({});

  // Computed properties
  const isDirty = JSON.stringify(formData) !== JSON.stringify(originalData);
  const isValid = Object.keys(errors).length === 0;

  /**
   * Format amount for display (add currency symbol and formatting)
   */
  const formatAmount = useCallback((amount: string): string => {
    if (!amount) return '';

    // Remove non-numeric characters except decimal point
    const numericValue = amount.replace(/[^0-9.]/g, '');

    // Parse as number and format
    const numberValue = parseFloat(numericValue);
    if (isNaN(numberValue)) return '';

    // Format with 2 decimal places
    return numberValue.toFixed(2);
  }, []);

  /**
   * Parse formatted amount to number
   */
  const parseAmount = useCallback((formattedAmount: string): number => {
    const numericValue = formattedAmount.replace(/[^0-9.]/g, '');
    const numberValue = parseFloat(numericValue);
    return isNaN(numberValue) ? 0 : numberValue;
  }, []);

  /**
   * Validate individual field
   */
  const validateField = useCallback(
    (field: keyof TransactionFormData, value: any): string | null => {
      switch (field) {
        case 'accountId':
          return !value ? 'Account is required' : null;
        case 'amount':
          const numericAmount = parseAmount(value);
          if (!value || numericAmount <= 0)
            return 'Amount must be greater than 0';
          if (numericAmount > 1000000) return 'Amount is too large';
          return null;
        case 'description':
          if (!value || value.trim().length === 0)
            return 'Description is required';
          if (value.length > 100)
            return 'Description must be 100 characters or less';
          return null;
        case 'categoryId':
          return !value ? 'Category is required' : null;
        case 'transferAccountId':
          if (formData.type === 'transfer') {
            if (!value) return 'Transfer account is required';
            if (value === formData.accountId)
              return 'Transfer account must be different from source account';
          }
          return null;
        case 'referenceNumber':
          if (value && value.length > 50)
            return 'Reference number must be 50 characters or less';
          return null;
        case 'memo':
          if (value && value.length > 500)
            return 'Memo must be 500 characters or less';
          return null;
        default:
          return null;
      }
    },
    [formData.accountId, formData.type, parseAmount]
  );

  /**
   * Validate entire form
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: TransactionFormErrors = {};

    // Validate each field
    Object.keys(formData).forEach((key) => {
      const field = key as keyof TransactionFormData;
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Additional validation using Zod schema
    try {
      const transactionInput: CreateTransactionInput = {
        accountId: formData.accountId,
        type: formData.type,
        amount: parseAmount(formData.amount),
        description: formData.description.trim(),
        categoryId: formData.categoryId,
        date: formData.date,
        status: formData.status,
        transferAccountId: formData.transferAccountId || undefined,
        referenceNumber: formData.referenceNumber || undefined,
        memo: formData.memo || undefined,
        tags:
          formData.tags && formData.tags.length > 0 ? formData.tags : undefined,
      };

      const validation = validateSchema(
        CreateTransactionSchema,
        transactionInput
      );
      if (!validation.success) {
        const validationErrors = formatValidationErrors(validation.errors);
        newErrors.general = validationErrors.join(', ');
      }
    } catch {
      newErrors.general = 'Validation error occurred';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, parseAmount, validateField]);

  /**
   * Set a single form field value
   */
  const setValue = useCallback(
    (field: keyof TransactionFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Validate on change if enabled
      if (options.validateOnChange) {
        const error = validateField(field, value);
        setErrors((prev) => ({
          ...prev,
          [field]: error || undefined,
        }));
      }

      // Clear general error when user makes changes
      setErrors((prev) => ({ ...prev, general: undefined }));
    },
    [options.validateOnChange, validateField]
  );

  /**
   * Set multiple form field values
   */
  const setValues = useCallback(
    (values: Partial<TransactionFormData>) => {
      setFormData((prev) => ({ ...prev, ...values }));

      // Validate changed fields if enabled
      if (options.validateOnChange) {
        const newErrors = { ...errors };
        Object.entries(values).forEach(([key, value]) => {
          const field = key as keyof TransactionFormData;
          const error = validateField(field, value);
          if (error) {
            newErrors[field] = error;
          } else {
            delete newErrors[field];
          }
        });
        setErrors(newErrors);
      }

      // Clear general error when user makes changes
      setErrors((prev) => ({ ...prev, general: undefined }));
    },
    [errors, options.validateOnChange, validateField]
  );

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData(defaultFormData);
    setErrors({});
  }, [defaultFormData]);

  /**
   * Create transaction
   */
  const createTransaction = useCallback(async (): Promise<{
    success: boolean;
    data?: Transaction;
    error?: string;
  }> => {
    if (!user?.uid) {
      return { success: false, error: 'User not authenticated' };
    }

    // Validate form before submission
    if (!validateForm()) {
      return { success: false, error: 'Please fix form errors' };
    }

    setIsSubmitting(true);

    try {
      const transactionInput: CreateTransactionInput = {
        accountId: formData.accountId,
        type: formData.type,
        amount: parseAmount(formData.amount),
        description: formData.description.trim(),
        categoryId: formData.categoryId,
        date: formData.date,
        status: formData.status,
        transferAccountId: formData.transferAccountId || undefined,
        referenceNumber: formData.referenceNumber || undefined,
        memo: formData.memo || undefined,
        tags:
          formData.tags && formData.tags.length > 0 ? formData.tags : undefined,
      };

      const result = await transactionService.createTransaction(
        user.uid,
        transactionInput
      );

      if (result.success && result.data) {
        // Reset form on successful creation
        resetForm();
        return { success: true, data: result.data };
      } else {
        setErrors({ general: result.error || 'Failed to create transaction' });
        return {
          success: false,
          error: result.error || 'Failed to create transaction',
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      setErrors({ general: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.uid, formData, parseAmount, validateForm, resetForm]);

  return {
    formData,
    errors,
    isDirty,
    isValid,
    setValue,
    setValues,
    resetForm,
    validateForm,
    createTransaction,
    isSubmitting,
    formatAmount,
    parseAmount,
  };
}

// ============================================================================
// TRANSACTION LIST HOOK
// ============================================================================

export function useTransactionList(
  accountId?: string,
  initialFilters: TransactionFilters = {},
  options: TransactionQueryOptions = {}
): UseTransactionListReturn {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] =
    useState<TransactionFilters>(initialFilters);
  const [hasMore, setHasMore] = useState(true);
  // Note: lastTransaction state removed as it's not currently used
  // Can be re-implemented when needed for check number sequencing

  /**
   * Load transactions based on current filters
   */
  const loadTransactions = useCallback(
    async (append = false) => {
      if (!user?.uid) {
        setError('User not authenticated');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let result;

        if (accountId) {
          // Load transactions for specific account
          result = await transactionService.getTransactionsByAccount(
            accountId,
            user.uid,
            { ...options, limit: options.limit || 20 }
          );
        } else {
          // Load transactions for all accounts
          result = await transactionService.getTransactions(user.uid, filters, {
            ...options,
            limit: options.limit || 20,
          });
        }

        if (result.success && result.data) {
          if (append) {
            setTransactions((prev) => [...prev, ...(result.data || [])]);
          } else {
            setTransactions(result.data || []);
          }

          setHasMore(result.data.length === (options.limit || 20));
          // Note: Last transaction tracking can be re-implemented when needed
        } else {
          setError(result.error || 'Failed to load transactions');
          setTransactions([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    },
    [user?.uid, accountId, filters, options]
  );

  /**
   * Load more transactions (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await loadTransactions(true);
  }, [hasMore, loading, loadTransactions]);

  /**
   * Refresh transactions
   */
  const refreshTransactions = useCallback(async () => {
    // Reset last transaction tracking
    await loadTransactions(false);
  }, [loadTransactions]);

  /**
   * Set filters and reload
   */
  const setFilters = useCallback((newFilters: Partial<TransactionFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
    // Reset last transaction tracking
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFiltersState({});
    // Reset last transaction tracking
  }, []);

  /**
   * Update a transaction
   */
  const updateTransaction = useCallback(
    async (id: string, updates: UpdateTransactionInput): Promise<boolean> => {
      if (!user?.uid) return false;

      try {
        const result = await transactionService.updateTransaction(
          id,
          user.uid,
          updates
        );
        if (result.success && result.data) {
          // Update local state
          setTransactions((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
          );
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [user?.uid]
  );

  /**
   * Delete a transaction
   */
  const deleteTransaction = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user?.uid) return false;

      try {
        const result = await transactionService.deleteTransaction(id, user.uid);
        if (result.success) {
          // Remove from local state
          setTransactions((prev) => prev.filter((t) => t.id !== id));
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [user?.uid]
  );

  /**
   * Update transaction status
   */
  const updateTransactionStatus = useCallback(
    async (id: string, status: TransactionStatus): Promise<boolean> => {
      if (!user?.uid) return false;

      try {
        const result = await transactionService.updateTransactionStatus(
          id,
          user.uid,
          status
        );
        if (result.success) {
          // Update local state
          setTransactions((prev) =>
            prev.map((t) => (t.id === id ? { ...t, status } : t))
          );
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [user?.uid]
  );

  // Load initial transactions
  useEffect(() => {
    loadTransactions(false);
  }, [loadTransactions]);

  return {
    transactions,
    loading,
    error,
    filters,
    setFilters,
    clearFilters,
    hasMore,
    loadMore,
    refreshTransactions,
    updateTransaction,
    deleteTransaction,
    updateTransactionStatus,
  };
}

// ============================================================================
// ACCOUNTS HOOK FOR TRANSACTION FORM
// ============================================================================

export function useAccountsForTransaction() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    if (!user?.uid) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await accountService.getActiveAccounts(user.uid);
      if (result.success && result.data) {
        setAccounts(result.data);
      } else {
        setError(result.error || 'Failed to load accounts');
        setAccounts([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  return {
    accounts,
    loading,
    error,
    refreshAccounts: loadAccounts,
  };
}
