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
  RefreshControl,
  FlatList,
  Text,
  TouchableOpacity,
  useColorScheme,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Button, createThemedStyles } from '@/design-system';
import { ProfessionalAlert } from '@/components/ui/ProfessionalAlert';
import { useAuth } from '@/context/auth/AuthContext';
import { useAccounts } from '../../hooks/useAccounts';
import {
  useTransactionForm,
  useAccountsForTransaction,
} from '../../hooks/useTransaction';
import type { Account, Transaction, TransactionType } from '../../types';

// ============================================================================
// PROFESSIONAL COLOR PALETTE
// ============================================================================

const COLORS = {
  // Primary Colors
  accent: '#1976D2',
  accentDark: '#0D47A1',
  forest: '#2E7D32',
  darkForest: '#1B5E20',

  // Status Colors
  success: '#2E7D32',
  error: '#C62828',

  // Light Mode Colors
  textPrimary: '#263238',
  textSecondary: '#546E7A',

  // Dark Mode Colors
  darkSurface: '#1E1E1E',
  darkTextPrimary: '#FFFFFF',
  darkTextSecondary: '#B0B0B0',

  // Glass Effects
  shadow: 'rgba(0, 0, 0, 0.08)',
};

// ============================================================================
// MAIN ACCOUNTS SCREEN - Financial Command Center
// ============================================================================

