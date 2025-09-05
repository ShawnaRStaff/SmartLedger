/**
 * SmartLedger - Professional Dashboard
 * Stunning financial command center with modern UI
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Pressable,
  Dimensions,
  Animated,
  Platform,
  StyleSheet,
  Text,
  Modal,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth/AuthContext';
import { useAccountSummary } from '../../src/features/check-register/hooks/useAccounts';
import { ProfessionalAlert } from '@/components/ui/ProfessionalAlert';

const { width: screenWidth } = Dimensions.get('window');

// Professional Color Palette
const COLORS = {
  // Primary Colors
  navy: '#1A237E',
  darkNavy: '#0D47A1',
  lightNavy: '#3949AB',

  // Secondary Colors
  forest: '#2E7D32',
  darkForest: '#1B5E20',
  lightForest: '#43A047',

  // Accent Colors
  accent: '#1976D2',
  accentLight: '#42A5F5',
  accentDark: '#0D47A1',

  // Status Colors
  success: '#2E7D32',
  warning: '#F57C00',
  error: '#C62828',
  info: '#0288D1',

  // Light Mode Colors
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FAFBFC',
  text: '#263238',
  textPrimary: '#263238',
  textSecondary: '#546E7A',
  textTertiary: '#90A4AE',
  border: '#E0E0E0',
  borderLight: '#C0C0C0', // Lighter gray for better visibility

  // Dark Mode Colors
  darkBackground: '#121212',
  darkSurface: '#1E1E1E',
  darkSurfaceElevated: '#252525',
  darkTextPrimary: '#FFFFFF',
  darkTextSecondary: '#B0B0B0',
  darkTextTertiary: '#808080',
  darkBorder: '#333333',
  darkBorderLight: '#505050', // Lighter gray for better visibility in dark mode

  // Glass Effects
  glassWhite: 'rgba(255, 255, 255, 0.92)',
  glassLight: 'rgba(255, 255, 255, 0.85)',
  glassDark: 'rgba(26, 35, 126, 0.05)',
  shadow: 'rgba(0, 0, 0, 0.08)',
};

export default function ProfessionalHomeScreen() {
  const { user, signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [comingSoonModal, setComingSoonModal] = useState({
    visible: false,
    title: '',
    feature: '',
  });
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const { summary, loading, refreshSummary } = useAccountSummary(
    user?.uid || ''
  );

  // Entrance animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  // Continuous rotation for loading states
  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    if (loading) {
      animation.start();
    } else {
      animation.stop();
      rotateAnim.setValue(0);
    }
  }, [loading, rotateAnim]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshSummary();
    setRefreshing(false);
  }, [refreshSummary]);

  const showComingSoonModal = useCallback((title: string, feature: string) => {
    setComingSoonModal({ visible: true, title, feature });
  }, []);

  const hideComingSoonModal = useCallback(() => {
    setComingSoonModal({ visible: false, title: '', feature: '' });
  }, []);

  const handleLogout = async () => {
    ProfessionalAlert.confirm(
      'Sign Out',
      'Are you sure you want to sign out?',
      () => signOut(),
      () => {} // Cancel - do nothing
    );
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Format currency with professional styling
  const formatCurrency = (amount: number, showCents = false) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: showCents ? 2 : 0,
      maximumFractionDigits: showCents ? 2 : 0,
    }).format(amount);
  };

  // Get greeting based on time

  const renderHeader = () => (
    <LinearGradient
      colors={
        isDark
          ? [COLORS.darkSurface, COLORS.darkNavy]
          : [COLORS.navy, COLORS.darkNavy]
      }
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerContent}>
        <View>
          <Text
            style={[
              styles.greeting,
              {
                color: isDark
                  ? COLORS.darkTextSecondary
                  : 'rgba(255, 255, 255, 0.8)',
              },
            ]}
          >
            {getGreeting()}
          </Text>
          <Text
            style={[
              styles.userName,
              { color: isDark ? COLORS.darkTextPrimary : 'white' },
            ]}
          >
            {user?.displayName || 'Investor'}
          </Text>
        </View>
        <Pressable onPress={handleLogout} style={styles.profileButton}>
          <View
            style={[
              styles.profileAvatar,
              {
                backgroundColor: isDark
                  ? COLORS.darkBorder
                  : 'rgba(255, 255, 255, 0.2)',
              },
            ]}
          >
            <Text
              style={[
                styles.profileInitial,
                { color: isDark ? COLORS.darkTextPrimary : 'white' },
              ]}
            >
              {(user?.displayName || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
        </Pressable>
      </View>
    </LinearGradient>
  );

  const renderHeroCard = () => {
    const netWorth = summary?.totalBalance || 0;
    const assets = netWorth + 25000;
    const liabilities = 25000;
    const monthlyChange = 2.3;

    return (
      <Animated.View
        style={[
          styles.heroCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={
            isDark
              ? [COLORS.darkSurface, COLORS.darkSurfaceElevated]
              : [COLORS.surface, COLORS.surfaceElevated]
          }
          style={styles.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroHeader}>
            <View>
              <Text
                style={[
                  styles.heroLabel,
                  {
                    color: isDark
                      ? COLORS.darkTextSecondary
                      : COLORS.textSecondary,
                  },
                ]}
              >
                NET WORTH
              </Text>
              <View style={styles.heroTrendContainer}>
                <Ionicons
                  name={monthlyChange >= 0 ? 'trending-up' : 'trending-down'}
                  size={16}
                  color={monthlyChange >= 0 ? COLORS.success : COLORS.error}
                />
                <Text
                  style={[
                    styles.heroTrend,
                    {
                      color: monthlyChange >= 0 ? COLORS.success : COLORS.error,
                    },
                  ]}
                >
                  {monthlyChange >= 0 ? '+' : ''}
                  {monthlyChange}% this month
                </Text>
              </View>
            </View>
            <Pressable style={styles.chartButton}>
              <LinearGradient
                colors={[COLORS.accent, COLORS.accentDark]}
                style={styles.chartButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="analytics" size={20} color="white" />
              </LinearGradient>
            </Pressable>
          </View>

          <Text
            style={[
              styles.heroAmount,
              { color: isDark ? COLORS.darkTextPrimary : COLORS.text },
            ]}
          >
            {formatCurrency(netWorth)}
          </Text>

          <View
            style={[
              styles.heroBreakdown,
              {
                borderTopColor: isDark
                  ? COLORS.darkBorderLight
                  : COLORS.borderLight,
              },
            ]}
          >
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownHeader}>
                <View
                  style={[
                    styles.breakdownIndicator,
                    { backgroundColor: COLORS.success },
                  ]}
                />
                <Text
                  style={[
                    styles.breakdownLabel,
                    {
                      color: isDark
                        ? COLORS.darkTextSecondary
                        : COLORS.textSecondary,
                    },
                  ]}
                >
                  Assets
                </Text>
              </View>
              <Text
                style={[
                  styles.breakdownAmount,
                  { color: isDark ? COLORS.darkTextPrimary : COLORS.text },
                ]}
              >
                {formatCurrency(assets)}
              </Text>
            </View>
            <View
              style={[
                styles.breakdownDivider,
                {
                  backgroundColor: isDark
                    ? COLORS.darkBorderLight
                    : COLORS.borderLight,
                },
              ]}
            />
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownHeader}>
                <View
                  style={[
                    styles.breakdownIndicator,
                    { backgroundColor: COLORS.error },
                  ]}
                />
                <Text
                  style={[
                    styles.breakdownLabel,
                    {
                      color: isDark
                        ? COLORS.darkTextSecondary
                        : COLORS.textSecondary,
                    },
                  ]}
                >
                  Liabilities
                </Text>
              </View>
              <Text
                style={[
                  styles.breakdownAmount,
                  { color: isDark ? COLORS.darkTextPrimary : COLORS.text },
                ]}
              >
                {formatCurrency(liabilities)}
              </Text>
            </View>
          </View>

          {/* Mini sparkline chart */}
          <View style={styles.miniChart}>
            <View style={styles.sparkline}>
              {[40, 55, 35, 70, 45, 80, 65, 90, 75, 85].map((height, index) => (
                <View
                  key={index}
                  style={[
                    styles.sparklineBar,
                    {
                      height: `${height}%`,
                      backgroundColor:
                        index === 9
                          ? COLORS.accent
                          : isDark
                            ? COLORS.darkBorderLight
                            : COLORS.borderLight,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderMetricsGrid = () => {
    const metrics = [
      {
        id: 'cashflow',
        label: 'CASH FLOW',
        value: formatCurrency(2340),
        change: '+12.3%',
        positive: true,
        icon: 'cash',
        color: COLORS.accent,
        subtitle: '7-day velocity',
      },
      {
        id: 'savings',
        label: 'SAVINGS RATE',
        value: '19.2%',
        change: '+2.1%',
        positive: true,
        icon: 'trending-up',
        color: COLORS.success,
        subtitle: 'Above 15% goal',
      },
      {
        id: 'emergency',
        label: 'EMERGENCY FUND',
        value: formatCurrency(3250),
        progress: 65,
        target: formatCurrency(5000),
        icon: 'shield-checkmark',
        color: COLORS.warning,
      },
      {
        id: 'budget',
        label: 'BUDGET STATUS',
        value: '73%',
        subtitle: 'used this month',
        remaining: formatCurrency(540),
        icon: 'pie-chart',
        color: COLORS.info,
      },
    ];

    return (
      <View style={styles.metricsGrid}>
        {metrics.map((metric, index) => (
          <Animated.View
            key={metric.id}
            style={[
              styles.metricCard,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 50],
                      outputRange: [0, 50 + index * 10],
                    }),
                  },
                ],
              },
            ]}
          >
            <Pressable
              style={[
                styles.metricPressable,
                {
                  backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
                },
              ]}
              onPress={() =>
                showComingSoonModal(metric.label, 'Financial Metrics')
              }
            >
              <View style={styles.metricHeader}>
                <View
                  style={[
                    styles.metricIconContainer,
                    { backgroundColor: metric.color + '15' },
                  ]}
                >
                  <Ionicons
                    name={metric.icon as any}
                    size={20}
                    color={metric.color}
                  />
                </View>
                {metric.change && (
                  <View
                    style={[
                      styles.metricChange,
                      {
                        backgroundColor: isDark
                          ? COLORS.darkBackground
                          : COLORS.background,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.metricChangeText,
                        {
                          color: metric.positive
                            ? COLORS.success
                            : COLORS.error,
                        },
                      ]}
                    >
                      {metric.change}
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.metricLabel,
                  {
                    color: isDark
                      ? COLORS.darkTextSecondary
                      : COLORS.textSecondary,
                  },
                ]}
              >
                {metric.label}
              </Text>
              <Text
                style={[
                  styles.metricValue,
                  { color: isDark ? COLORS.darkTextPrimary : COLORS.text },
                ]}
              >
                {metric.value}
              </Text>

              {metric.subtitle && (
                <Text
                  style={[
                    styles.metricSubtitle,
                    {
                      color: isDark
                        ? COLORS.darkTextSecondary
                        : COLORS.textSecondary,
                    },
                  ]}
                >
                  {metric.subtitle}
                </Text>
              )}

              {metric.progress !== undefined && (
                <View style={styles.progressContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        backgroundColor: isDark
                          ? COLORS.darkBackground
                          : COLORS.background,
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={[metric.color, `${metric.color}DD`] as const}
                      style={[
                        styles.progressFill,
                        { width: `${metric.progress}%` },
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>
                  <Text
                    style={[
                      styles.progressText,
                      {
                        color: isDark
                          ? COLORS.darkTextSecondary
                          : COLORS.textSecondary,
                      },
                    ]}
                  >
                    {metric.target}
                  </Text>
                </View>
              )}

              {metric.remaining && (
                <Text
                  style={[
                    styles.metricRemaining,
                    {
                      color: isDark
                        ? COLORS.darkTextTertiary
                        : COLORS.textTertiary,
                    },
                  ]}
                >
                  {metric.remaining} remaining
                </Text>
              )}
            </Pressable>
          </Animated.View>
        ))}
      </View>
    );
  };

  const renderQuickActions = () => {
    const actions = [
      {
        id: 'transaction',
        title: 'New Transaction',
        subtitle: 'Record income & expenses',
        icon: 'add-circle',
        color: COLORS.navy,
        gradient: [COLORS.navy, COLORS.darkNavy] as const,
        onPress: () =>
          showComingSoonModal('New Transaction', 'Transaction Entry'),
      },
      {
        id: 'accounts',
        title: 'Accounts',
        subtitle: 'Manage your accounts',
        icon: 'wallet',
        color: COLORS.accent,
        gradient: [COLORS.accent, COLORS.accentDark] as const,
        onPress: () => router.push('/(tabs)/check-register'),
      },
      {
        id: 'analytics',
        title: 'Analytics',
        subtitle: 'View spending insights',
        icon: 'stats-chart',
        color: COLORS.forest,
        gradient: [COLORS.forest, COLORS.darkForest] as const,
        onPress: () => showComingSoonModal('Analytics', 'Spending Insights'),
      },
      {
        id: 'goals',
        title: 'Savings Goals',
        subtitle: 'Track your progress',
        icon: 'trophy',
        color: COLORS.warning,
        gradient: [COLORS.warning, '#E65100'] as const,
        onPress: () => showComingSoonModal('Savings Goals', 'Goal Tracking'),
      },
    ];

    return (
      <View style={styles.quickActions}>
        <Text
          style={[
            styles.sectionTitle,
            { color: isDark ? COLORS.darkTextPrimary : COLORS.text },
          ]}
        >
          Quick Actions
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.actionsScroll}
        >
          {actions.map((action, index) => (
            <Animated.View
              key={action.id}
              style={[
                styles.actionCard,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateX: slideAnim.interpolate({
                        inputRange: [0, 50],
                        outputRange: [0, 50 + index * 20],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Pressable
                style={styles.actionPressable}
                onPress={action.onPress}
              >
                <LinearGradient
                  colors={action.gradient}
                  style={styles.actionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={action.icon as any} size={28} color="white" />
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                  <View style={styles.actionArrow}>
                    <Ionicons name="arrow-forward" size={16} color="white" />
                  </View>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderInsights = () => (
    <Animated.View
      style={[
        styles.insightsCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={
          isDark
            ? [COLORS.darkSurface, COLORS.darkSurfaceElevated]
            : ['#E8EAF6', '#C5CAE9']
        }
        style={styles.insightsGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.insightsHeader}>
          <View
            style={[
              styles.insightsIconContainer,
              { backgroundColor: isDark ? COLORS.darkBorder : 'white' },
            ]}
          >
            <MaterialCommunityIcons
              name="brain"
              size={24}
              color={isDark ? COLORS.accent : COLORS.navy}
            />
          </View>
          <Text
            style={[
              styles.insightsTitle,
              { color: isDark ? COLORS.darkTextPrimary : COLORS.navy },
            ]}
          >
            Smart Insight
          </Text>
        </View>
        <Text
          style={[
            styles.insightsText,
            { color: isDark ? COLORS.darkTextSecondary : COLORS.text },
          ]}
        >
          Your spending is 15% lower than last month. Consider increasing your
          emergency fund contribution by $150 to reach your goal faster.
        </Text>
        <Pressable style={styles.insightsAction}>
          <Text
            style={[
              styles.insightsActionText,
              { color: isDark ? COLORS.darkTextPrimary : COLORS.navy },
            ]}
          >
            View Recommendations
          </Text>
          <Ionicons
            name="arrow-forward"
            size={16}
            color={isDark ? COLORS.darkTextPrimary : COLORS.navy}
          />
        </Pressable>
      </LinearGradient>
    </Animated.View>
  );

  const renderRecentActivity = () => {
    const activities = [
      {
        id: '1',
        type: 'income',
        description: 'Salary Deposit',
        amount: 3500,
        date: 'Today',
      },
      {
        id: '2',
        type: 'expense',
        description: 'Grocery Store',
        amount: -125.5,
        date: 'Yesterday',
      },
      {
        id: '3',
        type: 'expense',
        description: 'Gas Station',
        amount: -45.0,
        date: 'Dec 2',
      },
      {
        id: '4',
        type: 'transfer',
        description: 'To Savings',
        amount: -500,
        date: 'Dec 1',
      },
    ];

    return (
      <View
        style={[
          styles.activityCard,
          { backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface },
        ]}
      >
        <View style={styles.activityHeader}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? COLORS.darkTextPrimary : COLORS.text },
            ]}
          >
            Recent Activity
          </Text>
          <Pressable onPress={() => router.push('/(tabs)/check-register')}>
            <Text
              style={[
                styles.viewAllText,
                { color: isDark ? COLORS.accentLight : COLORS.accent },
              ]}
            >
              View All
            </Text>
          </Pressable>
        </View>
        {activities.map((activity) => (
          <View
            key={activity.id}
            style={[
              styles.activityItem,
              {
                borderBottomWidth: isDark ? 1 : 0,
                borderBottomColor: isDark
                  ? COLORS.darkBorderLight
                  : COLORS.borderLight,
              },
            ]}
          >
            <View style={styles.activityLeft}>
              <View
                style={[
                  styles.activityIcon,
                  {
                    backgroundColor:
                      activity.type === 'income'
                        ? COLORS.success + '15'
                        : COLORS.error + '15',
                  },
                ]}
              >
                <Ionicons
                  name={activity.type === 'income' ? 'arrow-down' : 'arrow-up'}
                  size={16}
                  color={
                    activity.type === 'income' ? COLORS.success : COLORS.error
                  }
                />
              </View>
              <View>
                <Text
                  style={[
                    styles.activityDescription,
                    { color: isDark ? COLORS.darkTextPrimary : COLORS.text },
                  ]}
                >
                  {activity.description}
                </Text>
                <Text
                  style={[
                    styles.activityDate,
                    {
                      color: isDark
                        ? COLORS.darkTextSecondary
                        : COLORS.textSecondary,
                    },
                  ]}
                >
                  {activity.date}
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.activityAmount,
                {
                  color:
                    activity.amount > 0
                      ? COLORS.success
                      : isDark
                        ? COLORS.darkTextPrimary
                        : COLORS.text,
                },
              ]}
            >
              {formatCurrency(Math.abs(activity.amount), true)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  if (loading && !summary) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[COLORS.navy, COLORS.darkNavy]}
          style={StyleSheet.absoluteFillObject}
        >
          <View style={styles.loadingContent}>
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              }}
            >
              <Ionicons name="analytics" size={48} color="white" />
            </Animated.View>
            <Text style={styles.loadingText}>Analyzing your finances...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? COLORS.darkBackground : COLORS.background },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.navy}
            colors={[COLORS.navy]}
          />
        }
      >
        {renderHeader()}
        <View style={styles.content}>
          {renderHeroCard()}
          {renderMetricsGrid()}
          {renderQuickActions()}
          {renderInsights()}
          {renderRecentActivity()}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <Animated.View
        style={[
          styles.fab,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Pressable
          style={styles.fabPressable}
          onPress={() =>
            showComingSoonModal('New Transaction', 'Quick Transaction Entry')
          }
        >
          <LinearGradient
            colors={[COLORS.accent, COLORS.accentDark]}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="add" size={28} color="white" />
          </LinearGradient>
        </Pressable>
      </Animated.View>

      {/* Coming Soon Modal */}
      <Modal
        visible={comingSoonModal.visible}
        transparent
        animationType="fade"
        onRequestClose={hideComingSoonModal}
      >
        <View
          style={[
            styles.modalOverlay,
            {
              backgroundColor: isDark
                ? 'rgba(0, 0, 0, 0.8)'
                : 'rgba(0, 0, 0, 0.5)',
            },
          ]}
        >
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: isDark ? COLORS.darkSurface : 'white' },
            ]}
          >
            <LinearGradient
              colors={[COLORS.accent, COLORS.accentDark] as const}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="rocket" size={32} color="white" />
                </View>
                <Text style={styles.modalTitle}>{comingSoonModal.title}</Text>
                <Text style={styles.modalSubtitle}>Coming Soon!</Text>
              </View>
            </LinearGradient>

            <View
              style={[
                styles.modalBody,
                { backgroundColor: isDark ? COLORS.darkSurface : 'white' },
              ]}
            >
              <Text
                style={[
                  styles.modalDescription,
                  {
                    color: isDark
                      ? COLORS.darkTextSecondary
                      : COLORS.textSecondary,
                  },
                ]}
              >
                We&apos;re working hard to bring you {comingSoonModal.feature}.
                This exciting feature will be available in a future update!
              </Text>

              <View style={styles.modalFeatureList}>
                <View style={styles.featureItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={COLORS.success}
                  />
                  <Text
                    style={[
                      styles.featureText,
                      {
                        color: isDark
                          ? COLORS.darkTextPrimary
                          : COLORS.textPrimary,
                      },
                    ]}
                  >
                    Professional design
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={COLORS.success}
                  />
                  <Text
                    style={[
                      styles.featureText,
                      {
                        color: isDark
                          ? COLORS.darkTextPrimary
                          : COLORS.textPrimary,
                      },
                    ]}
                  >
                    Intuitive user experience
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={COLORS.success}
                  />
                  <Text
                    style={[
                      styles.featureText,
                      {
                        color: isDark
                          ? COLORS.darkTextPrimary
                          : COLORS.textPrimary,
                      },
                    ]}
                  >
                    Seamless integration
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={hideComingSoonModal}
              >
                <LinearGradient
                  colors={[COLORS.forest, COLORS.darkForest] as const}
                  style={styles.closeButtonGradient}
                >
                  <Text style={styles.closeButtonText}>Got It!</Text>
                  <Ionicons name="thumbs-up" size={18} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: 16,
    paddingTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    gap: 24,
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },

  // Header Styles
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  userName: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileInitial: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },

  // Hero Card Styles
  heroCard: {
    marginTop: -12,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  heroGradient: {
    padding: 20,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1.2,
  },
  heroTrendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  heroTrend: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  chartButtonGradient: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroAmount: {
    fontSize: 42,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 20,
  },
  heroBreakdown: {
    flexDirection: 'row',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  breakdownItem: {
    flex: 1,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  breakdownIndicator: {
    width: 3,
    height: 16,
    borderRadius: 2,
  },
  breakdownLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  breakdownAmount: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  breakdownDivider: {
    width: 1,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: 16,
  },
  miniChart: {
    marginTop: 16,
    height: 40,
  },
  sparkline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    gap: 3,
  },
  sparklineBar: {
    flex: 1,
    borderRadius: 2,
  },

  // Metrics Grid Styles
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    minWidth: (screenWidth - 44) / 2,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  metricPressable: {
    padding: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricChange: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  metricChangeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  metricRemaining: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 12,
    gap: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // Quick Actions Styles
  quickActions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  actionsScroll: {
    paddingRight: 16,
  },
  actionCard: {
    width: 140,
    height: 140,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionPressable: {
    flex: 1,
  },
  actionGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  actionTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
  },
  actionSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  actionArrow: {
    alignSelf: 'flex-end',
  },

  // Insights Card Styles
  insightsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  insightsGradient: {
    padding: 16,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  insightsIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
  },
  insightsText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  insightsAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  insightsActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.navy,
  },

  // Activity Styles
  activityCard: {
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: '600',
  },

  // FAB Styles
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    borderRadius: 28,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fabPressable: {
    borderRadius: 28,
  },
  fabGradient: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    width: '90%',
    maxWidth: 400,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  modalGradient: {
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  modalHeader: {
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 5,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textAlign: 'center',
  },
  modalBody: {
    padding: 25,
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalFeatureList: {
    marginBottom: 25,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 10,
  },
  featureText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    marginLeft: 12,
    fontWeight: '500',
  },
  modalCloseButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  closeButtonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
