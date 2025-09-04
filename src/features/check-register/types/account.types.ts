/**
 * SmartLedger Check Register - Account Types
 * TypeScript interfaces for account data models
 */

// ============================================================================
// CORE ACCOUNT TYPES
// ============================================================================

export type AccountType =
  | 'checking'
  | 'savings'
  | 'cash'
  | 'credit'
  | 'investment'
  | 'other';
export type AccountStatus = 'active' | 'inactive' | 'closed';

/**
 * Core account interface for financial accounts
 */
export interface Account {
  /** Unique account identifier */
  id: string;

  /** User-defined account name */
  name: string;

  /** Type of account */
  type: AccountType;

  /** Starting balance when account was created */
  startingBalance: number;

  /** Current calculated balance */
  currentBalance: number;

  /** Currency code (USD, EUR, etc.) */
  currency: string;

  /** Account status */
  status: AccountStatus;

  /** Account description/notes */
  description?: string;

  /** Institution name (bank, credit union, etc.) */
  institution?: string;

  /** Account number (last 4 digits for security) */
  accountNumber?: string;

  /** Display order for sorting */
  sortOrder: number;

  /** Whether to include in dashboard totals */
  includeInTotals: boolean;

  /** Account color for visual identification */
  color: string;

  /** Account icon identifier */
  icon: string;

  /** Metadata timestamps */
  createdAt: Date;
  updatedAt: Date;

  /** User who owns this account */
  userId: string;

  /** Number of transactions in account */
  transactionCount: number;

  /** Date of last transaction */
  lastTransactionDate?: Date;
}

/**
 * Account input for creating new accounts
 */
export interface CreateAccountInput {
  name: string;
  type: AccountType;
  startingBalance: number;
  currency?: string;
  description?: string;
  institution?: string;
  accountNumber?: string;
  color?: string;
  icon?: string;
  includeInTotals?: boolean;
  sortOrder?: number;
}

/**
 * Account update input for editing existing accounts
 */
export interface UpdateAccountInput {
  name?: string;
  type?: AccountType;
  description?: string;
  institution?: string;
  accountNumber?: string;
  color?: string;
  icon?: string;
  includeInTotals?: boolean;
  sortOrder?: number;
  status?: AccountStatus;
}

// ============================================================================
// ACCOUNT WITH CALCULATIONS
// ============================================================================

/**
 * Account with calculated balance information
 */
export interface AccountWithBalance extends Account {
  /** Formatted current balance */
  formattedBalance: string;

  /** Formatted starting balance */
  formattedStartingBalance: string;

  /** Total change from starting balance */
  balanceChange: number;

  /** Formatted balance change */
  formattedBalanceChange: string;

  /** Whether balance has increased/decreased */
  balanceDirection: 'up' | 'down' | 'neutral';

  /** Formatted last transaction date */
  formattedLastTransactionDate?: string;
}

// ============================================================================
// ACCOUNT SUMMARY TYPES
// ============================================================================

/**
 * Account summary statistics
 */
export interface AccountSummary {
  /** Account information */
  account: AccountWithBalance;

  /** Recent transactions (last 5) */
  recentTransactions: {
    id: string;
    amount: number;
    description: string;
    date: Date;
    formattedAmount: string;
    formattedDate: string;
  }[];

  /** Monthly statistics */
  monthlyStats: {
    totalDeposits: number;
    totalWithdrawals: number;
    netChange: number;
    transactionCount: number;
    formattedDeposits: string;
    formattedWithdrawals: string;
    formattedNetChange: string;
  };

  /** Account health indicators */
  health: {
    isOverdrawn: boolean;
    lowBalanceWarning: boolean;
    unusualActivity: boolean;
  };
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Account validation error
 */
export interface AccountValidationError {
  field: keyof Account;
  message: string;
  code: string;
}

/**
 * Account validation result
 */
export interface AccountValidationResult {
  isValid: boolean;
  errors: AccountValidationError[];
}

// ============================================================================
// ACCOUNT CONFIGURATION
// ============================================================================

/**
 * Available account type configurations
 */
export interface AccountTypeConfig {
  type: AccountType;
  label: string;
  description: string;
  defaultIcon: string;
  defaultColor: string;
  allowsNegativeBalance: boolean;
  requiresInstitution: boolean;
  commonNames: string[];
}

/**
 * Account color and icon options
 */
export interface AccountCustomizationOptions {
  colors: {
    value: string;
    name: string;
    hex: string;
  }[];
  icons: {
    value: string;
    name: string;
    component: string;
  }[];
}

// ============================================================================
// QUERY TYPES
// ============================================================================

export type AccountSortField =
  | 'name'
  | 'type'
  | 'balance'
  | 'lastTransaction'
  | 'created';

/**
 * Account query filters
 */
export interface AccountFilters {
  /** Filter by account type */
  types?: AccountType[];

  /** Filter by status */
  statuses?: AccountStatus[];

  /** Search account names */
  searchText?: string;

  /** Filter by balance range */
  balanceRange?: {
    minBalance: number;
    maxBalance: number;
  };

  /** Only include accounts in totals */
  includeInTotalsOnly?: boolean;
}

/**
 * Account query options
 */
export interface AccountQueryOptions {
  /** Include inactive accounts */
  includeInactive?: boolean;

  /** Sort configuration */
  sort?: {
    field: AccountSortField;
    direction: 'asc' | 'desc';
  };

  /** Include balance calculations */
  includeBalances?: boolean;

  /** Include transaction counts */
  includeTransactionCounts?: boolean;
}
