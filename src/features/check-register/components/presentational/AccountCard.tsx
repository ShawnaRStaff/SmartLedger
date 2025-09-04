/**
 * SmartLedger Check Register - Account Card Component
 * Presentational component for displaying account information
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Typography, useTheme } from '@/design-system';
import type { Account } from '../../types';

// ============================================================================
// INTERFACES
// ============================================================================

export interface AccountCardProps {
  account: Account;
  onPress?: (account: Account) => void;
  onEdit?: (account: Account) => void;
  onDelete?: (account: Account) => void;
  showActions?: boolean;
  compact?: boolean;
  testID?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const getAccountTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    checking: 'Checking',
    savings: 'Savings',
    cash: 'Cash',
    credit: 'Credit Card',
    investment: 'Investment',
    other: 'Other',
  };
  return labels[type] || type;
};

const getAccountStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    active: '#4CAF50',
    inactive: '#FF9800',
    closed: '#F44336',
  };
  return colors[status] || '#757575';
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onPress,
  onEdit,
  onDelete,
  showActions = false,
  compact = false,
  testID,
}) => {
  const theme = useTheme();

  const handlePress = () => {
    onPress?.(account);
  };

  const handleEdit = () => {
    onEdit?.(account);
  };

  const handleDelete = () => {
    onDelete?.(account);
  };

  if (compact) {
    return (
      <Pressable
        style={[
          styles.compactCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
        onPress={handlePress}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`${account.name} account, balance ${formatCurrency(account.currentBalance, account.currency)}`}
      >
        <View style={styles.compactHeader}>
          <View style={styles.compactInfo}>
            <Typography
              variant="subtitle2"
              style={styles.compactName}
              numberOfLines={1}
            >
              {account.name}
            </Typography>
            <Typography
              variant="caption"
              color="textSecondary"
              style={styles.compactType}
            >
              {getAccountTypeLabel(account.type)}
            </Typography>
          </View>
          <View style={styles.compactBalance}>
            <Typography
              variant="subtitle1"
              style={[
                styles.balanceAmount,
                {
                  color:
                    account.currentBalance >= 0
                      ? theme.colors.success
                      : theme.colors.error,
                },
              ]}
            >
              {formatCurrency(account.currentBalance, account.currency)}
            </Typography>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={handlePress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${account.name} account details`}
    >
      {/* Account Header */}
      <View style={styles.header}>
        <View style={styles.accountInfo}>
          <View style={styles.titleRow}>
            <Typography variant="h4" style={styles.accountName}>
              {account.name}
            </Typography>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getAccountStatusColor(account.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {account.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <Typography
            variant="body2"
            color="textSecondary"
            style={styles.accountType}
          >
            {getAccountTypeLabel(account.type)}
            {account.institution && ` • ${account.institution}`}
            {account.accountNumber && ` • ••••${account.accountNumber}`}
          </Typography>
        </View>
      </View>

      {/* Balance Section */}
      <View style={styles.balanceSection}>
        <View style={styles.balanceRow}>
          <Typography
            variant="body2"
            color="textSecondary"
            style={styles.balanceLabel}
          >
            Current Balance
          </Typography>
          <Typography
            variant="h5"
            style={[
              styles.balanceAmount,
              {
                color:
                  account.currentBalance >= 0
                    ? theme.colors.success
                    : theme.colors.error,
              },
            ]}
          >
            {formatCurrency(account.currentBalance, account.currency)}
          </Typography>
        </View>

        {account.startingBalance !== account.currentBalance && (
          <View style={styles.balanceRow}>
            <Typography
              variant="body2"
              color="textSecondary"
              style={styles.balanceLabel}
            >
              Starting Balance
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              style={styles.startingBalance}
            >
              {formatCurrency(account.startingBalance, account.currency)}
            </Typography>
          </View>
        )}
      </View>

      {/* Description */}
      {account.description && (
        <View style={styles.descriptionSection}>
          <Typography
            variant="body2"
            color="textSecondary"
            style={styles.description}
          >
            {account.description}
          </Typography>
        </View>
      )}

      {/* Metadata */}
      <View style={styles.metadataSection}>
        <View style={styles.metadataRow}>
          <Typography
            variant="caption"
            color="textSecondary"
            style={styles.metadataLabel}
          >
            Transactions
          </Typography>
          <Typography
            variant="caption"
            color="textSecondary"
            style={styles.metadataValue}
          >
            {account.transactionCount || 0}
          </Typography>
        </View>

        {account.lastTransactionDate && (
          <View style={styles.metadataRow}>
            <Typography
              variant="caption"
              color="textSecondary"
              style={styles.metadataLabel}
            >
              Last Activity
            </Typography>
            <Typography
              variant="caption"
              color="textSecondary"
              style={styles.metadataValue}
            >
              {new Date(account.lastTransactionDate).toLocaleDateString()}
            </Typography>
          </View>
        )}

        <View style={styles.metadataRow}>
          <Typography
            variant="caption"
            color="textSecondary"
            style={styles.metadataLabel}
          >
            Include in Totals
          </Typography>
          <Typography
            variant="caption"
            color="textSecondary"
            style={styles.metadataValue}
          >
            {account.includeInTotals ? 'Yes' : 'No'}
          </Typography>
        </View>
      </View>

      {/* Action Buttons */}
      {showActions && (
        <View style={styles.actionsSection}>
          <Pressable
            style={[styles.actionButton, styles.editButton]}
            onPress={handleEdit}
            testID={`${testID}-edit`}
            accessibilityRole="button"
            accessibilityLabel="Edit account"
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
            testID={`${testID}-delete`}
            accessibilityRole="button"
            accessibilityLabel="Delete account"
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  compactCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginVertical: 4,
  },

  header: {
    marginBottom: 12,
  },

  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  accountInfo: {
    flex: 1,
  },

  compactInfo: {
    flex: 1,
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  accountName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },

  compactName: {
    fontSize: 16,
    fontWeight: '600',
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },

  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },

  accountType: {
    fontSize: 14,
  },

  compactType: {
    fontSize: 12,
  },

  balanceSection: {
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },

  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  balanceLabel: {
    fontSize: 14,
  },

  balanceAmount: {
    fontSize: 20,
    fontWeight: '700',
  },

  compactBalance: {
    alignItems: 'flex-end',
  },

  startingBalance: {
    fontSize: 14,
  },

  descriptionSection: {
    marginBottom: 12,
  },

  description: {
    fontSize: 14,
    fontStyle: 'italic',
  },

  metadataSection: {
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },

  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  metadataLabel: {
    fontSize: 12,
  },

  metadataValue: {
    fontSize: 12,
    fontWeight: '500',
  },

  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },

  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginHorizontal: 4,
    alignItems: 'center',
  },

  editButton: {
    backgroundColor: '#2196F3',
  },

  deleteButton: {
    backgroundColor: '#F44336',
  },

  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AccountCard;
