import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { FormField } from '@/components/auth/FormField';
import { SocialSignIn } from '@/components/auth/SocialSignIn';
import { Button, Text } from '@/components/ui';
import { useAuth } from '@/hooks/auth/useAuth';
import { useAuthForm } from '@/hooks/auth/useAuthForm';

export interface SignInScreenProps {
  onNavigateToSignUp: () => void;
  onNavigateToForgotPassword: () => void;
  onSignInSuccess: () => void;
}

export function SignInScreen({
  onNavigateToSignUp,
  onNavigateToForgotPassword,
  onSignInSuccess,
}: SignInScreenProps) {
  const { signIn, loading, error, clearError } = useAuth();
  const [socialLoading, setSocialLoading] = useState(false);
  
  const {
    formData,
    updateField,
    touchField,
    validateForm,
    getFormValues,
  } = useAuthForm();

  const handleSignIn = async () => {
    if (!validateForm()) {
      return;
    }

    clearError();
    const { email, password } = getFormValues();

    try {
      const result = await signIn(email, password);
      
      if (result.success) {
        onSignInSuccess();
      } else {
        // Error is handled by useAuth hook
        console.error('Sign in failed:', result.error);
      }
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    setSocialLoading(true);
    
    try {
      // TODO: Implement Google Sign In
      // For now, show a placeholder
      Alert.alert(
        'Google Sign In',
        'Google Sign In will be implemented in the next phase',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Google sign in error:', error);
      Alert.alert('Error', 'Google sign in failed. Please try again.');
    } finally {
      setSocialLoading(false);
    }
  };

  const isFormDisabled = loading || socialLoading;

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your SmartLedger account to continue managing your finances"
    >
      {/* Error Display */}
      {error && (
        <View className="mb-4 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
          <Text className="text-error-600 dark:text-error-400 text-center">
            {error}
          </Text>
        </View>
      )}

      {/* Email Field */}
      <FormField
        name="email"
        label="Email"
        placeholder="Enter your email"
        value={formData.email.value}
        onChangeText={(text) => updateField('email', text)}
        onBlur={() => touchField('email')}
        error={formData.email.error || undefined}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        leftIcon="mail"
        validation={{
          required: true,
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        }}
        editable={!isFormDisabled}
      />

      {/* Password Field */}
      <FormField
        name="password"
        label="Password"
        placeholder="Enter your password"
        value={formData.password.value}
        onChangeText={(text) => updateField('password', text)}
        onBlur={() => touchField('password')}
        error={formData.password.error || undefined}
        secureTextEntry
        showPasswordToggle
        leftIcon="lock"
        validation={{
          required: true,
          minLength: 6,
        }}
        editable={!isFormDisabled}
      />

      {/* Forgot Password Link */}
      <View className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onPress={onNavigateToForgotPassword}
          disabled={isFormDisabled}
          className="self-end -mt-2"
        >
          Forgot password?
        </Button>
      </View>

      {/* Sign In Button */}
      <Button
        variant="primary"
        size="lg"
        onPress={handleSignIn}
        loading={loading}
        disabled={isFormDisabled}
        className="mb-4"
      >
        Sign In
      </Button>

      {/* Social Sign In */}
      <SocialSignIn
        onGoogleSignIn={handleGoogleSignIn}
        loading={socialLoading}
        disabled={isFormDisabled}
      />

      {/* Sign Up Link */}
      <View className="flex-row justify-center items-center mt-6">
        <Text className="text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
        </Text>
        <Button
          variant="ghost"
          size="sm"
          onPress={onNavigateToSignUp}
          disabled={isFormDisabled}
          className="p-0 min-h-0"
        >
          Sign up
        </Button>
      </View>
    </AuthLayout>
  );
}