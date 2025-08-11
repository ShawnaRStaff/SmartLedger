import React from 'react';
import { View, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from '@/components/ui/Text';

export interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function AuthLayout({ 
  title, 
  subtitle, 
  children, 
  className = '' 
}: AuthLayoutProps) {
  const containerStyles = [
    'flex-1 bg-gray-50 dark:bg-gray-900',
    className
  ].filter(Boolean).join(' ');

  return (
    <SafeAreaView className={containerStyles}>
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center px-6 py-12">
            {/* App Logo/Brand Area */}
            <View className="items-center mb-8">
              <View className="w-16 h-16 bg-primary-500 rounded-full items-center justify-center mb-4">
                <Text className="text-2xl font-bold text-white">SL</Text>
              </View>
              <Text variant="h1" className="text-center text-gray-900 dark:text-white mb-2">
                {title}
              </Text>
              {subtitle && (
                <Text 
                  variant="body" 
                  className="text-center text-gray-600 dark:text-gray-400 max-w-sm"
                >
                  {subtitle}
                </Text>
              )}
            </View>

            {/* Auth Form Content */}
            <View className="w-full max-w-sm mx-auto">
              {children}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}