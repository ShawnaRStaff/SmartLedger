/**
 * SmartLedger Check Register - Account Management Screen
 * Main screen for managing user accounts with CRUD operations
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
  RefreshControl,
  Modal
} from 'react-native';
import { Typography, createThemedStyles } from '@/design-system';
import { useAccounts } from '../../hooks/useAccounts';
import { AccountCard } from '../presentational/AccountCard';
import { AccountForm } from '../presentational/AccountForm';
import type { 
  Account, 
  CreateAccountInput, 
  UpdateAccountInput,
  AccountType 
} from '../../types';

// ============================================================================
// INTERFACES
// ============================================================================

export interface AccountManagementScreenProps {
  userId: string;
  onAccountSelect?: (account: Account) => void;
  testID?: string;
}

interface ScreenState {
  showCreateModal: boolean;
  showEditModal: boolean;
  selectedAccount: Account | null;
  showFilters: boolean;
  refreshing: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AccountManagementScreen: React.FC<AccountManagementScreenProps> = ({
  userId,
  onAccountSelect,
  testID = 'account-management-screen'
}) => {
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'tint');

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [screenState, setScreenState] = useState<ScreenState>({
    showCreateModal: false,
    showEditModal: false,
    selectedAccount: null,
    showFilters: false,
    refreshing: false
  });

  const {
    accounts,
    summary,
    loading,
    error,
    initialized,
    createAccount,
    updateAccount,
    deleteAccount,
    refreshAccounts,
    filterAccounts,
    searchAccounts,
    clearFilters,
    initializeUser,
    clearError
  } = useAccounts({
    userId,
    autoRefresh: true,
    onAccountCreated: (account) => {
      console.log('Account created:', account.name);
    },
    onAccountUpdated: (account) => {
      console.log('Account updated:', account.name);
    },
    onAccountDeleted: (accountId) => {
      console.log('Account deleted:', accountId);
    },
    onError: (error) => {
      Alert.alert('Error', error);
    }
  });

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleCreateAccount = useCallback(async (accountData: CreateAccountInput) => {
    const newAccount = await createAccount(accountData);
    if (newAccount) {
      setScreenState(prev => ({ ...prev, showCreateModal: false }));
      Alert.alert('Success', 'Account created successfully!');
    }
  }, [createAccount]);

  const handleUpdateAccount = useCallback(async (updates: UpdateAccountInput) => {
    if (!screenState.selectedAccount) return;

    const updatedAccount = await updateAccount(screenState.selectedAccount.id, updates);
    if (updatedAccount) {
      setScreenState(prev => ({ 
        ...prev, 
        showEditModal: false, 
        selectedAccount: null 
      }));
      Alert.alert('Success', 'Account updated successfully!');
    }
  }, [updateAccount, screenState.selectedAccount]);

  const handleDeleteAccount = useCallback((account: Account) => {
    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete "${account.name}"? This action cannot be undone.`,
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
          }
        }
      ]
    );
  }, [deleteAccount]);

  const handleAccountPress = useCallback((account: Account) => {
    if (onAccountSelect) {
      onAccountSelect(account);
    } else {
      // Default behavior: show account details or edit
      setScreenState(prev => ({ 
        ...prev, 
        selectedAccount: account, 
        showEditModal: true 
      }));
    }
  }, [onAccountSelect]);

  const handleEditAccount = useCallback((account: Account) => {
    setScreenState(prev => ({ 
      ...prev, 
      selectedAccount: account, 
      showEditModal: true 
    }));
  }, []);

  const handleRefresh = useCallback(async () => {
    setScreenState(prev => ({ ...prev, refreshing: true }));
    await refreshAccounts();
    setScreenState(prev => ({ ...prev, refreshing: false }));
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
          }
        }
      ]
    );
  }, [initializeUser]);

  const handleCloseModals = useCallback(() => {
    setScreenState(prev => ({
      ...prev,
      showCreateModal: false,
      showEditModal: false,
      selectedAccount: null
    }));
  }, []);

  // ============================================================================
  // FILTER HANDLERS
  // ============================================================================

  const handleFilterByType = useCallback((type: AccountType) => {
    filterAccounts({ types: [type] });
  }, [filterAccounts]);

  const handleShowActiveOnly = useCallback(() => {
    filterAccounts({ statuses: ['active'] });
  }, [filterAccounts]);

  const handleClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderAccountItem = ({ item: account }: { item: Account }) => (
    <AccountCard
      account={account}
      onPress={handleAccountPress}
      onEdit={handleEditAccount}
      onDelete={handleDeleteAccount}
      showActions={true}
      testID={`${testID}-account-${account.id}`}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <ThemedText style={[styles.emptyStateTitle, { color: textColor }]}>
        No Accounts Found
      </ThemedText>
      <ThemedText style={[styles.emptyStateMessage, { color: secondaryTextColor }]}>
        {!initialized 
          ? 'Get started by initializing your account with default settings.'
          : 'Create your first account to start tracking your finances.'
        }
      </ThemedText>
      {!initialized ? (
        <Pressable
          style={[styles.initializeButton, { backgroundColor: primaryColor }]}
          onPress={handleInitializeUser}
          testID={`${testID}-initialize`}
        >
          <ThemedText style={styles.initializeButtonText}>
            Initialize Account
          </ThemedText>
        </Pressable>
      ) : (
        <Pressable
          style={[styles.createButton, { backgroundColor: primaryColor }]}
          onPress={() => setScreenState(prev => ({ ...prev, showCreateModal: true }))}
          testID={`${testID}-create-first`}
        >
          <ThemedText style={styles.createButtonText}>
            Create Account
          </ThemedText>
        </Pressable>
      )}
    </View>
  );

  const renderSummaryCard = () => {
    if (!summary) return null;

    return (
      <View style={[styles.summaryCard, { backgroundColor: cardBackgroundColor, borderColor }]}>
        <ThemedText style={styles.summaryTitle}>Account Summary</ThemedText>
        
        <View style={styles.summaryRow}>
          <ThemedText style={[styles.summaryLabel, { color: secondaryTextColor }]}>
            Total Balance
          </ThemedText>
          <ThemedText style={[styles.summaryAmount, { color: primaryColor }]}>
            ${summary.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </ThemedText>
        </View>
        
        <View style={styles.summaryRow}>
          <ThemedText style={[styles.summaryLabel, { color: secondaryTextColor }]}>
            Active Accounts
          </ThemedText>
          <ThemedText style={[styles.summaryValue, { color: textColor }]}>
            {summary.activeAccounts} of {summary.totalAccounts}
          </ThemedText>
        </View>
      </View>
    );
  };

  const renderFilterBar = () => (
    <View style={[styles.filterBar, { backgroundColor: cardBackgroundColor, borderColor }]}>
      <Pressable
        style={[styles.filterButton, { borderColor }]}
        onPress={handleShowActiveOnly}
        testID={`${testID}-filter-active`}
      >
        <ThemedText style={[styles.filterButtonText, { color: primaryColor }]}>
          Active Only
        </ThemedText>
      </Pressable>
      
      <Pressable
        style={[styles.filterButton, { borderColor }]}
        onPress={() => handleFilterByType('checking')}
        testID={`${testID}-filter-checking`}
      >
        <ThemedText style={[styles.filterButtonText, { color: primaryColor }]}>
          Checking
        </ThemedText>
      </Pressable>
      
      <Pressable
        style={[styles.filterButton, { borderColor }]}
        onPress={() => handleFilterByType('savings')}
        testID={`${testID}-filter-savings`}
      >
        <ThemedText style={[styles.filterButtonText, { color: primaryColor }]}>
          Savings
        </ThemedText>
      </Pressable>
      
      <Pressable
        style={[styles.filterButton, { borderColor }]}
        onPress={handleClearFilters}
        testID={`${testID}-clear-filters`}
      >
        <ThemedText style={[styles.clearFilterText, { color: secondaryTextColor }]}>
          Clear
        </ThemedText>
      </Pressable>
    </View>
  );

  const renderError = () => {
    if (!error) return null;

    return (
      <View style={[styles.errorContainer, { backgroundColor: '#FFEBEE', borderColor: '#F44336' }]}>
        <ThemedText style={[styles.errorText, { color: '#D32F2F' }]}>
          {error}
        </ThemedText>
        <Pressable
          style={styles.errorDismiss}
          onPress={clearError}
          testID={`${testID}-dismiss-error`}
        >
          <ThemedText style={[styles.errorDismissText, { color: '#D32F2F' }]}>
            Dismiss
          </ThemedText>
        </Pressable>
      </View>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <ThemedText style={styles.headerTitle}>Account Management</ThemedText>
        
        {initialized && accounts.length > 0 && (
          <Pressable
            style={[styles.addButton, { backgroundColor: primaryColor }]}
            onPress={() => setScreenState(prev => ({ ...prev, showCreateModal: true }))}
            testID={`${testID}-add-account`}
          >
            <ThemedText style={styles.addButtonText}>+ Add</ThemedText>
          </Pressable>
        )}
      </View>

      {/* Error Display */}
      {renderError()}

      {/* Summary Card */}
      {summary && renderSummaryCard()}

      {/* Filter Bar */}
      {accounts.length > 0 && renderFilterBar()}

      {/* Account List */}
      <FlatList
        data={accounts}
        renderItem={renderAccountItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          accounts.length === 0 && styles.emptyListContent
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={screenState.refreshing}
            onRefresh={handleRefresh}
            tintColor={primaryColor}
          />
        }
        showsVerticalScrollIndicator={false}
        testID={`${testID}-list`}
      />

      {/* Create Account Modal */}
      <Modal
        visible={screenState.showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModals}
      >
        <AccountForm
          onSubmit={handleCreateAccount}
          onCancel={handleCloseModals}
          loading={loading}
          testID={`${testID}-create-form`}
        />
      </Modal>

      {/* Edit Account Modal */}
      <Modal
        visible={screenState.showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModals}
      >
        {screenState.selectedAccount && (
          <AccountForm
            account={screenState.selectedAccount}
            onSubmit={handleUpdateAccount}
            onCancel={handleCloseModals}
            loading={loading}
            testID={`${testID}-edit-form`}
          />
        )}
      </Modal>
    </ThemedView>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  errorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  
  errorText: {
    flex: 1,
    fontSize: 14,
  },
  
  errorDismiss: {
    marginLeft: 12,
  },
  
  errorDismissText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  summaryCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  summaryLabel: {
    fontSize: 14,
  },
  
  summaryAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  filterBar: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    gap: 8,
  },
  
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 6,
  },
  
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  clearFilterText: {
    fontSize: 12,
  },
  
  list: {
    flex: 1,
  },
  
  listContent: {
    padding: 16,
  },
  
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  
  emptyStateMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  
  initializeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  
  initializeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AccountManagementScreen;