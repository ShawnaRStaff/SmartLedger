import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { useAuth } from '@/context/auth/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});
  
  const { resetPassword } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');

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
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>Reset Password</Text>
            <Text style={[styles.subtitle, { color: textColor, opacity: 0.7 }]}>
              Enter your email to receive reset instructions
            </Text>
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
                  leftIcon="mail"
                />

                <Button
                  onPress={handleResetPassword}
                  loading={loading}
                  disabled={loading}
                  size="lg"
                  style={styles.resetButton}
                >
                  Send Reset Email
                </Button>
              </>
            ) : (
              <View style={styles.successContainer}>
                <Text style={[styles.successText, { color: textColor }]}>
                  Password reset email sent!
                </Text>
                <Text style={[styles.successSubtext, { color: textColor, opacity: 0.7 }]}>
                  Check your inbox for instructions to reset your password.
                </Text>
              </View>
            )}

            <View style={styles.signInContainer}>
              <Text style={[styles.signInText, { color: textColor }]}>
                Remember your password?{' '}
              </Text>
              <Link href="/(auth)/sign-in" asChild>
                <Text style={[styles.signInLink, { color: primaryColor }]}>
                  Sign In
                </Text>
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
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    flex: 1,
  },
  resetButton: {
    marginTop: 24,
    marginBottom: 32,
  },
  successContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  successText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  successSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 14,
  },
  signInLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});