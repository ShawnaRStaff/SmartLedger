import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { FormField } from '@/components/auth/FormField';
import { Button, Text } from '@/components/ui';
import { useAuth } from '@/hooks/auth/useAuth';
import { useAuthForm } from '@/hooks/auth/useAuthForm';

export interface PasswordResetScreenProps {
  onNavigateBack: () => void;
}

export function PasswordResetScreen({
  onNavigateBack,
}: PasswordResetScreenProps) {
  const { resetPassword, loading, error, clearError } = useAuth();
  const [resetSent, setResetSent] = useState(false);
  
  const {
    formData,
    updateField,
    touchField,
    validateForm,
    getFormValues,
    resetForm,
  } = useAuthForm();

  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    clearError();
    const { email } = getFormValues();

    try {
      const result = await resetPassword(email);
      
      if (result.success) {
        setResetSent(true);
        resetForm();
        
        Alert.alert(
          'Reset Email Sent',
          `We've sent password reset instructions to ${email}. Please check your email and follow the instructions to reset your password.`,
          [
            { 
              text: 'OK', 
              onPress: () => {
                // Keep the screen open so they can send another email if needed
                // But clear the form
              }
            }
          ]
        );
      } else {
        // Error is handled by useAuth hook
        console.error('Password reset failed:', result.error);
      }
    } catch (error) {
      console.error('Password reset error:', error);
    }
  };

  const handleSendAnother = () => {
    setResetSent(false);
    clearError();
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email address and we'll send you instructions to reset your password"
    >
      {/* Success Message */}
      {resetSent && (
        <View className="mb-6 p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg">
          <Text className="text-success-700 dark:text-success-400 text-center font-medium mb-2">
            Reset Email Sent!
          </Text>
          <Text className="text-success-600 dark:text-success-400 text-center text-sm">
            Check your email for password reset instructions. Don't forget to check your spam folder.
          </Text>
        </View>
      )}

      {/* Error Display */}
      {error && (
        <View className="mb-4 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
          <Text className="text-error-600 dark:text-error-400 text-center">
            {error}
          </Text>
        </View>
      )}

      {/* Instructions */}
      {!resetSent && (
        <View className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
          <Text className="text-primary-700 dark:text-primary-300 text-center text-sm">
            Enter the email address associated with your account and we'll send you a link to reset your password.
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
        editable={!loading}
      />

      {/* Reset Button */}
      <Button
        variant="primary"
        size="lg"
        onPress={handleResetPassword}
        loading={loading}
        disabled={loading}
        className="mb-4"
      >
        {resetSent ? 'Send Another Email' : 'Send Reset Instructions'}
      </Button>

      {/* Additional Actions */}
      {resetSent && (
        <Button
          variant="outline"
          size="md"
          onPress={handleSendAnother}
          disabled={loading}
          className="mb-4"
        >
          Use Different Email
        </Button>
      )}

      {/* Back to Sign In */}
      <View className="flex-row justify-center items-center mt-4">
        <Text className="text-gray-600 dark:text-gray-400">
          Remember your password?{' '}
        </Text>
        <Button
          variant="ghost"
          size="sm"
          onPress={onNavigateBack}
          disabled={loading}
          className="p-0 min-h-0"
        >
          Back to sign in
        </Button>
      </View>

      {/* Help Text */}
      {resetSent && (
        <View className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Text className="text-gray-600 dark:text-gray-400 text-center text-sm mb-2">
            Didn't receive the email?
          </Text>
          <Text className="text-gray-500 dark:text-gray-500 text-center text-xs leading-4">
            • Check your spam or junk folder{'\n'}
            • Make sure you entered the correct email{'\n'}
            • Wait a few minutes for the email to arrive{'\n'}
            • Try sending another email
          </Text>
        </View>
      )}
    </AuthLayout>
  );
}