export default function AccountsMainScreen() {
  const { user } = useAuth();
  const styles = useStyles();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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

  // Transaction Form Management
  const transactionForm = useTransactionForm({
    validateOnChange: true,
    initialData: {
      date: new Date(),
      status: 'pending',
    },
  });

  const { accounts: accountsForTransaction, loading: accountsLoading } =
    useAccountsForTransaction();

  // Transaction type selection
  const [selectedTransactionType, setSelectedTransactionType] =
    useState<TransactionType>('deposit');

  // Transaction handlers
  const handleTransactionTypeSelect = (type: TransactionType) => {
    setSelectedTransactionType(type);
    transactionForm.setValue('type', type);
  };

  const handleCreateTransaction = async () => {
    const result = await transactionForm.createTransaction();
    if (result.success) {
      ProfessionalAlert.success('Success!', 'Transaction added successfully');
      setShowAddTransaction(false);
      refreshAccounts(); // Refresh account data to show updated balances
    } else {
      ProfessionalAlert.error(
        'Error',
        result.error || 'Failed to create transaction'
      );
    }
  };

  // Create default category if none selected (temporary solution)
  const defaultCategories = [
    { id: 'income', name: 'Income', color: '#2E7D32' },
    { id: 'food', name: 'Food', color: '#FF9800' },
    { id: 'transport', name: 'Transport', color: '#2196F3' },
    { id: 'entertainment', name: 'Entertainment', color: '#9C27B0' },
    { id: 'utilities', name: 'Utilities', color: '#607D8B' },
    { id: 'other', name: 'Other', color: '#795548' },
  ];

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
        onPress={() =>
          ProfessionalAlert.alert('Export', 'Export feature coming soon!')
        }
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
          ProfessionalAlert.alert(
            'Add Account',
            'Account creation form coming soon!'
          )
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
          ProfessionalAlert.alert(
            'Add Category',
            'Category creation coming soon!'
          )
        }
        style={styles.addCategoryButton}
      >
        + Add Custom Category
      </Button>
    </ScrollView>
  );

  // ============================================================================
  // PROFESSIONAL ADD TRANSACTION MODAL
  // ============================================================================

  const renderAddTransactionModal = () => (
    <Modal
      visible={showAddTransaction}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAddTransaction(false)}
    >
      <TouchableOpacity
        style={[
          styles.modalOverlay,
          {
            backgroundColor: isDark
              ? 'rgba(0, 0, 0, 0.8)'
              : 'rgba(0, 0, 0, 0.5)',
          },
        ]}
        activeOpacity={1}
        onPress={() => setShowAddTransaction(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {}} // Prevent dismiss when tapping modal content
        >
          <View
            style={[
              styles.professionalModalContainer,
              { backgroundColor: isDark ? COLORS.darkSurface : 'white' },
            ]}
          >
            {/* Professional Header with LinearGradient */}
            <LinearGradient
              colors={[COLORS.forest, COLORS.darkForest]}
              style={styles.professionalModalHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.professionalHeaderContent}>
                <TouchableOpacity
                  onPress={() => setShowAddTransaction(false)}
                  style={styles.professionalCloseButton}
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
                <View style={styles.professionalHeaderCenter}>
                  <View style={styles.professionalHeaderIcon}>
                    <Ionicons name="add-circle" size={32} color="white" />
                  </View>
                  <Text style={styles.professionalModalTitle}>
                    Add Transaction
                  </Text>
                  <Text style={styles.professionalModalSubtitle}>
                    Record your income or expense
                  </Text>
                </View>
                <View style={styles.headerSpacer} />
              </View>
            </LinearGradient>

            {/* Modal Body */}
            <View
              style={[
                styles.professionalModalBody,
                { backgroundColor: isDark ? COLORS.darkSurface : 'white' },
              ]}
            >
              {/* Transaction Type Selector */}
              <View style={styles.transactionTypeSelector}>
                <Pressable
                  style={[
                    styles.typeButton,
                    selectedTransactionType === 'deposit' && styles.activeType,
                  ]}
                  onPress={() => handleTransactionTypeSelect('deposit')}
                >
                  <Ionicons
                    name="arrow-down"
                    size={18}
                    color={
                      selectedTransactionType === 'deposit'
                        ? 'white'
                        : isDark
                          ? COLORS.darkTextSecondary
                          : '#666'
                    }
                  />
                  <Text
                    style={[
                      selectedTransactionType === 'deposit'
                        ? styles.activeTypeText
                        : styles.typeButtonText,
                      selectedTransactionType !== 'deposit' && {
                        color: isDark
                          ? COLORS.darkTextSecondary
                          : COLORS.textSecondary,
                      },
                    ]}
                  >
                    Income
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.typeButton,
                    selectedTransactionType === 'withdrawal' &&
                      styles.activeType,
                  ]}
                  onPress={() => handleTransactionTypeSelect('withdrawal')}
                >
                  <Ionicons
                    name="arrow-up"
                    size={18}
                    color={
                      selectedTransactionType === 'withdrawal'
                        ? 'white'
                        : isDark
                          ? COLORS.darkTextSecondary
                          : '#666'
                    }
                  />
                  <Text
                    style={[
                      selectedTransactionType === 'withdrawal'
                        ? styles.activeTypeText
                        : styles.typeButtonText,
                      selectedTransactionType !== 'withdrawal' && {
                        color: isDark
                          ? COLORS.darkTextSecondary
                          : COLORS.textSecondary,
                      },
                    ]}
                  >
                    Expense
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.typeButton,
                    selectedTransactionType === 'transfer' && styles.activeType,
                  ]}
                  onPress={() => handleTransactionTypeSelect('transfer')}
                >
                  <Ionicons
                    name="swap-horizontal"
                    size={18}
                    color={
                      selectedTransactionType === 'transfer'
                        ? 'white'
                        : isDark
                          ? COLORS.darkTextSecondary
                          : '#666'
                    }
                  />
                  <Text
                    style={[
                      selectedTransactionType === 'transfer'
                        ? styles.activeTypeText
                        : styles.typeButtonText,
                      selectedTransactionType !== 'transfer' && {
                        color: isDark
                          ? COLORS.darkTextSecondary
                          : COLORS.textSecondary,
                      },
                    ]}
                  >
                    Transfer
                  </Text>
                </Pressable>
              </View>

              {/* Form Fields with Professional Styling */}
              <View style={styles.professionalFormFields}>
                <View style={styles.professionalInputGroup}>
                  <Text
                    style={[
                      styles.professionalInputLabel,
                      {
                        color: isDark
                          ? COLORS.darkTextPrimary
                          : COLORS.textPrimary,
                      },
                    ]}
                  >
                    Amount *
                  </Text>
                  <TextInput
                    style={[
                      styles.professionalInput,
                      {
                        backgroundColor: isDark
                          ? COLORS.darkSurface
                          : '#F8F9FA',
                        color: isDark ? COLORS.darkTextPrimary : '#263238',
                      },
                      transactionForm.errors.amount && {
                        borderColor: COLORS.error,
                        borderWidth: 1,
                      },
                    ]}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    value={transactionForm.formData.amount}
                    onChangeText={(text) => {
                      // Format as user types
                      const formatted = transactionForm.formatAmount(text);
                      transactionForm.setValue('amount', formatted);
                    }}
                    placeholderTextColor={
                      isDark ? COLORS.darkTextSecondary : '#999'
                    }
                  />
                  {transactionForm.errors.amount && (
                    <Text style={[styles.errorText, { color: COLORS.error }]}>
                      {transactionForm.errors.amount}
                    </Text>
                  )}
                </View>

                <View style={styles.professionalInputGroup}>
                  <Text
                    style={[
                      styles.professionalInputLabel,
                      {
                        color: isDark
                          ? COLORS.darkTextPrimary
                          : COLORS.textPrimary,
                      },
                    ]}
                  >
                    Description *
                  </Text>
                  <TextInput
                    style={[
                      styles.professionalInput,
                      {
                        backgroundColor: isDark
                          ? COLORS.darkSurface
                          : '#F8F9FA',
                        color: isDark ? COLORS.darkTextPrimary : '#263238',
                      },
                      transactionForm.errors.description && {
                        borderColor: COLORS.error,
                        borderWidth: 1,
                      },
                    ]}
                    placeholder="What was this for?"
                    value={transactionForm.formData.description}
                    onChangeText={(text) =>
                      transactionForm.setValue('description', text)
                    }
                    placeholderTextColor={
                      isDark ? COLORS.darkTextSecondary : '#999'
                    }
                  />
                  {transactionForm.errors.description && (
                    <Text style={[styles.errorText, { color: COLORS.error }]}>
                      {transactionForm.errors.description}
                    </Text>
                  )}
                </View>

                <View style={styles.professionalInputGroup}>
                  <Text
                    style={[
                      styles.professionalInputLabel,
                      {
                        color: isDark
                          ? COLORS.darkTextPrimary
                          : COLORS.textPrimary,
                      },
                    ]}
                  >
                    Category
                  </Text>
                  <Pressable
                    style={[
                      styles.professionalInput,
                      styles.professionalSelector,
                      {
                        backgroundColor: isDark
                          ? COLORS.darkSurface
                          : '#F8F9FA',
                      },
                      transactionForm.errors.categoryId && {
                        borderColor: COLORS.error,
                        borderWidth: 1,
                      },
                    ]}
                    onPress={() => {
                      // For now, just set a default category based on transaction type
                      const defaultCategory =
                        selectedTransactionType === 'deposit'
                          ? 'income'
                          : 'other';
                      transactionForm.setValue('categoryId', defaultCategory);
                    }}
                  >
                    <Text
                      style={[
                        styles.professionalSelectorText,
                        {
                          color: transactionForm.formData.categoryId
                            ? isDark
                              ? COLORS.darkTextPrimary
                              : COLORS.textPrimary
                            : isDark
                              ? COLORS.darkTextSecondary
                              : COLORS.textSecondary,
                        },
                      ]}
                    >
                      {transactionForm.formData.categoryId
                        ? defaultCategories.find(
                            (cat) =>
                              cat.id === transactionForm.formData.categoryId
                          )?.name || 'Select Category'
                        : 'Select Category'}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={isDark ? COLORS.darkTextSecondary : '#999'}
                    />
                  </Pressable>
                  {transactionForm.errors.categoryId && (
                    <Text style={[styles.errorText, { color: COLORS.error }]}>
                      {transactionForm.errors.categoryId}
                    </Text>
                  )}
                </View>

                <View style={styles.professionalInputGroup}>
                  <Text
                    style={[
                      styles.professionalInputLabel,
                      {
                        color: isDark
                          ? COLORS.darkTextPrimary
                          : COLORS.textPrimary,
                      },
                    ]}
                  >
                    Account
                  </Text>
                  <Pressable
                    style={[
                      styles.professionalInput,
                      styles.professionalSelector,
                      {
                        backgroundColor: isDark
                          ? COLORS.darkSurface
                          : '#F8F9FA',
                      },
                      transactionForm.errors.accountId && {
                        borderColor: COLORS.error,
                        borderWidth: 1,
                      },
                    ]}
                    onPress={() => {
                      // Set first account as default if available
                      if (
                        accountsForTransaction.length > 0 &&
                        !transactionForm.formData.accountId
                      ) {
                        transactionForm.setValue(
                          'accountId',
                          accountsForTransaction[0].id
                        );
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.professionalSelectorText,
                        {
                          color: transactionForm.formData.accountId
                            ? isDark
                              ? COLORS.darkTextPrimary
                              : COLORS.textPrimary
                            : isDark
                              ? COLORS.darkTextSecondary
                              : COLORS.textSecondary,
                        },
                      ]}
                    >
                      {transactionForm.formData.accountId
                        ? accountsForTransaction.find(
                            (acc) =>
                              acc.id === transactionForm.formData.accountId
                          )?.name || 'Select Account'
                        : accountsLoading
                          ? 'Loading accounts...'
                          : 'Select Account'}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={isDark ? COLORS.darkTextSecondary : '#999'}
                    />
                  </Pressable>
                  {transactionForm.errors.accountId && (
                    <Text style={[styles.errorText, { color: COLORS.error }]}>
                      {transactionForm.errors.accountId}
                    </Text>
                  )}
                </View>
              </View>

              {/* Professional Action Buttons */}
              <View style={styles.professionalModalActions}>
                <TouchableOpacity
                  style={styles.professionalActionButton}
                  onPress={() => setShowAddTransaction(false)}
                >
                  <LinearGradient
                    colors={
                      isDark
                        ? [COLORS.darkSurface, COLORS.darkSurface]
                        : ['#F5F5F5', '#EEEEEE']
                    }
                    style={styles.professionalButtonGradient}
                  >
                    <Ionicons
                      name="close"
                      size={18}
                      color={isDark ? COLORS.darkTextPrimary : '#666'}
                    />
                    <Text
                      style={[
                        styles.professionalCancelText,
                        {
                          color: isDark ? COLORS.darkTextPrimary : '#666',
                        },
                      ]}
                    >
                      Cancel
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.professionalActionButton,
                    transactionForm.isSubmitting && { opacity: 0.7 },
                  ]}
                  onPress={handleCreateTransaction}
                  disabled={
                    transactionForm.isSubmitting || !transactionForm.isValid
                  }
                >
                  <LinearGradient
                    colors={[COLORS.forest, COLORS.darkForest]}
                    style={styles.professionalButtonGradient}
                  >
                    {transactionForm.isSubmitting ? (
                      <Ionicons
                        name="hourglass-outline"
                        size={18}
                        color="white"
                      />
                    ) : (
                      <Ionicons name="checkmark" size={18} color="white" />
                    )}
                    <Text style={styles.professionalSubmitText}>
                      {transactionForm.isSubmitting
                        ? 'Adding...'
                        : 'Add Transaction'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
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

  // Professional Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  professionalModalContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 15,
      },
    }),
  },

  professionalModalHeader: {
    paddingVertical: 25,
    paddingHorizontal: 20,
  },

  professionalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  professionalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  professionalHeaderCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },

  professionalHeaderIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  professionalModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
    textAlign: 'center',
  },

  professionalModalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },

  headerSpacer: {
    width: 40,
  },

  professionalModalBody: {
    padding: 20,
  },

  transactionTypeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },

  typeButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  activeType: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },

  activeTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },

  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },

  professionalFormFields: {
    gap: 16,
    marginBottom: 20,
  },

  professionalInputGroup: {
    gap: 8,
  },

  professionalInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },

  professionalInput: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  professionalSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  professionalSelectorText: {
    fontSize: 16,
  },

  professionalModalActions: {
    flexDirection: 'row',
    gap: 12,
  },

  professionalActionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },

  professionalButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  professionalCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },

  professionalSubmitText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  errorText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
}));
