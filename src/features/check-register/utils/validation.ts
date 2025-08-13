/**
 * SmartLedger Check Register - Validation Schemas
 * Zod schemas for data validation before Firestore operations
 */

import { z } from 'zod';

// ============================================================================
// SHARED SCHEMAS & REFINEMENTS
// ============================================================================

/**
 * Common ID validation - Firebase document IDs
 */
const FirebaseIdSchema = z.string().min(1, 'ID is required');

/**
 * Currency amount validation - positive numbers with 2 decimal places
 */
const CurrencyAmountSchema = z.number()
  .nonnegative('Amount must be positive')
  .multipleOf(0.01, 'Amount must have at most 2 decimal places')
  .finite('Amount must be a valid number');

/**
 * Date validation - ensures valid dates
 */
const DateSchema = z.date({
  message: 'Date is required'
});

/**
 * Non-empty string validation
 */
const NonEmptyStringSchema = z.string().min(1, 'This field is required').trim();

/**
 * Currency code validation (ISO 4217)
 */
const CurrencyCodeSchema = z.string()
  .length(3, 'Currency code must be 3 characters')
  .toUpperCase()
  .default('USD');

// ============================================================================
// ACCOUNT VALIDATION SCHEMAS
// ============================================================================

/**
 * Account type enum
 */
export const AccountTypeSchema = z.enum([
  'checking',
  'savings', 
  'cash',
  'credit',
  'investment',
  'other'
]);

/**
 * Account status enum
 */
export const AccountStatusSchema = z.enum(['active', 'inactive', 'closed']);

/**
 * Schema for creating a new account
 */
export const CreateAccountSchema = z.object({
  name: NonEmptyStringSchema.max(50, 'Name must be 50 characters or less'),
  type: AccountTypeSchema,
  startingBalance: CurrencyAmountSchema,
  currency: CurrencyCodeSchema,
  description: z.string().max(200, 'Description must be 200 characters or less').optional(),
  institution: z.string().max(100, 'Institution name must be 100 characters or less').optional(),
  accountNumber: z.string()
    .max(4, 'Only last 4 digits allowed')
    .regex(/^\d{0,4}$/, 'Must be numeric')
    .optional(),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color')
    .default('#0a7ea4'),
  icon: NonEmptyStringSchema.default('account-balance-wallet'),
  includeInTotals: z.boolean().default(true),
  sortOrder: z.number().int().nonnegative().default(0)
});

/**
 * Schema for updating an existing account
 */
export const UpdateAccountSchema = CreateAccountSchema.partial().extend({
  status: AccountStatusSchema.optional()
});

/**
 * Complete account schema (from database)
 */
export const AccountSchema = CreateAccountSchema.extend({
  id: FirebaseIdSchema,
  currentBalance: CurrencyAmountSchema,
  status: AccountStatusSchema.default('active'),
  createdAt: DateSchema,
  updatedAt: DateSchema,
  userId: FirebaseIdSchema,
  transactionCount: z.number().int().nonnegative().optional(),
  lastTransactionDate: DateSchema.optional()
});

// ============================================================================
// TRANSACTION VALIDATION SCHEMAS
// ============================================================================

/**
 * Transaction type enum
 */
export const TransactionTypeSchema = z.enum(['deposit', 'withdrawal', 'transfer']);

/**
 * Transaction status enum
 */
export const TransactionStatusSchema = z.enum(['pending', 'cleared', 'reconciled']);

/**
 * Schema for creating a new transaction
 */
export const CreateTransactionSchema = z.object({
  accountId: FirebaseIdSchema,
  type: TransactionTypeSchema,
  amount: CurrencyAmountSchema.refine(
    (val) => val > 0,
    'Transaction amount must be greater than 0'
  ),
  description: NonEmptyStringSchema.max(100, 'Description must be 100 characters or less'),
  categoryId: FirebaseIdSchema,
  date: DateSchema,
  status: TransactionStatusSchema.default('pending'),
  referenceNumber: z.string().max(50, 'Reference number must be 50 characters or less').optional(),
  memo: z.string().max(500, 'Memo must be 500 characters or less').optional(),
  tags: z.array(z.string().max(20, 'Tag must be 20 characters or less'))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  
  // Transfer-specific fields
  transferAccountId: FirebaseIdSchema.optional(),
  transferTransactionId: FirebaseIdSchema.optional()
}).refine(
  (data) => {
    // If type is transfer, transferAccountId is required
    if (data.type === 'transfer') {
      return !!data.transferAccountId;
    }
    return true;
  },
  {
    message: 'Transfer account is required for transfer transactions',
    path: ['transferAccountId']
  }
).refine(
  (data) => {
    // Transfer account must be different from source account
    if (data.type === 'transfer' && data.transferAccountId) {
      return data.transferAccountId !== data.accountId;
    }
    return true;
  },
  {
    message: 'Transfer account must be different from source account',
    path: ['transferAccountId']
  }
);

/**
 * Schema for updating an existing transaction
 */
export const UpdateTransactionSchema = CreateTransactionSchema
  .omit({ accountId: true, transferTransactionId: true })
  .partial();

/**
 * Complete transaction schema (from database)
 */
export const TransactionSchema = CreateTransactionSchema.extend({
  id: FirebaseIdSchema,
  balance: CurrencyAmountSchema,
  createdAt: DateSchema,
  updatedAt: DateSchema,
  userId: FirebaseIdSchema
});

