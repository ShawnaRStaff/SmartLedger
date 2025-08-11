import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { FormField } from '@/components/auth/FormField';
import { SocialSignIn } from '@/components/auth/SocialSignIn';
import { Button, Text } from '@/components/ui';
import { useAuth } from '@/hooks/auth/useAuth';
import { useAuthForm } from '@/hooks/auth/useAuthForm';

export interface SignUpScreenProps {
  onNavigateToSignIn: () => void;
  onSignUpSuccess: () => void;
}

export function SignUpScreen({
  onNavigateToSignIn,
  onSignUpSuccess,
}: SignUpScreenProps) {
  const { signUp, loading, error, clearError } = useAuth();
  const [socialLoading, setSocialLoading] = useState(false);
  
  const {
    formData,
    updateField,
    touchField,
    validateForm,
    getFormValues,
  } = useAuthForm(true, true); // Include confirmPassword and displayName

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    clearError();
    const { email, password, displayName } = getFormValues();

    try {
      const result = await signUp(email, password, displayName);
      
      if (result.success) {
        Alert.alert(
          'Account Created!',
          'Your account has been created successfully. Welcome to SmartLedger!',
          [{ text: 'OK', onPress: onSignUpSuccess }]
        );
      } else {
        // Error is handled by useAuth hook
        console.error('Sign up failed:', result.error);
      }
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    setSocialLoading(true);
    
    try {
      // TODO: Implement Google Sign In
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
      title="Create Account"
      subtitle="Join SmartLedger to start your journey to better financial management"
    >
      {/* Error Display */}
      {error && (
        <View className="mb-4 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
          <Text className="text-error-600 dark:text-error-400 text-center">
            {error}
          </Text>
        </View>
      )}

      {/* Display Name Field */}
      <FormField
        name="displayName"
        label="Display Name"
        placeholder="Enter your name"
        value={formData.displayName?.value || ''}
        onChangeText={(text) => updateField('displayName', text)}
        onBlur={() => touchField('displayName')}
        error={formData.displayName?.error || undefined}
        autoCapitalize="words"
        autoComplete="name"
        leftIcon="person"
        validation={{
          required: true,
          minLength: 2,
          maxLength: 50,
        }}
        editable={!isFormDisabled}
      />

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
        placeholder="Create a password"
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
        hint="Password must be at least 6 characters"
        editable={!isFormDisabled}
      />

      {/* Confirm Password Field */}
      <FormField
        name="confirmPassword"
        label="Confirm Password"
        placeholder="Confirm your password"
        value={formData.confirmPassword?.value || ''}
        onChangeText={(text) => updateField('confirmPassword', text)}
        onBlur={() => touchField('confirmPassword')}
        error={formData.confirmPassword?.error || undefined}
        secureTextEntry
        showPasswordToggle
        leftIcon="lock"
        validation={{
          required: true,
          custom: (value) => {
            if (value !== formData.password.value) {
              return 'Passwords do not match';
            }
            return null;
          },
        }}
        editable={!isFormDisabled}
      />

      {/* Terms and Privacy Notice */}
      <View className="mb-6">
        <Text className="text-xs text-gray-500 dark:text-gray-400 text-center leading-4">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>

      {/* Sign Up Button */}
      <Button
        variant="primary"
        size="lg"
        onPress={handleSignUp}
        loading={loading}
        disabled={isFormDisabled}
        className="mb-4"
      >
        Create Account
      </Button>

      {/* Social Sign In */}
      <SocialSignIn
        onGoogleSignIn={handleGoogleSignIn}
        loading={socialLoading}
        disabled={isFormDisabled}
      />

      {/* Sign In Link */}
      <View className="flex-row justify-center items-center mt-6">
        <Text className="text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
        </Text>
        <Button
          variant="ghost"
          size="sm"
          onPress={onNavigateToSignIn}
          disabled={isFormDisabled}
          className="p-0 min-h-0"
        >
          Sign in
        </Button>
      </View>
    </AuthLayout>
  );
}