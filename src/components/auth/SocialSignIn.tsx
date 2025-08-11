import React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';

export interface SocialSignInProps {
  onGoogleSignIn: () => Promise<void> | void;
  loading?: boolean;
  disabled?: boolean;
}

export function SocialSignIn({ 
  onGoogleSignIn, 
  loading = false, 
  disabled = false 
}: SocialSignInProps) {
  return (
    <View className="space-y-4">
      {/* Divider */}
      <View className="flex-row items-center my-6">
        <View className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
        <Text 
          variant="small" 
          className="mx-4 text-gray-500 dark:text-gray-400"
        >
          or continue with
        </Text>
        <View className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
      </View>

      {/* Google Sign In Button */}
      <Button
        variant="outline"
        size="lg"
        onPress={onGoogleSignIn}
        loading={loading}
        disabled={disabled}
        className="border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
        textClassName="text-gray-700 dark:text-gray-300"
        accessibilityLabel="Continue with Google"
      >
        {!loading && (
          <>
            {/* Google Icon (G) */}
            <View className="w-5 h-5 mr-3 items-center justify-center">
              <Text className="text-primary-500 font-bold">G</Text>
            </View>
            Continue with Google
          </>
        )}
        {loading && 'Signing in with Google...'}
      </Button>

      {/* Future: Add more social providers */}
      {/* 
      <Button
        variant="outline"
        size="lg"
        onPress={onAppleSignIn}
        className="border-2 border-gray-300 dark:border-gray-600"
      >
        <AppleIcon className="w-5 h-5 mr-3" />
        Continue with Apple
      </Button>
      */}
    </View>
  );
}