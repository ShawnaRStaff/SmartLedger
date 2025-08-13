/**
 * SmartLedger Check Register - Type Exports
 * Central export for all check register types
 */

// Transaction types
export * from './transaction.types';

// Account types  
export * from './account.types';

// Category types
export * from './category.types';

// ============================================================================
// SHARED UTILITY TYPES
// ============================================================================

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: Date;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta;
}

/**
 * Currency formatting options
 */
export interface CurrencyFormatOptions {
  currency: string;
  locale: string;
  showSymbol: boolean;
  precision: number;
}

/**
 * Date range helper
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Sort configuration
 */
export interface SortConfig<T extends string> {
  field: T;
  direction: 'asc' | 'desc';
}

/**
 * Filter base interface
 */
export interface BaseFilters {
  searchText?: string;
  dateRange?: DateRange;
  limit?: number;
  offset?: number;
}