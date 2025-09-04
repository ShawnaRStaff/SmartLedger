/**
 * SmartLedger Check Register - Validation Schema Tests
 * Comprehensive test suite for Zod validation schemas
 */

import { z } from 'zod';
import {
  // Account schemas
  AccountTypeSchema,
  AccountStatusSchema,
  CreateAccountSchema,
  UpdateAccountSchema,
  AccountSchema,

  // Transaction schemas
  TransactionTypeSchema,
  TransactionStatusSchema,
  CreateTransactionSchema,
  UpdateTransactionSchema,
  TransactionSchema,

  // Category schemas
  CategoryTypeSchema,
  CategoryStatusSchema,
  CreateCategorySchema,
  UpdateCategorySchema,
  CategorySchema,

  // Filter schemas
  DateRangeSchema,
  AmountRangeSchema,
  TransactionFiltersSchema,
  PaginationSchema,
  BulkTransactionOperationSchema,

  // Helper functions
  validateSchema,
  formatValidationErrors,
  isValidSchema,
} from '../utils/validation';

describe('Validation Schemas', () => {
  // ============================================================================
  // SHARED SCHEMA TESTS
  // ============================================================================

  describe('Common Schema Components', () => {
    test('should validate currency amounts correctly', () => {
      const validAmounts = [0, 0.01, 1.99, 100.0, 999999.99];
      const invalidAmounts = [-1, 1.001, NaN, Infinity, -Infinity];

      validAmounts.forEach((amount) => {
        expect(() =>
          z.number().nonnegative().multipleOf(0.01).finite().parse(amount)
        ).not.toThrow();
      });

      invalidAmounts.forEach((amount) => {
        expect(() =>
          z.number().nonnegative().multipleOf(0.01).finite().parse(amount)
        ).toThrow();
      });
    });

    test('should validate Firebase IDs correctly', () => {
      const validIds = ['abc123', 'user_12345', 'transaction-xyz'];
      const invalidIds = [''];

      validIds.forEach((id) => {
        expect(() => z.string().min(1).parse(id)).not.toThrow();
      });

      invalidIds.forEach((id) => {
        expect(() => z.string().min(1).parse(id)).toThrow();
      });

      // Test null and undefined separately
      expect(() => z.string().min(1).parse(null)).toThrow();
      expect(() => z.string().min(1).parse(undefined)).toThrow();
    });

    test('should validate dates correctly', () => {
      const validDates = [
        new Date(),
        new Date('2024-01-01'),
        new Date('2024-12-31'),
      ];
      const invalidDates = ['invalid-date', null, undefined, 'not-a-date'];

      validDates.forEach((date) => {
        expect(() => z.date().parse(date)).not.toThrow();
      });

      invalidDates.forEach((date) => {
        expect(() => z.date().parse(date)).toThrow();
      });
    });

    test('should validate hex colors correctly', () => {
      const validColors = [
        '#000000',
        '#FFFFFF',
        '#ff0000',
        '#00FF00',
        '#0000ff',
      ];
      const invalidColors = ['#FFF', '#GGGGGG', 'red', '000000', '#12345'];

      const colorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

      validColors.forEach((color) => {
        expect(() => colorSchema.parse(color)).not.toThrow();
      });

      invalidColors.forEach((color) => {
        expect(() => colorSchema.parse(color)).toThrow();
      });
    });
  });

  // ============================================================================
  // ACCOUNT SCHEMA TESTS
  // ============================================================================

  describe('Account Validation Schemas', () => {
    describe('AccountTypeSchema', () => {
      test('should accept valid account types', () => {
        const validTypes = [
          'checking',
          'savings',
          'cash',
          'credit',
          'investment',
          'other',
        ];

        validTypes.forEach((type) => {
          expect(() => AccountTypeSchema.parse(type)).not.toThrow();
        });
      });

      test('should reject invalid account types', () => {
        const invalidTypes = ['invalid', 'bank', 'loan', '', null];

        invalidTypes.forEach((type) => {
          expect(() => AccountTypeSchema.parse(type)).toThrow();
        });
      });
    });

    describe('AccountStatusSchema', () => {
      test('should accept valid account statuses', () => {
        const validStatuses = ['active', 'inactive', 'closed'];

        validStatuses.forEach((status) => {
          expect(() => AccountStatusSchema.parse(status)).not.toThrow();
        });
      });

      test('should reject invalid account statuses', () => {
        const invalidStatuses = ['pending', 'suspended', '', null];

        invalidStatuses.forEach((status) => {
          expect(() => AccountStatusSchema.parse(status)).toThrow();
        });
      });
    });

    describe('CreateAccountSchema', () => {
      const validAccountData = {
        name: 'My Checking Account',
        type: 'checking' as const,
        startingBalance: 1000.0,
        currency: 'USD',
        description: 'Primary checking account',
        institution: 'Bank of America',
        accountNumber: '1234',
        color: '#0a7ea4',
        icon: 'account-balance-wallet',
        includeInTotals: true,
        sortOrder: 0,
      };

      test('should accept valid account creation data', () => {
        expect(() => CreateAccountSchema.parse(validAccountData)).not.toThrow();
      });

      test('should accept minimal required data with defaults', () => {
        const minimalData = {
          name: 'Basic Account',
          type: 'checking' as const,
          startingBalance: 0,
        };

        const result = CreateAccountSchema.parse(minimalData);
        expect(result.currency).toBe('USD');
        expect(result.color).toBe('#0a7ea4');
        expect(result.icon).toBe('account-balance-wallet');
        expect(result.includeInTotals).toBe(true);
        expect(result.sortOrder).toBe(0);
      });

      test('should reject invalid account names', () => {
        const invalidNames = ['', 'a'.repeat(51)];

        invalidNames.forEach((name) => {
          expect(() =>
            CreateAccountSchema.parse({
              ...validAccountData,
              name,
            })
          ).toThrow();
        });
      });

      test('should reject invalid starting balances', () => {
        const invalidBalances = [-100, 1.001, NaN, Infinity];

        invalidBalances.forEach((startingBalance) => {
          expect(() =>
            CreateAccountSchema.parse({
              ...validAccountData,
              startingBalance,
            })
          ).toThrow();
        });
      });

      test('should reject invalid account numbers', () => {
        const invalidNumbers = ['12345', 'abcd', '123a'];

        invalidNumbers.forEach((accountNumber) => {
          expect(() =>
            CreateAccountSchema.parse({
              ...validAccountData,
              accountNumber,
            })
          ).toThrow();
        });
      });

      test('should reject invalid colors', () => {
        const invalidColors = ['#FFF', '#GGGGGG', 'red'];

        invalidColors.forEach((color) => {
          expect(() =>
            CreateAccountSchema.parse({
              ...validAccountData,
              color,
            })
          ).toThrow();
        });
      });
    });

    describe('UpdateAccountSchema', () => {
      test('should accept partial account updates', () => {
        const partialUpdate = {
          name: 'Updated Account Name',
          status: 'inactive' as const,
        };

        expect(() => UpdateAccountSchema.parse(partialUpdate)).not.toThrow();
      });

      test('should accept empty updates', () => {
        expect(() => UpdateAccountSchema.parse({})).not.toThrow();
      });
    });

    describe('AccountSchema', () => {
      test('should validate complete account objects', () => {
        const completeAccount = {
          id: 'account123',
          name: 'My Account',
          type: 'checking' as const,
          startingBalance: 1000.0,
          currentBalance: 1500.0,
          currency: 'USD',
          status: 'active' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user123',
          color: '#0a7ea4',
          icon: 'account-balance-wallet',
          includeInTotals: true,
          sortOrder: 0,
        };

        expect(() => AccountSchema.parse(completeAccount)).not.toThrow();
      });
    });
  });

  // ============================================================================
  // TRANSACTION SCHEMA TESTS
  // ============================================================================

  describe('Transaction Validation Schemas', () => {
    describe('TransactionTypeSchema', () => {
      test('should accept valid transaction types', () => {
        const validTypes = ['deposit', 'withdrawal', 'transfer'];

        validTypes.forEach((type) => {
          expect(() => TransactionTypeSchema.parse(type)).not.toThrow();
        });
      });

      test('should reject invalid transaction types', () => {
        const invalidTypes = ['payment', 'income', 'expense', ''];

        invalidTypes.forEach((type) => {
          expect(() => TransactionTypeSchema.parse(type)).toThrow();
        });
      });
    });

    describe('TransactionStatusSchema', () => {
      test('should accept valid transaction statuses', () => {
        const validStatuses = ['pending', 'cleared', 'reconciled'];

        validStatuses.forEach((status) => {
          expect(() => TransactionStatusSchema.parse(status)).not.toThrow();
        });
      });

      test('should reject invalid transaction statuses', () => {
        const invalidStatuses = ['failed', 'cancelled', 'processing', ''];

        invalidStatuses.forEach((status) => {
          expect(() => TransactionStatusSchema.parse(status)).toThrow();
        });
      });
    });

    describe('CreateTransactionSchema', () => {
      const validTransactionData = {
        accountId: 'account123',
        type: 'deposit' as const,
        amount: 100.0,
        description: 'Salary deposit',
        categoryId: 'category123',
        date: new Date(),
        status: 'pending' as const,
        referenceNumber: 'REF123',
        memo: 'Monthly salary',
        tags: ['salary', 'income'],
      };

      test('should accept valid transaction creation data', () => {
        expect(() =>
          CreateTransactionSchema.parse(validTransactionData)
        ).not.toThrow();
      });

      test('should accept minimal required data with defaults', () => {
        const minimalData = {
          accountId: 'account123',
          type: 'deposit' as const,
          amount: 50.0,
          description: 'Test transaction',
          categoryId: 'category123',
          date: new Date(),
        };

        const result = CreateTransactionSchema.parse(minimalData);
        expect(result.status).toBe('pending');
      });

      test('should reject zero or negative amounts', () => {
        const invalidAmounts = [0, -100, -0.01];

        invalidAmounts.forEach((amount) => {
          expect(() =>
            CreateTransactionSchema.parse({
              ...validTransactionData,
              amount,
            })
          ).toThrow();
        });
      });

      test('should reject invalid descriptions', () => {
        const invalidDescriptions = ['', 'a'.repeat(101)];

        invalidDescriptions.forEach((description) => {
          expect(() =>
            CreateTransactionSchema.parse({
              ...validTransactionData,
              description,
            })
          ).toThrow();
        });
      });

      test('should reject too many tags', () => {
        const tooManyTags = Array(11).fill('tag');

        expect(() =>
          CreateTransactionSchema.parse({
            ...validTransactionData,
            tags: tooManyTags,
          })
        ).toThrow();
      });

      test('should require transferAccountId for transfer transactions', () => {
        const transferData = {
          ...validTransactionData,
          type: 'transfer' as const,
        };

        // Should fail without transferAccountId
        expect(() => CreateTransactionSchema.parse(transferData)).toThrow();

        // Should pass with transferAccountId
        expect(() =>
          CreateTransactionSchema.parse({
            ...transferData,
            transferAccountId: 'account456',
          })
        ).not.toThrow();
      });

      test('should reject same account transfer', () => {
        const transferData = {
          ...validTransactionData,
          type: 'transfer' as const,
          transferAccountId: 'account123', // Same as accountId
        };

        expect(() => CreateTransactionSchema.parse(transferData)).toThrow();
      });
    });

    describe('UpdateTransactionSchema', () => {
      test('should accept partial transaction updates', () => {
        const partialUpdate = {
          amount: 150.0,
          description: 'Updated description',
          status: 'cleared' as const,
        };

        expect(() =>
          UpdateTransactionSchema.parse(partialUpdate)
        ).not.toThrow();
      });

      test('should not allow updating accountId', () => {
        const updateWithAccountId = {
          accountId: 'newAccount123',
          amount: 100.0,
        };

        // Schema should omit accountId field
        const result = UpdateTransactionSchema.parse(updateWithAccountId);
        expect(result).not.toHaveProperty('accountId');
      });
    });

    describe('TransactionSchema', () => {
      test('should validate complete transaction objects', () => {
        const completeTransaction = {
          id: 'transaction123',
          accountId: 'account123',
          type: 'deposit' as const,
          amount: 100.0,
          balance: 1500.0,
          description: 'Salary deposit',
          categoryId: 'category123',
          date: new Date(),
          status: 'cleared' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user123',
        };

        expect(() =>
          TransactionSchema.parse(completeTransaction)
        ).not.toThrow();
      });
    });
  });

  // ============================================================================
  // CATEGORY SCHEMA TESTS
  // ============================================================================

  describe('Category Validation Schemas', () => {
    describe('CategoryTypeSchema', () => {
      test('should accept valid category types', () => {
        const validTypes = ['income', 'expense', 'transfer'];

        validTypes.forEach((type) => {
          expect(() => CategoryTypeSchema.parse(type)).not.toThrow();
        });
      });

      test('should reject invalid category types', () => {
        const invalidTypes = ['savings', 'investment', 'other', ''];

        invalidTypes.forEach((type) => {
          expect(() => CategoryTypeSchema.parse(type)).toThrow();
        });
      });
    });

    describe('CategoryStatusSchema', () => {
      test('should accept valid category statuses', () => {
        const validStatuses = ['active', 'inactive', 'archived'];

        validStatuses.forEach((status) => {
          expect(() => CategoryStatusSchema.parse(status)).not.toThrow();
        });
      });

      test('should reject invalid category statuses', () => {
        const invalidStatuses = ['deleted', 'suspended', '', null];

        invalidStatuses.forEach((status) => {
          expect(() => CategoryStatusSchema.parse(status)).toThrow();
        });
      });
    });

    describe('CreateCategorySchema', () => {
      const validCategoryData = {
        name: 'Groceries',
        type: 'expense' as const,
        description: 'Food and household items',
        color: '#5EEAD4',
        icon: 'shopping-cart',
        parentCategoryId: 'parent123',
        budgetAmount: 500.0,
        keywords: ['food', 'grocery', 'supermarket'],
        sortOrder: 1,
      };

      test('should accept valid category creation data', () => {
        expect(() =>
          CreateCategorySchema.parse(validCategoryData)
        ).not.toThrow();
      });

      test('should accept minimal required data with defaults', () => {
        const minimalData = {
          name: 'Basic Category',
          type: 'expense' as const,
        };

        const result = CreateCategorySchema.parse(minimalData);
        expect(result.color).toBe('#5EEAD4');
        expect(result.icon).toBe('category');
        expect(result.sortOrder).toBe(0);
      });

      test('should reject invalid category names', () => {
        const invalidNames = ['', 'a'.repeat(31)];

        invalidNames.forEach((name) => {
          expect(() =>
            CreateCategorySchema.parse({
              ...validCategoryData,
              name,
            })
          ).toThrow();
        });
      });

      test('should reject too many keywords', () => {
        const tooManyKeywords = Array(21).fill('keyword');

        expect(() =>
          CreateCategorySchema.parse({
            ...validCategoryData,
            keywords: tooManyKeywords,
          })
        ).toThrow();
      });

      test('should reject invalid budget amounts', () => {
        const invalidAmounts = [-100, 1.001, NaN];

        invalidAmounts.forEach((budgetAmount) => {
          expect(() =>
            CreateCategorySchema.parse({
              ...validCategoryData,
              budgetAmount,
            })
          ).toThrow();
        });
      });
    });

    describe('UpdateCategorySchema', () => {
      test('should accept partial category updates', () => {
        const partialUpdate = {
          name: 'Updated Category',
          status: 'inactive' as const,
          budgetAmount: 600.0,
        };

        expect(() => UpdateCategorySchema.parse(partialUpdate)).not.toThrow();
      });
    });

    describe('CategorySchema', () => {
      test('should validate complete category objects', () => {
        const completeCategory = {
          id: 'category123',
          name: 'Groceries',
          type: 'expense' as const,
          isDefault: false,
          isSystem: false,
          status: 'active' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user123',
          color: '#5EEAD4',
          icon: 'shopping-cart',
          sortOrder: 1,
        };

        expect(() => CategorySchema.parse(completeCategory)).not.toThrow();
      });

      test('should allow null userId for system categories', () => {
        const systemCategory = {
          id: 'category123',
          name: 'System Category',
          type: 'expense' as const,
          isDefault: true,
          isSystem: true,
          status: 'active' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: null,
          color: '#5EEAD4',
          icon: 'category',
          sortOrder: 0,
        };

        expect(() => CategorySchema.parse(systemCategory)).not.toThrow();
      });
    });
  });

  // ============================================================================
  // FILTER & QUERY SCHEMA TESTS
  // ============================================================================

  describe('Filter and Query Validation Schemas', () => {
    describe('DateRangeSchema', () => {
      test('should accept valid date ranges', () => {
        const validRange = {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
        };

        expect(() => DateRangeSchema.parse(validRange)).not.toThrow();
      });

      test('should accept same start and end date', () => {
        const sameDate = new Date('2024-06-15');
        const sameRange = {
          startDate: sameDate,
          endDate: sameDate,
        };

        expect(() => DateRangeSchema.parse(sameRange)).not.toThrow();
      });

      test('should reject invalid date ranges', () => {
        const invalidRange = {
          startDate: new Date('2024-12-31'),
          endDate: new Date('2024-01-01'),
        };

        expect(() => DateRangeSchema.parse(invalidRange)).toThrow();
      });
    });

    describe('AmountRangeSchema', () => {
      test('should accept valid amount ranges', () => {
        const validRange = {
          minAmount: 0,
          maxAmount: 1000.0,
        };

        expect(() => AmountRangeSchema.parse(validRange)).not.toThrow();
      });

      test('should accept same min and max amount', () => {
        const sameRange = {
          minAmount: 100.0,
          maxAmount: 100.0,
        };

        expect(() => AmountRangeSchema.parse(sameRange)).not.toThrow();
      });

      test('should reject invalid amount ranges', () => {
        const invalidRange = {
          minAmount: 1000.0,
          maxAmount: 100.0,
        };

        expect(() => AmountRangeSchema.parse(invalidRange)).toThrow();
      });
    });

    describe('TransactionFiltersSchema', () => {
      test('should accept valid transaction filters', () => {
        const validFilters = {
          accountIds: ['account1', 'account2'],
          types: ['deposit', 'withdrawal'],
          statuses: ['pending', 'cleared'],
          categoryIds: ['category1'],
          dateRange: {
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
          },
          amountRange: {
            minAmount: 0,
            maxAmount: 1000.0,
          },
          searchText: 'salary',
          tags: ['income', 'regular'],
        };

        expect(() =>
          TransactionFiltersSchema.parse(validFilters)
        ).not.toThrow();
      });

      test('should accept empty filters', () => {
        expect(() => TransactionFiltersSchema.parse({})).not.toThrow();
      });

      test('should reject invalid search text', () => {
        const invalidFilters = {
          searchText: 'a'.repeat(101),
        };

        expect(() => TransactionFiltersSchema.parse(invalidFilters)).toThrow();
      });
    });

    describe('PaginationSchema', () => {
      test('should accept valid pagination parameters', () => {
        const validPagination = {
          limit: 25,
          offset: 100,
        };

        expect(() => PaginationSchema.parse(validPagination)).not.toThrow();
      });

      test('should apply default values', () => {
        const result = PaginationSchema.parse({});
        expect(result.limit).toBe(50);
        expect(result.offset).toBe(0);
      });

      test('should reject invalid pagination parameters', () => {
        const invalidParams = [
          { limit: 0 },
          { limit: 101 },
          { offset: -1 },
          { limit: -5 },
        ];

        invalidParams.forEach((params) => {
          expect(() => PaginationSchema.parse(params)).toThrow();
        });
      });
    });
  });

  // ============================================================================
  // BULK OPERATION SCHEMA TESTS
  // ============================================================================

  describe('Bulk Operation Validation Schemas', () => {
    describe('BulkTransactionOperationSchema', () => {
      test('should accept valid bulk operations', () => {
        const validOperation = {
          transactionIds: ['trans1', 'trans2', 'trans3'],
          operation: 'update' as const,
          updateData: {
            status: 'cleared' as const,
            categoryId: 'newCategory',
          },
        };

        expect(() =>
          BulkTransactionOperationSchema.parse(validOperation)
        ).not.toThrow();
      });

      test('should accept delete operations without update data', () => {
        const deleteOperation = {
          transactionIds: ['trans1', 'trans2'],
          operation: 'delete' as const,
        };

        expect(() =>
          BulkTransactionOperationSchema.parse(deleteOperation)
        ).not.toThrow();
      });

      test('should reject update operations without update data', () => {
        const invalidOperation = {
          transactionIds: ['trans1'],
          operation: 'update' as const,
        };

        expect(() =>
          BulkTransactionOperationSchema.parse(invalidOperation)
        ).toThrow();
      });

      test('should reject empty transaction ID arrays', () => {
        const invalidOperation = {
          transactionIds: [],
          operation: 'delete' as const,
        };

        expect(() =>
          BulkTransactionOperationSchema.parse(invalidOperation)
        ).toThrow();
      });
    });
  });

  // ============================================================================
  // VALIDATION HELPER TESTS
  // ============================================================================

  describe('Validation Helper Functions', () => {
    describe('validateSchema', () => {
      test('should return success for valid data', () => {
        const validData = { name: 'Test', type: 'checking' };
        const result = validateSchema(
          z.object({ name: z.string(), type: z.string() }),
          validData
        );

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validData);
        }
      });

      test('should return errors for invalid data', () => {
        const invalidData = { name: '', type: 123 };
        const result = validateSchema(
          z.object({ name: z.string().min(1), type: z.string() }),
          invalidData
        );

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errors).toBeInstanceOf(z.ZodError);
        }
      });
    });

    describe('formatValidationErrors', () => {
      test('should format Zod errors correctly', () => {
        const schema = z.object({
          name: z.string().min(1, 'Name is required'),
          age: z.number().min(0, 'Age must be positive'),
        });

        try {
          schema.parse({ name: '', age: -1 });
        } catch (error) {
          if (error instanceof z.ZodError) {
            const formatted = formatValidationErrors(error);
            expect(formatted).toContain('name: Name is required');
            expect(formatted).toContain('age: Age must be positive');
          }
        }
      });

      test('should handle errors without paths', () => {
        const schema = z.string().min(1, 'String required');

        try {
          schema.parse('');
        } catch (error) {
          if (error instanceof z.ZodError) {
            const formatted = formatValidationErrors(error);
            expect(formatted).toContain('String required');
          }
        }
      });
    });

    describe('isValidSchema', () => {
      test('should return true for valid data', () => {
        const schema = z.object({ name: z.string() });
        const validData = { name: 'Test' };

        expect(isValidSchema(schema, validData)).toBe(true);
      });

      test('should return false for invalid data', () => {
        const schema = z.object({ name: z.string() });
        const invalidData = { name: 123 };

        expect(isValidSchema(schema, invalidData)).toBe(false);
      });

      test('should work as type guard', () => {
        const schema = z.object({ name: z.string(), age: z.number() });
        const data: unknown = { name: 'John', age: 30 };

        if (isValidSchema(schema, data)) {
          // TypeScript should now know data is { name: string, age: number }
          expect(typeof data.name).toBe('string');
          expect(typeof data.age).toBe('number');
        }
      });
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('Schema Integration Tests', () => {
    test('should validate complete account workflow', () => {
      // Create account
      const createData = {
        name: 'Test Account',
        type: 'checking' as const,
        startingBalance: 1000.0,
      };

      const createResult = validateSchema(CreateAccountSchema, createData);
      expect(createResult.success).toBe(true);

      // Update account
      const updateData = {
        name: 'Updated Account',
        status: 'inactive' as const,
      };

      const updateResult = validateSchema(UpdateAccountSchema, updateData);
      expect(updateResult.success).toBe(true);

      // Complete account object
      const completeAccount = {
        id: 'account123',
        ...createData,
        currentBalance: 1500.0,
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user123',
        currency: 'USD',
        color: '#0a7ea4',
        icon: 'account-balance-wallet',
        includeInTotals: true,
        sortOrder: 0,
      };

      const completeResult = validateSchema(AccountSchema, completeAccount);
      expect(completeResult.success).toBe(true);
    });

    test('should validate complete transaction workflow', () => {
      // Create transaction
      const createData = {
        accountId: 'account123',
        type: 'deposit' as const,
        amount: 500.0,
        description: 'Test deposit',
        categoryId: 'category123',
        date: new Date(),
      };

      const createResult = validateSchema(CreateTransactionSchema, createData);
      expect(createResult.success).toBe(true);

      // Update transaction
      const updateData = {
        status: 'cleared' as const,
        memo: 'Updated memo',
      };

      const updateResult = validateSchema(UpdateTransactionSchema, updateData);
      expect(updateResult.success).toBe(true);

      // Complete transaction object
      const completeTransaction = {
        id: 'transaction123',
        ...createData,
        balance: 1500.0,
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user123',
      };

      const completeResult = validateSchema(
        TransactionSchema,
        completeTransaction
      );
      expect(completeResult.success).toBe(true);
    });

    test('should validate transfer transaction workflow', () => {
      const transferData = {
        accountId: 'account123',
        type: 'transfer' as const,
        amount: 200.0,
        description: 'Transfer to savings',
        categoryId: 'transfer-category',
        date: new Date(),
        transferAccountId: 'account456',
      };

      const result = validateSchema(CreateTransactionSchema, transferData);
      expect(result.success).toBe(true);
    });

    test('should validate complex filtering scenarios', () => {
      const complexFilters = {
        accountIds: ['account1', 'account2'],
        types: ['deposit', 'withdrawal'],
        statuses: ['cleared'],
        dateRange: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
        },
        amountRange: {
          minAmount: 100.0,
          maxAmount: 5000.0,
        },
        searchText: 'salary bonus',
        tags: ['income', 'work'],
      };

      const result = validateSchema(TransactionFiltersSchema, complexFilters);
      expect(result.success).toBe(true);
    });
  });

  // ============================================================================
  // EDGE CASE TESTS
  // ============================================================================

  describe('Edge Case Validation Tests', () => {
    test('should handle very large numbers correctly', () => {
      const largeAmount = 999999999.99;
      expect(() =>
        z.number().nonnegative().multipleOf(0.01).finite().parse(largeAmount)
      ).not.toThrow();
    });

    test('should handle very small positive numbers correctly', () => {
      const smallAmount = 0.01;
      expect(() =>
        z.number().nonnegative().multipleOf(0.01).finite().parse(smallAmount)
      ).not.toThrow();
    });

    test('should reject floating point precision issues', () => {
      const impreciseAmount = 1.001; // More than 2 decimal places
      expect(() =>
        z
          .number()
          .nonnegative()
          .multipleOf(0.01)
          .finite()
          .parse(impreciseAmount)
      ).toThrow();
    });

    test('should handle Unicode characters in names', () => {
      const unicodeName = 'Café Münchën Épargne';
      const schema = z.string().min(1).max(50);
      expect(() => schema.parse(unicodeName)).not.toThrow();
    });

    test('should handle empty arrays correctly', () => {
      const emptyTags: string[] = [];
      const schema = z.array(z.string()).max(10);
      expect(() => schema.parse(emptyTags)).not.toThrow();
    });

    test('should validate boundary conditions for string lengths', () => {
      const maxLengthName = 'a'.repeat(50); // Exactly at limit
      const tooLongName = 'a'.repeat(51); // Over limit

      const schema = z.string().max(50);
      expect(() => schema.parse(maxLengthName)).not.toThrow();
      expect(() => schema.parse(tooLongName)).toThrow();
    });

    test('should validate date boundaries correctly', () => {
      const minDate = new Date('1900-01-01');
      const maxDate = new Date('2100-12-31');
      const futureDate = new Date('2024-12-31');

      [minDate, maxDate, futureDate].forEach((date) => {
        expect(() => z.date().parse(date)).not.toThrow();
      });
    });
  });
});
