/**
 * SmartLedger Check Register - Transaction Types
 * TypeScript interfaces for transaction data models
 */

// ============================================================================
// CORE TRANSACTION TYPES
// ============================================================================

export type TransactionType = 'deposit' | 'withdrawal' | 'transfer';
export type TransactionStatus = 'pending' | 'cleared' | 'reconciled';

/**
 * Core transaction interface for all financial transactions
 */
export interface Transaction {
  /** Unique transaction identifier */
  id: string;

  /** Account this transaction belongs to */
  accountId: string;

  /** Type of transaction */
  type: TransactionType;

  /** Transaction amount (always positive, type determines direction) */
  amount: number;

  /** User-provided description */
  description: string;

  /** Category for budgeting and analysis */
  categoryId: string;

  /** Date when transaction occurred */
  date: Date;

  /** Current status of transaction */
  status: TransactionStatus;

  /** Running balance after this transaction */
  balance: number;

  /** For transfers: destination account */
  transferAccountId?: string;

  /** For transfers: corresponding transaction ID in destination account */
  transferTransactionId?: string;

  /** Optional reference number (check number, confirmation, etc.) */
  referenceNumber?: string;

  /** Optional memo field for additional notes */
  memo?: string;

  /** Tags for advanced categorization */
  tags?: string[];

  /** Metadata timestamps */
  createdAt: Date;
  updatedAt: Date;

  /** User who owns this transaction */
  userId: string;
}

/**
 * Transaction input for creating new transactions
 */
export interface CreateTransactionInput {
  accountId: string;
  type: TransactionType;
  amount: number;
  description: string;
  categoryId: string;
  date: Date;
  status?: TransactionStatus;
  transferAccountId?: string;
  referenceNumber?: string;
  memo?: string;
  tags?: string[];
}

/**
 * Transaction update input for editing existing transactions
 */
export interface UpdateTransactionInput {
  amount?: number;
  description?: string;
  categoryId?: string;
  date?: Date;
  status?: TransactionStatus;
  referenceNumber?: string;
  memo?: string;
  tags?: string[];
}

/**
 * Transaction with calculated metadata for display
 */
export interface TransactionWithMetadata extends Transaction {
  /** Account name for display */
  accountName: string;

  /** Category name and color */
  category: {
    name: string;
    color: string;
    icon: string;
  };

  /** Formatted amount string */
  formattedAmount: string;

  /** Formatted balance string */
  formattedBalance: string;

  /** Formatted date string */
  formattedDate: string;

  /** Whether this transaction can be edited */
  isEditable: boolean;

  /** Whether this transaction affects account balance */
  affectsBalance: boolean;
}

// ============================================================================
// QUERY AND FILTER TYPES
// ============================================================================

export type TransactionSortField =
  | 'date'
  | 'amount'
  | 'description'
  | 'category'
  | 'balance';
export type SortDirection = 'asc' | 'desc';

/**
 * Transaction query filters
 */
export interface TransactionFilters {
  /** Filter by account */
  accountIds?: string[];

  /** Filter by transaction type */
  types?: TransactionType[];

  /** Filter by status */
  statuses?: TransactionStatus[];

  /** Filter by category */
  categoryIds?: string[];

  /** Filter by date range */
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };

  /** Filter by amount range */
  amountRange?: {
    minAmount: number;
    maxAmount: number;
  };

  /** Search text (description, memo, reference) */
  searchText?: string;

  /** Filter by tags */
  tags?: string[];
}

/**
 * Transaction query options
 */
export interface TransactionQueryOptions {
  /** Pagination limit */
  limit?: number;

  /** Pagination offset */
  offset?: number;

  /** Sort configuration */
  sort?: {
    field: TransactionSortField;
    direction: SortDirection;
  };

  /** Include soft-deleted transactions */
  includeSoftDeleted?: boolean;
}

/**
 * Transaction query result
 */
export interface TransactionQueryResult {
  /** Array of transactions */
  transactions: TransactionWithMetadata[];

  /** Total count (for pagination) */
  totalCount: number;

  /** Whether there are more results */
  hasMore: boolean;

  /** Query execution metadata */
  metadata: {
    executionTime: number;
    fromCache: boolean;
  };
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Bulk transaction operation types
 */
export type BulkTransactionOperation =
  | 'update'
  | 'delete'
  | 'categorize'
  | 'tag';

/**
 * Bulk transaction operation input
 */
export interface BulkTransactionInput {
  /** Transaction IDs to operate on */
  transactionIds: string[];

  /** Operation type */
  operation: BulkTransactionOperation;

  /** Update data (for update/categorize operations) */
  updateData?: Partial<UpdateTransactionInput>;
}

/**
 * Bulk operation result
 */
export interface BulkTransactionResult {
  /** Number of transactions successfully processed */
  successCount: number;

  /** Number of transactions that failed */
  errorCount: number;

  /** Error details for failed operations */
  errors: {
    transactionId: string;
    error: string;
  }[];
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Transaction validation error
 */
export interface TransactionValidationError {
  field: keyof Transaction;
  message: string;
  code: string;
}

/**
 * Transaction validation result
 */
export interface TransactionValidationResult {
  isValid: boolean;
  errors: TransactionValidationError[];
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type ExportFormat = 'csv' | 'json' | 'pdf' | 'xlsx';

/**
 * Transaction export options
 */
export interface TransactionExportOptions {
  /** Export format */
  format: ExportFormat;

  /** Transactions to export */
  transactions: Transaction[];

  /** Include account information */
  includeAccountInfo?: boolean;

  /** Include category information */
  includeCategoryInfo?: boolean;

  /** Date range for filename */
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}
