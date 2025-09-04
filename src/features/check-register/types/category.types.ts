/**
 * SmartLedger Check Register - Category Types
 * TypeScript interfaces for transaction categorization
 */

// ============================================================================
// CORE CATEGORY TYPES
// ============================================================================

export type CategoryType = 'income' | 'expense' | 'transfer';
export type CategoryStatus = 'active' | 'inactive' | 'archived';

/**
 * Core category interface for transaction categorization
 */
export interface Category {
  /** Unique category identifier */
  id: string;

  /** Category name */
  name: string;

  /** Category type (income, expense, transfer) */
  type: CategoryType;

  /** Category description */
  description?: string;

  /** Category color for visual identification */
  color: string;

  /** Category icon identifier */
  icon: string;

  /** Whether this is a system default category */
  isDefault: boolean;

  /** Whether this is a built-in system category */
  isSystem: boolean;

  /** Parent category for hierarchical structure */
  parentCategoryId?: string;

  /** Category status */
  status: CategoryStatus;

  /** Display order for sorting */
  sortOrder: number;

  /** Budget amount (for expense categories) */
  budgetAmount?: number;

  /** Keywords for auto-categorization */
  keywords?: string[];

  /** Metadata timestamps */
  createdAt: Date;
  updatedAt: Date;

  /** User who owns this category (null for system categories) */
  userId: string | null;
}

/**
 * Category input for creating new categories
 */
export interface CreateCategoryInput {
  name: string;
  type: CategoryType;
  description?: string;
  color?: string;
  icon?: string;
  parentCategoryId?: string;
  budgetAmount?: number;
  keywords?: string[];
  sortOrder?: number;
}

/**
 * Category update input for editing existing categories
 */
export interface UpdateCategoryInput {
  name?: string;
  type?: CategoryType;
  description?: string;
  color?: string;
  icon?: string;
  parentCategoryId?: string;
  budgetAmount?: number;
  keywords?: string[];
  status?: CategoryStatus;
  sortOrder?: number;
}

// ============================================================================
// CATEGORY WITH USAGE STATISTICS
// ============================================================================

/**
 * Category with usage statistics
 */
export interface CategoryWithStats extends Category {
  /** Number of transactions using this category */
  transactionCount: number;

  /** Total amount spent in this category */
  totalAmount: number;

  /** Formatted total amount */
  formattedTotalAmount: string;

  /** Average transaction amount */
  averageAmount: number;

  /** Formatted average amount */
  formattedAverageAmount: string;

  /** Date of last usage */
  lastUsedDate?: Date;

  /** Formatted last used date */
  formattedLastUsedDate?: string;

  /** Monthly spending trend */
  monthlyTrend: {
    currentMonth: number;
    previousMonth: number;
    percentChange: number;
    direction: 'up' | 'down' | 'neutral';
  };

  /** Budget progress (for expense categories) */
  budgetProgress?: {
    spent: number;
    remaining: number;
    percentUsed: number;
    isOverBudget: boolean;
    formattedSpent: string;
    formattedRemaining: string;
  };
}

// ============================================================================
// HIERARCHICAL CATEGORY STRUCTURE
// ============================================================================

/**
 * Category tree node for hierarchical display
 */
export interface CategoryTreeNode extends CategoryWithStats {
  /** Child categories */
  children: CategoryTreeNode[];

  /** Depth level in tree */
  level: number;

  /** Whether node is expanded */
  isExpanded: boolean;

  /** Whether node has children */
  hasChildren: boolean;

  /** Full path from root (for breadcrumbs) */
  path: {
    id: string;
    name: string;
  }[];
}

// ============================================================================
// DEFAULT CATEGORIES
// ============================================================================

/**
 * Default category configuration
 */
export interface DefaultCategoryConfig {
  name: string;
  type: CategoryType;
  description: string;
  color: string;
  icon: string;
  keywords: string[];
  children?: Omit<DefaultCategoryConfig, 'children'>[];
}

/**
 * Category suggestion based on transaction description
 */
export interface CategorySuggestion {
  category: Category;
  confidence: number;
  reason: 'keyword_match' | 'pattern_match' | 'frequency' | 'manual_override';
  matchedKeywords?: string[];
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Category validation error
 */
export interface CategoryValidationError {
  field: keyof Category;
  message: string;
  code: string;
}

/**
 * Category validation result
 */
export interface CategoryValidationResult {
  isValid: boolean;
  errors: CategoryValidationError[];
}

// ============================================================================
// QUERY TYPES
// ============================================================================

export type CategorySortField =
  | 'name'
  | 'type'
  | 'usage'
  | 'amount'
  | 'created';

/**
 * Category query filters
 */
export interface CategoryFilters {
  /** Filter by category type */
  types?: CategoryType[];

  /** Filter by status */
  statuses?: CategoryStatus[];

  /** Search category names */
  searchText?: string;

  /** Filter by parent category */
  parentCategoryId?: string;

  /** Only include user-created categories */
  userCategoriesOnly?: boolean;

  /** Only include categories with transactions */
  usedCategoriesOnly?: boolean;

  /** Filter by usage frequency */
  usageRange?: {
    minUsage: number;
    maxUsage: number;
  };
}

/**
 * Category query options
 */
export interface CategoryQueryOptions {
  /** Include inactive categories */
  includeInactive?: boolean;

  /** Include usage statistics */
  includeStats?: boolean;

  /** Build hierarchical tree structure */
  buildTree?: boolean;

  /** Sort configuration */
  sort?: {
    field: CategorySortField;
    direction: 'asc' | 'desc';
  };

  /** Maximum tree depth to return */
  maxDepth?: number;
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Bulk category operation types
 */
export type BulkCategoryOperation =
  | 'activate'
  | 'deactivate'
  | 'archive'
  | 'delete'
  | 'merge';

/**
 * Bulk category operation input
 */
export interface BulkCategoryInput {
  /** Category IDs to operate on */
  categoryIds: string[];

  /** Operation type */
  operation: BulkCategoryOperation;

  /** Target category ID (for merge operations) */
  targetCategoryId?: string;

  /** Update data (for update operations) */
  updateData?: Partial<UpdateCategoryInput>;
}

/**
 * Bulk category operation result
 */
export interface BulkCategoryResult {
  /** Number of categories successfully processed */
  successCount: number;

  /** Number of categories that failed */
  errorCount: number;

  /** Error details for failed operations */
  errors: {
    categoryId: string;
    error: string;
  }[];

  /** Number of transactions affected */
  affectedTransactions: number;
}
