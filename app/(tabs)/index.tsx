/**
 * SmartLedger - Home Tab (Dashboard)
 * Central financial overview and app hub
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Pressable,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { Typography, Button, createThemedStyles } from '@/design-system';
import { useAuth } from '@/context/auth/AuthContext';
import { useAccountSummary } from '../../src/features/check-register/hooks/useAccounts';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const styles = useStyles();
  const [refreshing, setRefreshing] = useState(false);

  const {
    summary,
    loading,
    error,
    refreshSummary,
    clearError
  } = useAccountSummary(user?.uid || '');

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshSummary();
    setRefreshing(false);
  }, [refreshSummary]);

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => signOut() }
      ]
    );
  };

  const navigateToAccounts = () => {
    router.push('/(tabs)/check-register');
  };

  const navigateToAddTransaction = () => {
    // TODO: Navigate to add transaction modal
    Alert.alert('Coming Soon', 'Add transaction feature coming soon!');
  };

  const navigateToTransferMoney = () => {
    // TODO: Navigate to transfer money modal
    Alert.alert('Coming Soon', 'Transfer money feature coming soon!');
  };

  const navigateToRecentActivity = () => {
    navigateToAccounts();
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderNetWorthCard = () => (
    <View style={styles.netWorthCard}>
      {error && (
        <Pressable onPress={clearError} style={styles.errorBanner}>
          <Typography variant="body2" color="error">
            ⚠️ Connection issue - Tap to retry
          </Typography>
        </Pressable>
      )}
      
      {summary ? (
        <>
          <View style={styles.netWorthHeader}>
            <Typography variant="body1" color="textSecondary">Net Worth</Typography>
            <Typography variant="body2" color="success">+2.3% this month</Typography>
          </View>
          
          <Typography variant="h1" color="primary" style={styles.netWorthAmount}>
            ${summary.totalBalance.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            })}
          </Typography>
          
          <View style={styles.netWorthBreakdown}>
            <View style={styles.balanceItem}>
              <Typography variant="body2" color="textSecondary">Assets</Typography>
              <Typography variant="h3" color="success">
                ${(summary.totalBalance + 25000).toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </Typography>
            </View>
            <View style={styles.balanceItem}>
              <Typography variant="body2" color="textSecondary">Debts</Typography>
              <Typography variant="h3" color="error">
                $25,000
              </Typography>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.netWorthPlaceholder}>
          <Typography variant="body1" color="textSecondary" align="center">
            {loading ? '💰 Calculating your net worth...' : '🎯 Ready to track your wealth?'}
          </Typography>
          {!loading && (
            <Button onPress={navigateToAccounts} size="sm" variant="outline">
              Start Financial Journey
            </Button>
          )}
        </View>
      )}
    </View>
  );

  const renderAccountsSnapshot = () => (
    <View style={styles.accountsCard}>
      <View style={styles.cardHeader}>
        <Typography variant="h3">Accounts</Typography>
        <Pressable onPress={navigateToAccounts} style={styles.viewAllButton}>
          <Typography variant="body2" color="primary">View All →</Typography>
        </Pressable>
      </View>
      
      {summary && summary.totalAccounts > 0 ? (
        <View style={styles.accountsGrid}>
          {Object.entries(summary.accountsByType).map(([type, count]) => {
            if (count === 0) return null;
            
            const typeIcons = {
              checking: '🏦',
              savings: '💰',
              credit: '💳',
              cash: '💵',
              investment: '📈',
              other: '📁'
            };
            
            const typeColors = {
              checking: '#4A90E2',
              savings: '#7ED321',
              credit: '#F5A623',
              cash: '#50E3C2',
              investment: '#B8E986',
              other: '#9013FE'
            };
            
            return (
              <Pressable key={type} style={[styles.accountTypeCard, { borderLeftColor: typeColors[type as keyof typeof typeColors] }]} onPress={navigateToAccounts}>
                <View style={styles.accountTypeHeader}>
                  <Typography variant="h2">{typeIcons[type as keyof typeof typeIcons]}</Typography>
                  <Typography variant="h3">{count}</Typography>
                </View>
                <Typography variant="body2" color="textSecondary" style={styles.accountTypeLabel}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Typography>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyAccountsState}>
          <Typography variant="body1">🏪</Typography>
          <Typography variant="body2" color="textSecondary" align="center">
            Add your first account to see your financial picture
          </Typography>
        </View>
      )}
    </View>
  );

  const renderSmartActions = () => (
    <View style={styles.smartActionsCard}>
      <Typography variant="h3" style={styles.sectionTitle}>Smart Actions</Typography>
      
      <View style={styles.actionsGrid}>
        <Pressable style={[styles.actionCard, styles.primaryAction]} onPress={navigateToAddTransaction}>
          <View style={styles.actionHeader}>
            <View style={[styles.actionIcon, { backgroundColor: '#4A90E2' }]}>
              <Typography variant="h2" style={{ color: 'white' }}>💰</Typography>
            </View>
            <Typography variant="h3" color="primary">Add Transaction</Typography>
          </View>
          <Typography variant="body2" color="textSecondary">
            Record income, expense, or transfer
          </Typography>
        </Pressable>

        <Pressable style={styles.actionCard} onPress={navigateToTransferMoney}>
          <View style={styles.actionHeader}>
            <View style={[styles.actionIcon, { backgroundColor: '#7ED321' }]}>
              <Typography variant="h2" style={{ color: 'white' }}>🔄</Typography>
            </View>
            <Typography variant="h3">Transfer</Typography>
          </View>
          <Typography variant="body2" color="textSecondary">
            Move money between accounts
          </Typography>
        </Pressable>

        <Pressable style={styles.actionCard} onPress={navigateToRecentActivity}>
          <View style={styles.actionHeader}>
            <View style={[styles.actionIcon, { backgroundColor: '#F5A623' }]}>
              <Typography variant="h2" style={{ color: 'white' }}>📊</Typography>
            </View>
            <Typography variant="h3">Activity</Typography>
          </View>
          <Typography variant="body2" color="textSecondary">
            View recent transactions
          </Typography>
        </Pressable>

        <Pressable style={styles.actionCard} onPress={() => Alert.alert('Coming Soon', 'Budget tracking coming in Phase 2!')}>
          <View style={styles.actionHeader}>
            <View style={[styles.actionIcon, { backgroundColor: '#9013FE' }]}>
              <Typography variant="h2" style={{ color: 'white' }}>📊</Typography>
            </View>
            <Typography variant="h3">Budget</Typography>
          </View>
          <Typography variant="body2" color="textSecondary">
            Track spending & goals
          </Typography>
        </Pressable>

        <Pressable style={styles.actionCard} onPress={() => Alert.alert('Coming Soon', 'Savings goals coming in Phase 3!')}>
          <View style={styles.actionHeader}>
            <View style={[styles.actionIcon, { backgroundColor: '#50E3C2' }]}>
              <Typography variant="h2" style={{ color: 'white' }}>🎯</Typography>
            </View>
            <Typography variant="h3">Goals</Typography>
          </View>
          <Typography variant="body2" color="textSecondary">
            Save for the future
          </Typography>
        </Pressable>

        <Pressable style={styles.actionCard} onPress={() => Alert.alert('Coming Soon', 'Reports coming in Phase 4!')}>
          <View style={styles.actionHeader}>
            <View style={[styles.actionIcon, { backgroundColor: '#FF6B6B' }]}>
              <Typography variant="h2" style={{ color: 'white' }}>📈</Typography>
            </View>
            <Typography variant="h3">Reports</Typography>
          </View>
          <Typography variant="body2" color="textSecondary">
            Analyze your finances
          </Typography>
        </Pressable>
      </View>
    </View>
  );

  const renderFinancialInsights = () => (
    <View style={styles.insightsCard}>
      <View style={styles.cardHeader}>
        <Typography variant="h3">This Month</Typography>
        <Typography variant="body2" color="textSecondary">December 2024</Typography>
      </View>
      
      <View style={styles.insightsGrid}>
        <View style={styles.insightItem}>
          <View style={styles.insightIcon}>
            <Typography variant="h3">📈</Typography>
          </View>
          <View style={styles.insightContent}>
            <Typography variant="h3" color="success">+$2,340</Typography>
            <Typography variant="body2" color="textSecondary">Income this month</Typography>
          </View>
        </View>

        <View style={styles.insightItem}>
          <View style={styles.insightIcon}>
            <Typography variant="h3">📉</Typography>
          </View>
          <View style={styles.insightContent}>
            <Typography variant="h3" color="error">-$1,890</Typography>
            <Typography variant="body2" color="textSecondary">Expenses this month</Typography>
          </View>
        </View>

        <View style={styles.insightItem}>
          <View style={styles.insightIcon}>
            <Typography variant="h3">💡</Typography>
          </View>
          <View style={styles.insightContent}>
            <Typography variant="body1">You're saving 19% this month</Typography>
            <Typography variant="body2" color="success">Above your 15% goal! 🎉</Typography>
          </View>
        </View>

        <View style={styles.insightItem}>
          <View style={styles.insightIcon}>
            <Typography variant="h3">🔍</Typography>
          </View>
          <View style={styles.insightContent}>
            <Typography variant="body1">Top spending: Groceries</Typography>
            <Typography variant="body2" color="textSecondary">$456 • 24% of expenses</Typography>
          </View>
        </View>
      </View>
    </View>
  );

  const renderWelcomeMessage = () => {
    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    
    return (
      <View style={styles.welcomeSection}>
        <Typography variant="h2">
          {greeting}{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}! 👋
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Ready to take control of your finances today?
        </Typography>
      </View>
    );
  };

  const renderQuickStats = () => (
    <View style={styles.quickStatsRow}>
      <View style={styles.quickStatCard}>
        <Typography variant="h3" color="success">+$450</Typography>
        <Typography variant="body2" color="textSecondary">This Week</Typography>
      </View>
      <View style={styles.quickStatCard}>
        <Typography variant="h3" color="primary">3</Typography>
        <Typography variant="body2" color="textSecondary">Transactions</Typography>
      </View>
      <View style={styles.quickStatCard}>
        <Typography variant="h3" color="warning">$1,200</Typography>
        <Typography variant="body2" color="textSecondary">Left to Budget</Typography>
      </View>
    </View>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Typography variant="h1">SmartLedger</Typography>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.headerButton} onPress={handleLogout}>
            <Typography variant="body1">Sign Out</Typography>
          </Pressable>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderWelcomeMessage()}
        {renderQuickStats()}
        {renderNetWorthCard()}
        {renderAccountsSnapshot()}
        {renderSmartActions()}
        {renderFinancialInsights()}

        {/* Pro Tip */}
        <View style={styles.proTip}>
          <Typography variant="body2" color="textSecondary" align="center">
            💡 Tip: Use the Accounts tab to manage your finances
          </Typography>
        </View>
      </ScrollView>
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

  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },

  headerButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl * 2,
  },

  // Welcome Section
  welcomeSection: {
    marginBottom: theme.spacing.md,
  },

  // Quick Stats Row
  quickStatsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },

  quickStatCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  // Net Worth Card
  netWorthCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  errorBanner: {
    backgroundColor: theme.colors.error + '10',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },

  netWorthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },

  netWorthAmount: {
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 42,
  },

  netWorthBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  balanceItem: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },

  netWorthPlaceholder: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.md,
  },

  // Accounts Card
  accountsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },

  viewAllButton: {
    padding: theme.spacing.sm,
  },

  accountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },

  accountTypeCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    minWidth: '45%',
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  accountTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },

  accountTypeLabel: {
    fontSize: 12,
    fontWeight: '500',
  },

  emptyAccountsState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.sm,
  },

  // Smart Actions Card
  smartActionsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  sectionTitle: {
    marginBottom: theme.spacing.md,
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },

  actionCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    width: '48%',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  primaryAction: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '05',
  },

  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },

  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Insights Card
  insightsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  insightsGrid: {
    gap: theme.spacing.md,
  },

  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
  },

  insightIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
  },

  insightContent: {
    flex: 1,
    gap: theme.spacing.xs,
  },

  // Pro Tip
  proTip: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
}));