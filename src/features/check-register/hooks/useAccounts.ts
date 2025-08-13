/**
 * SmartLedger Check Register - useAccounts Hook
 * React state management for account operations
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { accountService, type AccountFilters, type AccountSummary } from '../services/accountService';
import { initializeNewUser, isUserInitialized } from '../utils/dataMigration';
import type { 
  Account, 
  CreateAccountInput, 
  UpdateAccountInput,
  AccountType,
  AccountStatus 
} from '../types';

// ============================================================================
// HOOK INTERFACES
// ============================================================================

export interface UseAccountsState {
  accounts: Account[];
  summary: AccountSummary | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

export interface UseAccountsActions {
  // Core CRUD operations
  createAccount: (accountData: CreateAccountInput) => Promise<Account | null>;
  updateAccount: (accountId: string, updates: UpdateAccountInput) => Promise<Account | null>;
  deleteAccount: (accountId: string, forceDelete?: boolean) => Promise<boolean>;
  
  // Data fetching
  refreshAccounts: () => Promise<void>;
  refreshSummary: () => Promise<void>;
  
  // Filtering and search
  filterAccounts: (filters: AccountFilters) => void;
  searchAccounts: (searchText: string) => void;
  clearFilters: () => void;
  
  // User initialization
  initializeUser: () => Promise<boolean>;
  
  // Utility functions
  getAccountById: (accountId: string) => Account | null;
  getAccountsByType: (type: AccountType) => Account[];
  isAccountNameUnique: (name: string, excludeId?: string) => Promise<boolean>;
  
  // Error handling
  clearError: () => void;
}

export interface UseAccountsReturn extends UseAccountsState, UseAccountsActions {}

export interface UseAccountsOptions {
  userId: string;
  autoRefresh?: boolean;
  initialFilters?: AccountFilters;
  onAccountCreated?: (account: Account) => void;
  onAccountUpdated?: (account: Account) => void;
  onAccountDeleted?: (accountId: string) => void;
  onError?: (error: string) => void;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useAccounts(options: UseAccountsOptions): UseAccountsReturn {
  const {
    userId,
    autoRefresh = true,
    initialFilters = {},
    onAccountCreated,
    onAccountUpdated,
    onAccountDeleted,
    onError
  } = options;

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [state, setState] = useState<UseAccountsState>({
    accounts: [],
    summary: null,
    loading: true,
    error: null,
    initialized: false
  });

  const [filters, setFilters] = useState<AccountFilters>(initialFilters);
  const [searchText, setSearchText] = useState<string>('');

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const filteredAccounts = useMemo(() => {
    let result = state.accounts;

    // Apply type filter
    if (filters.types && filters.types.length > 0) {
      result = result.filter(account => filters.types!.includes(account.type));
    }

    // Apply status filter
    if (filters.statuses && filters.statuses.length > 0) {
      result = result.filter(account => filters.statuses!.includes(account.status));
    }

    // Apply includeInTotals filter
    if (filters.includeInTotals !== undefined) {
      result = result.filter(account => account.includeInTotals === filters.includeInTotals);
    }

    // Apply search filter
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      result = result.filter(account =>
        account.name.toLowerCase().includes(search) ||
        account.description?.toLowerCase().includes(search) ||
        account.institution?.toLowerCase().includes(search) ||
        account.type.toLowerCase().includes(search)
      );
    }

    return result.sort((a, b) => {
      // Sort by sortOrder first, then by name
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return a.name.localeCompare(b.name);
    });
  }, [state.accounts, filters, searchText]);

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  const handleError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error, loading: false }));
    onError?.(error);
  }, [onError]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const refreshAccounts = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const result = await accountService.getAccounts(userId, {});
      
      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          accounts: result.data!,
          loading: false
        }));
      } else {
        handleError(result.error || 'Failed to load accounts');
      }
    } catch (error) {
      handleError(`Failed to refresh accounts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [userId, handleError]);

  const refreshSummary = useCallback(async () => {
    try {
      const result = await accountService.getAccountSummary(userId);
      
      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          summary: result.data!
        }));
      } else {
        // Don't set error for summary failures, just log it
        console.warn('Failed to load account summary:', result.error);
      }
    } catch (error) {
      console.warn('Failed to refresh summary:', error);
    }
  }, [userId]);

  const checkUserInitialization = useCallback(async () => {
    try {
      const initialized = await isUserInitialized(userId);
      setState(prev => ({ ...prev, initialized }));
      return initialized;
    } catch (error) {
      console.warn('Failed to check user initialization:', error);
      return false;
    }
  }, [userId]);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const createAccount = useCallback(async (accountData: CreateAccountInput): Promise<Account | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const result = await accountService.createAccount(userId, accountData);
      
      if (result.success && result.data) {
        const newAccount = result.data;
        
        setState(prev => ({
          ...prev,
          accounts: [...prev.accounts, newAccount],
          loading: false
        }));

        // Refresh summary to get updated totals
        refreshSummary();
        
        onAccountCreated?.(newAccount);
        return newAccount;
      } else {
        handleError(result.error || 'Failed to create account');
        return null;
      }
    } catch (error) {
      handleError(`Failed to create account: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }, [userId, handleError, onAccountCreated, refreshSummary]);

  const updateAccount = useCallback(async (
    accountId: string, 
    updates: UpdateAccountInput
  ): Promise<Account | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const result = await accountService.updateAccount(accountId, userId, updates);
      
      if (result.success && result.data) {
        const updatedAccount = result.data;
        
        setState(prev => ({
          ...prev,
          accounts: prev.accounts.map(account =>
            account.id === accountId ? updatedAccount : account
          ),
          loading: false
        }));

        // Refresh summary if balance-affecting fields changed
        if (updates.includeInTotals !== undefined) {
          refreshSummary();
        }
        
        onAccountUpdated?.(updatedAccount);
        return updatedAccount;
      } else {
        handleError(result.error || 'Failed to update account');
        return null;
      }
    } catch (error) {
      handleError(`Failed to update account: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }, [userId, handleError, onAccountUpdated, refreshSummary]);

  const deleteAccount = useCallback(async (
    accountId: string, 
    forceDelete: boolean = false
  ): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const result = await accountService.deleteAccount(accountId, userId, forceDelete);
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          accounts: forceDelete 
            ? prev.accounts.filter(account => account.id !== accountId)
            : prev.accounts.map(account =>
                account.id === accountId 
                  ? { ...account, status: 'closed' as AccountStatus }
                  : account
              ),
          loading: false
        }));

        // Refresh summary to get updated totals
        refreshSummary();
        
        onAccountDeleted?.(accountId);
        return true;
      } else {
        handleError(result.error || 'Failed to delete account');
        return false;
      }
    } catch (error) {
      handleError(`Failed to delete account: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }, [userId, handleError, onAccountDeleted, refreshSummary]);

  // ============================================================================
  // FILTERING AND SEARCH
  // ============================================================================

  const filterAccounts = useCallback((newFilters: AccountFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const searchAccounts = useCallback((searchText: string) => {
    setSearchText(searchText);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchText('');
  }, []);

  // ============================================================================
  // USER INITIALIZATION
  // ============================================================================

  const initializeUser = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const result = await initializeNewUser(userId, {
        createDefaultCategories: true,
        createStarterAccount: true,
        starterAccountBalance: 0
      });

      if (result.success) {
        setState(prev => ({ ...prev, initialized: true }));
        
        // Refresh accounts after initialization
        await refreshAccounts();
        return true;
      } else {
        handleError(result.errors?.join(', ') || 'Failed to initialize user');
        return false;
      }
    } catch (error) {
      handleError(`Failed to initialize user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }, [userId, handleError, refreshAccounts]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getAccountById = useCallback((accountId: string): Account | null => {
    return state.accounts.find(account => account.id === accountId) || null;
  }, [state.accounts]);

  const getAccountsByType = useCallback((type: AccountType): Account[] => {
    return state.accounts.filter(account => account.type === type);
  }, [state.accounts]);

  const isAccountNameUnique = useCallback(async (
    name: string, 
    excludeId?: string
  ): Promise<boolean> => {
    try {
      const result = await accountService.isAccountNameUnique(userId, name, excludeId);
      return result.success ? result.data! : false;
    } catch (error) {
      console.warn('Failed to check account name uniqueness:', error);
      return false;
    }
  }, [userId]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      await checkUserInitialization();
      await refreshAccounts();
      await refreshSummary();
    };

    if (userId) {
      loadInitialData();
    }
  }, [userId, checkUserInitialization, refreshAccounts, refreshSummary]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !userId) return;

    const interval = setInterval(() => {
      refreshAccounts();
      refreshSummary();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, userId, refreshAccounts, refreshSummary]);

  // ============================================================================
  // RETURN COMBINED STATE AND ACTIONS
  // ============================================================================

  return {
    // State
    accounts: filteredAccounts,
    summary: state.summary,
    loading: state.loading,
    error: state.error,
    initialized: state.initialized,

    // Actions
    createAccount,
    updateAccount,
    deleteAccount,
    refreshAccounts,
    refreshSummary,
    filterAccounts,
    searchAccounts,
    clearFilters,
    initializeUser,
    getAccountById,
    getAccountsByType,
    isAccountNameUnique,
    clearError
  };
}

// ============================================================================
// SPECIALIZED HOOKS
// ============================================================================

/**
 * Hook for managing a single account
 */
export function useAccount(accountId: string, userId: string) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAccount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await accountService.getAccount(accountId, userId);
      
      if (result.success && result.data) {
        setAccount(result.data);
      } else {
        setError(result.error || 'Failed to load account');
      }
    } catch (error) {
      setError(`Failed to load account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [accountId, userId]);

  useEffect(() => {
    if (accountId && userId) {
      refreshAccount();
    }
  }, [accountId, userId, refreshAccount]);

  return {
    account,
    loading,
    error,
    refreshAccount,
    clearError: () => setError(null)
  };
}

/**
 * Hook for account summary only
 */
export function useAccountSummary(userId: string) {
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await accountService.getAccountSummary(userId);
      
      if (result.success && result.data) {
        setSummary(result.data);
      } else {
        setError(result.error || 'Failed to load summary');
      }
    } catch (error) {
      setError(`Failed to load summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      refreshSummary();
    }
  }, [userId, refreshSummary]);

  return {
    summary,
    loading,
    error,
    refreshSummary,
    clearError: () => setError(null)
  };
}