import React, { useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, TextInput, Typography, useTheme } from '@/design-system';
import { useAuth } from '@/context/auth/AuthContext';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});
  
  const { resetPassword } = useAuth();
  const theme = useTheme();

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    const result = await resetPassword(email);
    setLoading(false);
    
    if (result.success) {
      setEmailSent(true);
      Alert.alert(
        'Email Sent',
        'Check your email for password reset instructions.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/sign-in') }]
      );
    } else {
      Alert.alert('Reset Failed', result.error || 'An error occurred');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, {
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.xl,
          }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.header, { marginBottom: theme.spacing.xl }]}>
            <Typography variant="h2">Reset Password</Typography>
            <Typography variant="body1" color="textSecondary">
              Enter your email to receive reset instructions
            </Typography>
          </View>

          <View style={styles.form}>
            {!emailSent ? (
              <>
                <TextInput
                  label="Email"
                  placeholder="Enter your email address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                  required
                />

                <Button
                  onPress={handleResetPassword}
                  loading={loading}
                  disabled={loading}
                  variant="primary"
                  size="lg"
                  fullWidth
                >
                  Send Reset Email
                </Button>
              </>
            ) : (
              <View style={[styles.successContainer, {
                paddingVertical: theme.spacing.xl,
              }]}>
                <Typography variant="h4" color="success" align="center">
                  Password reset email sent!
                </Typography>
                <Typography variant="body1" color="textSecondary" align="center">
                  Check your inbox for instructions to reset your password.
                </Typography>
              </View>
            )}

            <View style={[styles.signInContainer, { marginTop: theme.spacing.xl }]}>
              <Typography variant="body2" color="textSecondary">
                Remember your password?{' '}
              </Typography>
              <Link href="/(auth)/sign-in" asChild>
                <TouchableOpacity>
                  <Typography variant="body2" color="primary" weight="semibold">
                    Sign In
                  </Typography>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
  },
  form: {
    flex: 1,
  },
  successContainer: {
    alignItems: 'center',
    gap: 16,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});