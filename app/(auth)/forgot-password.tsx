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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TextInput, Typography } from '@/design-system';
import { useAuth } from '@/context/auth/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

// Professional Color Palette (matching sign-in)
const COLORS = {
  navy: '#1A237E',
  darkNavy: '#0D47A1',
  forest: '#2E7D32',
  accent: '#1976D2',
  accentDark: '#1565C0',
  lightAccent: '#E3F2FD',
  darkForest: '#1B5E20',
  warning: '#FF8F00',
  surface: '#FFFFFF',
  darkSurface: '#121212',
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  darkTextPrimary: '#FFFFFF',
  darkTextSecondary: '#AAAAAA',
  border: '#E0E0E0',
  darkBorder: '#333333',
  error: '#D32F2F',
  success: '#2E7D32',
};

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});

  const { resetPassword } = useAuth();
  const colorScheme = useColorScheme();

  const isDark = colorScheme === 'dark';

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
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={
          isDark
            ? [COLORS.darkSurface, COLORS.darkNavy]
            : [COLORS.lightAccent, COLORS.surface]
        }
        style={styles.background}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Section */}
            <View style={styles.header}>
              <View
                style={[
                  styles.logoContainer,
                  {
                    backgroundColor: isDark
                      ? COLORS.darkSurface
                      : COLORS.surface,
                    shadowColor: isDark ? COLORS.darkTextPrimary : '#000',
                  },
                ]}
              >
                <Ionicons name="wallet" size={32} color={COLORS.accent} />
              </View>

              <Typography
                variant="h1"
                style={[
                  styles.welcomeTitle,
                  {
                    color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
                  },
                ]}
              >
                Reset Password
              </Typography>

              <Typography
                variant="body1"
                style={[
                  styles.welcomeSubtitle,
                  {
                    color: isDark
                      ? COLORS.darkTextSecondary
                      : COLORS.textSecondary,
                  },
                ]}
              >
                Enter your email to receive reset instructions
              </Typography>
            </View>

            {/* Form Card */}
            <View
              style={[
                styles.formCard,
                {
                  backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
                  shadowColor: isDark ? COLORS.darkTextPrimary : '#000',
                },
              ]}
            >
              <View style={styles.form}>
                {!emailSent ? (
                  <>
                    <TextInput
                      label="Email Address"
                      placeholder="Enter your email address"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      error={errors.email}
                      required
                      style={styles.input}
                    />

                    <LinearGradient
                      colors={[COLORS.accent, COLORS.accentDark] as const}
                      style={styles.resetButton}
                    >
                      <TouchableOpacity
                        onPress={handleResetPassword}
                        disabled={loading}
                        style={styles.resetButtonInner}
                      >
                        {loading ? (
                          <View style={styles.loadingContainer}>
                            <Typography
                              variant="button"
                              style={styles.buttonText}
                            >
                              Sending Reset Link...
                            </Typography>
                          </View>
                        ) : (
                          <View style={styles.buttonContent}>
                            <Typography
                              variant="button"
                              style={styles.buttonText}
                            >
                              Send Reset Link
                            </Typography>
                            <Ionicons name="mail" size={20} color="white" />
                          </View>
                        )}
                      </TouchableOpacity>
                    </LinearGradient>
                  </>
                ) : (
                  <View style={styles.successContainer}>
                    <View
                      style={[
                        styles.successIcon,
                        {
                          backgroundColor: COLORS.success,
                        },
                      ]}
                    >
                      <Ionicons name="checkmark" size={32} color="white" />
                    </View>

                    <Typography
                      variant="h3"
                      style={[
                        styles.successTitle,
                        {
                          color: isDark
                            ? COLORS.darkTextPrimary
                            : COLORS.textPrimary,
                        },
                      ]}
                    >
                      Password reset email sent!
                    </Typography>

                    <Typography
                      variant="body1"
                      style={[
                        styles.successMessage,
                        {
                          color: isDark
                            ? COLORS.darkTextSecondary
                            : COLORS.textSecondary,
                        },
                      ]}
                    >
                      Check your inbox for instructions to reset your password.
                    </Typography>
                  </View>
                )}

                <View style={styles.divider}>
                  <View
                    style={[
                      styles.dividerLine,
                      {
                        backgroundColor: isDark
                          ? COLORS.darkBorder
                          : COLORS.border,
                      },
                    ]}
                  />
                  <Typography
                    variant="caption"
                    style={[
                      styles.dividerText,
                      {
                        backgroundColor: isDark
                          ? COLORS.darkSurface
                          : COLORS.surface,
                        color: isDark
                          ? COLORS.darkTextSecondary
                          : COLORS.textSecondary,
                      },
                    ]}
                  >
                    OR
                  </Typography>
                  <View
                    style={[
                      styles.dividerLine,
                      {
                        backgroundColor: isDark
                          ? COLORS.darkBorder
                          : COLORS.border,
                      },
                    ]}
                  />
                </View>

                <Link href="/(auth)/sign-in" asChild>
                  <TouchableOpacity
                    style={[
                      styles.signInButton,
                      {
                        borderColor: isDark ? COLORS.darkBorder : COLORS.border,
                        backgroundColor: isDark
                          ? COLORS.darkSurface
                          : COLORS.surface,
                      },
                    ]}
                  >
                    <View style={styles.signInButtonContent}>
                      <Typography
                        variant="button"
                        style={[
                          styles.signInButtonText,
                          {
                            color: isDark
                              ? COLORS.darkTextPrimary
                              : COLORS.textPrimary,
                          },
                        ]}
                      >
                        Remember Password? Sign In
                      </Typography>
                      <Ionicons
                        name="arrow-back"
                        size={18}
                        color={
                          isDark ? COLORS.darkTextPrimary : COLORS.textPrimary
                        }
                      />
                    </View>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Typography
                variant="caption"
                style={[
                  styles.footerText,
                  {
                    color: isDark
                      ? COLORS.darkTextSecondary
                      : COLORS.textSecondary,
                  },
                ]}
              >
                Secure • Private • Professional
              </Typography>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  formCard: {
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 32,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  form: {
    gap: 20,
  },
  input: {
    marginBottom: 4,
  },
  resetButton: {
    borderRadius: 16,
    marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  resetButtonInner: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 16,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  signInButton: {
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  signInButtonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
});
