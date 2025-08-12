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

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn } = useAuth();
  const theme = useTheme();

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    
    if (result.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Sign In Failed', result.error || 'An error occurred');
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
            <Typography variant="h2">Welcome Back</Typography>
            <Typography variant="body1" color="textSecondary">
              Sign in to your SmartLedger account
            </Typography>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              required
            />

            <TextInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              showPasswordToggle
              error={errors.password}
              required
            />

            <View style={{ marginBottom: theme.spacing.sm }}>
              <Link href="/(auth)/forgot-password" asChild>
                <TouchableOpacity style={[styles.forgotPassword, {
                  padding: theme.spacing.xs,
                }]}>
                  <Typography variant="body2" color="primary">
                    Forgot Password?
                  </Typography>
                </TouchableOpacity>
              </Link>
            </View>

            <Button
              onPress={handleSignIn}
              loading={loading}
              disabled={loading}
              variant="primary"
              size="lg"
              fullWidth
            >
              Sign In
            </Button>

            <View style={[styles.signUpContainer, { marginTop: theme.spacing.lg }]}>
              <Typography variant="body2" color="textSecondary">
                Don&apos;t have an account?{' '}
              </Typography>
              <Link href="/(auth)/sign-up" asChild>
                <TouchableOpacity>
                  <Typography variant="body2" color="primary" weight="semibold">
                    Sign Up
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
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});