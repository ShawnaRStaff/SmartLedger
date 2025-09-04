/**
 * SmartLedger Check Register - Account Management Screen (Simplified)
 * Simplified version using design system components for immediate testing
 */

import React, { useState, useCallback } from 'react';
import { View, FlatList, Alert, RefreshControl } from 'react-native';
import { Typography, Button, createThemedStyles } from '@/design-system';
import { useAccounts } from '../../hooks/useAccounts';
import type { Account } from '../../types';

// ============================================================================
// INTERFACES
// ============================================================================

export interface AccountManagementScreenProps {
  userId: string;
  onAccountSelect?: (account: Account) => void;
  testID?: string;
}

// ============================================================================
// SIMPLE ACCOUNT CARD COMPONENT
// ============================================================================

const SimpleAccountCard: React.FC<{
  account: Account;
  onPress: () => void;
  onDelete: () => void;
}> = ({ account, onPress, onDelete }) => {
  const styles = useCardStyles();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Typography variant="h3">{account.name}</Typography>
        <Typography variant="body2" color="textSecondary">
          {account.type.toUpperCase()}
        </Typography>
      </View>

      <View style={styles.balance}>
        <Typography
          variant="h2"
          color={account.currentBalance >= 0 ? 'success' : 'error'}
        >
          $
          {account.currentBalance.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Typography>
      </View>

      {account.description && (
        <Typography variant="body2" color="textSecondary">
          {account.description}
        </Typography>
      )}

      <View style={styles.actions}>
        <Button variant="outline" onPress={onPress} size="sm">
          View Details
        </Button>
        <Button variant="outline" onPress={onDelete} size="sm">
          Delete
        </Button>
      </View>
    </View>
  );
};

const useCardStyles = createThemedStyles((theme) => ({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    marginBottom: theme.spacing.sm,
  },
  balance: {
    marginBottom: theme.spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
}));

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AccountManagementScreenSimple: React.FC<
  AccountManagementScreenProps
> = ({ userId, onAccountSelect, testID = 'account-management-screen' }) => {
  const styles = useStyles();
  const [refreshing, setRefreshing] = useState(false);

  const {
    accounts,
    summary,
    error,
    initialized,
    deleteAccount,
    refreshAccounts,
    initializeUser,
    clearError,
  } = useAccounts({
    userId,
    autoRefresh: true,
    onError: (error) => {
      Alert.alert('Error', error);
    },
  });

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleDeleteAccount = useCallback(
    (account: Account) => {
      Alert.alert(
        'Delete Account',
        `Are you sure you want to delete "${account.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              const success = await deleteAccount(account.id);
              if (success) {
                Alert.alert('Success', 'Account deleted successfully!');
              }
            },
          },
        ]
      );
    },
    [deleteAccount]
  );

  const handleAccountPress = useCallback(
    (account: Account) => {
      if (onAccountSelect) {
        onAccountSelect(account);
      } else {
        Alert.alert(
          'Account Details',
          `Selected: ${account.name}\nBalance: $${account.currentBalance}`
        );
      }
    },
    [onAccountSelect]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshAccounts();
    setRefreshing(false);
  }, [refreshAccounts]);

  const handleInitializeUser = useCallback(async () => {
    Alert.alert(
      'Initialize Account',
      'This will create default categories and a starter account. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Initialize',
          onPress: async () => {
            const success = await initializeUser();
            if (success) {
              Alert.alert('Success', 'Account initialized successfully!');
            }
          },
        },
      ]
    );
  }, [initializeUser]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderAccountItem = ({ item: account }: { item: Account }) => (
    <SimpleAccountCard
      account={account}
      onPress={() => handleAccountPress(account)}
      onDelete={() => handleDeleteAccount(account)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Typography variant="h2" align="center">
        No Accounts Found
      </Typography>
      <Typography variant="body1" color="textSecondary" align="center">
        {!initialized
          ? 'Get started by initializing your account with default settings.'
          : 'Create your first account to start tracking your finances.'}
      </Typography>
      {!initialized ? (
        <Button onPress={handleInitializeUser}>Initialize Account</Button>
      ) : (
        <Button
          onPress={() =>
            Alert.alert('Info', 'Account creation form coming soon!')
          }
        >
          Create Account
        </Button>
      )}
    </View>
  );

  const renderSummaryCard = () => {
    if (!summary) return null;

    return (
      <View style={styles.summaryCard}>
        <Typography variant="h3">Account Summary</Typography>

        <View style={styles.summaryRow}>
          <Typography variant="body1">Total Balance</Typography>
          <Typography variant="h2" color="primary">
            $
            {summary.totalBalance.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Typography>
        </View>

        <View style={styles.summaryRow}>
          <Typography variant="body2" color="textSecondary">
            Active Accounts: {summary.activeAccounts} of {summary.totalAccounts}
          </Typography>
        </View>
      </View>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <View style={styles.errorContainer}>
        <Typography variant="body2" color="error">
          {error}
        </Typography>
        <Button variant="ghost" onPress={clearError} size="sm">
          Dismiss
        </Button>
      </View>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Typography variant="h1">Check Register</Typography>
      </View>

      {/* Error Display */}
      {renderError()}

      {/* Summary Card */}
      {summary && renderSummaryCard()}

      {/* Account List */}
      <FlatList
        data={accounts}
        renderItem={renderAccountItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          accounts.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        testID={`${testID}-list`}
      />
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const useStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  header: {
    padding: theme.spacing.lg,
  },

  errorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.error + '20',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },

  summaryCard: {
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },

  list: {
    flex: 1,
  },

  listContent: {
    padding: theme.spacing.md,
  },

  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },

  emptyState: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
}));

export default AccountManagementScreenSimple;
