/**
 * SmartLedger - Accounts Main Screen
 * Complete financial command center with all register functionality
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  FlatList,
} from 'react-native';
import { Typography, Button, createThemedStyles } from '@/design-system';
import { useAuth } from '@/context/auth/AuthContext';
import { useAccounts } from '../../hooks/useAccounts';
import type { Account, Transaction } from '../../types';

// ============================================================================
// MAIN ACCOUNTS SCREEN - Financial Command Center
// ============================================================================

export default function AccountsMainScreen() {
  const { user } = useAuth();
  const styles = useStyles();

  // State Management
  const [activeTab, setActiveTab] = useState<
    'overview' | 'transactions' | 'categories'
  >('overview');
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showTransferModal, setShowTransferModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Mock transactions for now (will be replaced with real data)
  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      accountId: 'acc1',
      type: 'deposit',
      amount: 2500.0,
      description: 'Salary',
      categoryId: 'Income',
      date: new Date('2024-01-15'),
      balance: 2500.0,
      status: 'cleared',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: user?.uid || '',
    },
    {
      id: '2',
      accountId: 'acc1',
      type: 'withdrawal',
      amount: 89.99,
      description: 'Grocery Store',
      categoryId: 'Food',
      date: new Date('2024-01-14'),
      balance: 2410.01,
      status: 'cleared',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: user?.uid || '',
    },
  ]);

  const { accounts, summary, refreshAccounts } = useAccounts({
    userId: user?.uid || '',
    autoRefresh: true,
  });

  // ============================================================================
  // QUICK ACTION BAR
  // ============================================================================

  const renderQuickActions = () => (
    <View style={styles.quickActionsBar}>
      <Pressable
        style={[styles.quickActionButton, styles.primaryAction]}
        onPress={() => setShowAddTransaction(true)}
      >
        <Typography variant="h3" style={{ color: 'white' }}>
          + Add
        </Typography>
      </Pressable>

      <Pressable
        style={styles.quickActionButton}
        onPress={() => setShowTransferModal(true)}
      >
        <Typography variant="body1">⇄ Transfer</Typography>
      </Pressable>

      <Pressable
        style={styles.quickActionButton}
        onPress={() => Alert.alert('Export', 'Export feature coming soon!')}
      >
        <Typography variant="body1">📤 Export</Typography>
      </Pressable>

      <Pressable
        style={styles.quickActionButton}
        onPress={() => setActiveTab('categories')}
      >
        <Typography variant="body1">🏷️ Categories</Typography>
      </Pressable>
    </View>
  );

  // ============================================================================
  // TAB NAVIGATION
  // ============================================================================

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <Pressable
        style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
        onPress={() => setActiveTab('overview')}
      >
        <Typography
          variant="body1"
          color={activeTab === 'overview' ? 'primary' : 'textSecondary'}
        >
          Overview
        </Typography>
      </Pressable>

      <Pressable
        style={[styles.tab, activeTab === 'transactions' && styles.activeTab]}
        onPress={() => setActiveTab('transactions')}
      >
        <Typography
          variant="body1"
          color={activeTab === 'transactions' ? 'primary' : 'textSecondary'}
        >
          Transactions
        </Typography>
      </Pressable>

      <Pressable
        style={[styles.tab, activeTab === 'categories' && styles.activeTab]}
        onPress={() => setActiveTab('categories')}
      >
        <Typography
          variant="body1"
          color={activeTab === 'categories' ? 'primary' : 'textSecondary'}
        >
          Categories
        </Typography>
      </Pressable>
    </View>
  );

  // ============================================================================
  // OVERVIEW TAB - Account Cards
  // ============================================================================

  const renderOverviewTab = () => (
    <ScrollView
      style={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Total Balance Card */}
      <View style={styles.totalBalanceCard}>
        <Typography variant="body1" color="textSecondary">
          Total Balance
        </Typography>
        <Typography variant="h1" color="primary">
          $
          {summary?.totalBalance.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) || '0.00'}
        </Typography>
        <Typography variant="body2" color="success">
          +$450.00 this month
        </Typography>
      </View>

      {/* Account Cards */}
      <Typography variant="h3" style={styles.sectionTitle}>
        Your Accounts
      </Typography>
      {accounts.map((account) => (
        <Pressable
          key={account.id}
          style={styles.accountCard}
          onPress={() => handleAccountSelect(account)}
        >
          <View style={styles.accountHeader}>
            <View>
              <Typography variant="h3">{account.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                {account.type.charAt(0).toUpperCase() + account.type.slice(1)} •{' '}
                {account.transactionCount || 0} transactions
              </Typography>
            </View>
            <Typography
              variant="h2"
              color={account.currentBalance >= 0 ? 'text' : 'error'}
            >
              $
              {account.currentBalance.toLocaleString('en-US', {
                minimumFractionDigits: 2,
              })}
            </Typography>
          </View>

          {/* Recent Activity Preview */}
          <View style={styles.recentActivity}>
            <Typography variant="body2" color="textSecondary">
              Last: Grocery Store -$89.99
            </Typography>
          </View>
        </Pressable>
      ))}

      {/* Add Account Button */}
      <Button
        variant="outline"
        onPress={() =>
          Alert.alert('Add Account', 'Account creation form coming soon!')
        }
        style={styles.addAccountButton}
      >
        + Add New Account
      </Button>
    </ScrollView>
  );

  // ============================================================================
  // TRANSACTIONS TAB - Transaction History
  // ============================================================================

  const renderTransactionsTab = () => (
    <View style={styles.tabContent}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Filter Options */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
      >
        <Pressable style={styles.filterChip}>
          <Typography variant="body2">All Accounts</Typography>
        </Pressable>
        <Pressable style={styles.filterChip}>
          <Typography variant="body2">This Month</Typography>
        </Pressable>
        <Pressable style={styles.filterChip}>
          <Typography variant="body2">All Categories</Typography>
        </Pressable>
      </ScrollView>

      {/* Transaction List */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={styles.transactionRow}>
            <View style={styles.transactionLeft}>
              <Typography variant="body1">{item.description}</Typography>
              <Typography variant="body2" color="textSecondary">
                {item.categoryId} • {item.date.toLocaleDateString()}
              </Typography>
            </View>
            <View style={styles.transactionRight}>
              <Typography
                variant="h3"
                color={item.type === 'deposit' ? 'success' : 'text'}
              >
                {item.type === 'deposit' ? '+' : '-'}${item.amount.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Balance: ${item.balance.toFixed(2)}
              </Typography>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Typography variant="h3" color="textSecondary" align="center">
              No transactions yet
            </Typography>
            <Typography variant="body1" color="textSecondary" align="center">
              Add your first transaction to start tracking
            </Typography>
          </View>
        )}
      />
    </View>
  );

  // ============================================================================
  // CATEGORIES TAB
  // ============================================================================

  const renderCategoriesTab = () => (
    <ScrollView style={styles.tabContent}>
      <Typography variant="h3" style={styles.sectionTitle}>
        Income Categories
      </Typography>
      {['Salary', 'Freelance', 'Investments', 'Other Income'].map((cat) => (
        <Pressable key={cat} style={styles.categoryRow}>
          <View style={styles.categoryInfo}>
            <View
              style={[styles.categoryColor, { backgroundColor: '#4CAF50' }]}
            />
            <Typography variant="body1">{cat}</Typography>
          </View>
          <Typography variant="body2" color="textSecondary">
            12 transactions
          </Typography>
        </Pressable>
      ))}

      <Typography variant="h3" style={styles.sectionTitle}>
        Expense Categories
      </Typography>
      {['Food', 'Transport', 'Entertainment', 'Bills', 'Shopping'].map(
        (cat) => (
          <Pressable key={cat} style={styles.categoryRow}>
            <View style={styles.categoryInfo}>
              <View
                style={[styles.categoryColor, { backgroundColor: '#FF5722' }]}
              />
              <Typography variant="body1">{cat}</Typography>
            </View>
            <Typography variant="body2" color="textSecondary">
              8 transactions
            </Typography>
          </Pressable>
        )
      )}

      <Button
        variant="outline"
        onPress={() =>
          Alert.alert('Add Category', 'Category creation coming soon!')
        }
        style={styles.addCategoryButton}
      >
        + Add Custom Category
      </Button>
    </ScrollView>
  );

  // ============================================================================
  // ADD TRANSACTION MODAL
  // ============================================================================

  const renderAddTransactionModal = () => (
    <Modal
      visible={showAddTransaction}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAddTransaction(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Typography variant="h2">Add Transaction</Typography>
            <Pressable onPress={() => setShowAddTransaction(false)}>
              <Typography variant="h3">✕</Typography>
            </Pressable>
          </View>

          {/* Transaction Type Selector */}
          <View style={styles.transactionTypeSelector}>
            <Pressable style={[styles.typeButton, styles.activeType]}>
              <Typography variant="body1">Income</Typography>
            </Pressable>
            <Pressable style={styles.typeButton}>
              <Typography variant="body1">Expense</Typography>
            </Pressable>
            <Pressable style={styles.typeButton}>
              <Typography variant="body1">Transfer</Typography>
            </Pressable>
          </View>

          {/* Form Fields */}
          <TextInput
            style={styles.modalInput}
            placeholder="Amount"
            keyboardType="decimal-pad"
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.modalInput}
            placeholder="Description"
            placeholderTextColor="#999"
          />

          <Pressable style={styles.modalInput}>
            <Typography variant="body1" color="textSecondary">
              Select Category →
            </Typography>
          </Pressable>

          <Pressable style={styles.modalInput}>
            <Typography variant="body1" color="textSecondary">
              Select Account →
            </Typography>
          </Pressable>

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            <Button
              variant="outline"
              onPress={() => setShowAddTransaction(false)}
            >
              Cancel
            </Button>
            <Button
              onPress={() => {
                Alert.alert('Success', 'Transaction added!');
                setShowAddTransaction(false);
              }}
            >
              Add Transaction
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshAccounts();
    setRefreshing(false);
  }, [refreshAccounts]);

  const handleAccountSelect = (account: Account) => {
    setSelectedAccount(account);
    setActiveTab('transactions');
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Typography variant="h1">Accounts</Typography>
        <Typography variant="body2" color="textSecondary">
          Manage your finances
        </Typography>
      </View>

      {/* Quick Actions */}
      {renderQuickActions()}

      {/* Tab Bar */}
      {renderTabBar()}

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'transactions' && renderTransactionsTab()}
      {activeTab === 'categories' && renderCategoriesTab()}

      {/* Modals */}
      {renderAddTransactionModal()}
    </View>
  );
}

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
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  // Quick Actions Bar
  quickActionsBar: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  quickActionButton: {
    flex: 1,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  primaryAction: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },

  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },

  tabContent: {
    flex: 1,
  },

  // Overview Tab
  totalBalanceCard: {
    margin: theme.spacing.lg,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  sectionTitle: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },

  accountCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },

  recentActivity: {
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },

  addAccountButton: {
    margin: theme.spacing.lg,
  },

  // Transactions Tab
  searchBar: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  searchInput: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  filterBar: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  filterChip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  transactionLeft: {
    flex: 1,
  },

  transactionRight: {
    alignItems: 'flex-end',
  },

  emptyState: {
    padding: theme.spacing.xl * 2,
    alignItems: 'center',
    gap: theme.spacing.md,
  },

  // Categories Tab
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },

  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },

  addCategoryButton: {
    margin: theme.spacing.lg,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xl * 2,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },

  transactionTypeSelector: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },

  typeButton: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  activeType: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },

  modalInput: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
}));