// ============================================================================
// CATEGORY VALIDATION SCHEMAS
// ============================================================================

/**
 * Category type enum
 */
export const CategoryTypeSchema = z.enum(['income', 'expense', 'transfer']);

/**
 * Category status enum
 */
export const CategoryStatusSchema = z.enum(['active', 'inactive', 'archived']);

/**
 * Schema for creating a new category
 */
export const CreateCategorySchema = z.object({
  name: NonEmptyStringSchema.max(30, 'Category name must be 30 characters or less'),
  type: CategoryTypeSchema,
  description: z.string().max(100, 'Description must be 100 characters or less').optional(),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color')
    .default('#5EEAD4'),
  icon: NonEmptyStringSchema.default('category'),
  parentCategoryId: FirebaseIdSchema.optional(),
  budgetAmount: CurrencyAmountSchema.optional(),
  keywords: z.array(z.string().max(30, 'Keyword must be 30 characters or less'))
    .max(20, 'Maximum 20 keywords allowed')
    .optional(),
  sortOrder: z.number().int().nonnegative().default(0)
});

/**
 * Schema for updating an existing category
 */
export const UpdateCategorySchema = CreateCategorySchema.partial().extend({
  status: CategoryStatusSchema.optional()
});

/**
 * Complete category schema (from database)
 */
export const CategorySchema = CreateCategorySchema.extend({
  id: FirebaseIdSchema,
  isDefault: z.boolean().default(false),
  isSystem: z.boolean().default(false),
  status: CategoryStatusSchema.default('active'),
  createdAt: DateSchema,
  updatedAt: DateSchema,
  userId: FirebaseIdSchema.nullable(),
  transactionCount: z.number().int().nonnegative().optional(),
  totalAmount: CurrencyAmountSchema.optional(),
  lastUsedDate: DateSchema.optional()
});

// ============================================================================
// FILTER & QUERY VALIDATION SCHEMAS
// ============================================================================

/**
 * Date range filter schema
 */
export const DateRangeSchema = z.object({
  startDate: DateSchema,
  endDate: DateSchema
}).refine(
  (data) => data.endDate >= data.startDate,
  {
    message: 'End date must be after start date',
    path: ['endDate']
  }
);

/**
 * Amount range filter schema
 */
export const AmountRangeSchema = z.object({
  minAmount: CurrencyAmountSchema,
  maxAmount: CurrencyAmountSchema
}).refine(
  (data) => data.maxAmount >= data.minAmount,
  {
    message: 'Max amount must be greater than min amount',
    path: ['maxAmount']
  }
);

/**
 * Transaction filters schema
 */
export const TransactionFiltersSchema = z.object({
  accountIds: z.array(FirebaseIdSchema).optional(),
  types: z.array(TransactionTypeSchema).optional(),
  statuses: z.array(TransactionStatusSchema).optional(),
  categoryIds: z.array(FirebaseIdSchema).optional(),
  dateRange: DateRangeSchema.optional(),
  amountRange: AmountRangeSchema.optional(),
  searchText: z.string().max(100, 'Search text too long').optional(),
  tags: z.array(z.string()).optional()
});

/**
 * Pagination schema
 */
export const PaginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().nonnegative().default(0)
});

// ============================================================================
// BULK OPERATION VALIDATION SCHEMAS
// ============================================================================

/**
 * Bulk transaction operation schema
 */
export const BulkTransactionOperationSchema = z.object({
  transactionIds: z.array(FirebaseIdSchema).min(1, 'At least one transaction required'),
  operation: z.enum(['update', 'delete', 'categorize', 'tag']),
  updateData: UpdateTransactionSchema.optional()
}).refine(
  (data) => {
    // Update data required for update/categorize operations
    if (data.operation === 'update' || data.operation === 'categorize') {
      return !!data.updateData;
    }
    return true;
  },
  {
    message: 'Update data required for this operation',
    path: ['updateData']
  }
);

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate data against schema and return typed result
 */
export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
}

/**
 * Format Zod errors for user display
 */
export function formatValidationErrors(error: z.ZodError): string[] {
  return error.issues.map((err: any) => {
    const path = err.path.join('.');
    return path ? `${path}: ${err.message}` : err.message;
  });
}

/**
 * Check if a value matches a schema
 */
export function isValidSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): data is T {
  return schema.safeParse(data).success;
}

// ============================================================================
// EXPORTS
// ============================================================================

export type AccountType = z.infer<typeof AccountTypeSchema>;
export type AccountStatus = z.infer<typeof AccountStatusSchema>;
export type CreateAccountInput = z.infer<typeof CreateAccountSchema>;
export type UpdateAccountInput = z.infer<typeof UpdateAccountSchema>;
export type Account = z.infer<typeof AccountSchema>;

export type TransactionType = z.infer<typeof TransactionTypeSchema>;
export type TransactionStatus = z.infer<typeof TransactionStatusSchema>;
export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;

export type CategoryType = z.infer<typeof CategoryTypeSchema>;
export type CategoryStatus = z.infer<typeof CategoryStatusSchema>;
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
export type Category = z.infer<typeof CategorySchema>;

export type TransactionFilters = z.infer<typeof TransactionFiltersSchema>;
export type DateRange = z.infer<typeof DateRangeSchema>;
export type AmountRange = z.infer<typeof AmountRangeSchema>;