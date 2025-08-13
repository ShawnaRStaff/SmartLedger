/**
 * SmartLedger - Accounts Tab Screen
 * Complete financial command center with transaction management
 */

import React from 'react';
import { View } from 'react-native';
import { Typography, createThemedStyles } from '@/design-system';
import { useAuth } from '@/context/auth/AuthContext';
import AccountsMainScreen from '../../src/features/check-register/components/screens/AccountsMainScreen';

export default function CheckRegisterScreen() {
  const { user, isLoading } = useAuth();
  const styles = useStyles();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Typography variant="body1">Loading...</Typography>
        </View>
      </View>
    );
  }

  // Show auth required message if not logged in
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Typography variant="h2" align="center">
            Authentication Required
          </Typography>
          <Typography variant="body1" color="textSecondary" align="center">
            Please log in to access your accounts.
          </Typography>
        </View>
      </View>
    );
  }

  // Render the complete accounts management screen
  return <AccountsMainScreen />;
}

const useStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
  },
}));