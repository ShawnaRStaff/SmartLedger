import React, { useState } from 'react';
import { 
  TextInput as RNTextInput, 
  TextInputProps as RNTextInputProps, 
  View, 
  TouchableOpacity 
} from 'react-native';
import { Text } from './Text';
import { IconSymbol } from './IconSymbol';

export interface TextInputProps extends Omit<RNTextInputProps, 'placeholderTextColor'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  className?: string;
  containerClassName?: string;
  inputClassName?: string;
  showPasswordToggle?: boolean;
}

export function TextInput({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  className = '',
  containerClassName = '',
  inputClassName = '',
  showPasswordToggle,
  secureTextEntry: initialSecureTextEntry,
  ...props
}: TextInputProps) {
  const [secureTextEntry, setSecureTextEntry] = useState(initialSecureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  const handlePasswordToggle = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const containerStyles = [
    'mb-4',
    containerClassName
  ].filter(Boolean).join(' ');

  const inputContainerStyles = [
    'flex-row items-center',
    'border rounded-lg px-3 py-3',
    'bg-white dark:bg-gray-800',
    error 
      ? 'border-error-500' 
      : isFocused 
        ? 'border-primary-500 dark:border-primary-400' 
        : 'border-gray-300 dark:border-gray-600',
    className
  ].filter(Boolean).join(' ');

  const textInputStyles = [
    'flex-1 text-base',
    'text-gray-900 dark:text-gray-100',
    leftIcon ? 'ml-2' : '',
    (rightIcon || showPasswordToggle) ? 'mr-2' : '',
    inputClassName
  ].filter(Boolean).join(' ');

  const actualRightIcon = showPasswordToggle && initialSecureTextEntry
    ? (secureTextEntry ? 'eye' : 'eye.slash')
    : rightIcon;

  const actualOnRightIconPress = showPasswordToggle && initialSecureTextEntry
    ? handlePasswordToggle
    : onRightIconPress;

  return (
    <View className={containerStyles}>
      {label && (
        <Text 
          variant="small" 
          className="text-gray-700 dark:text-gray-300 font-medium mb-2"
        >
          {label}
        </Text>
      )}
      
      <View className={inputContainerStyles}>
        {leftIcon && (
          <IconSymbol
            name={leftIcon as any}
            size={20}
            color={isFocused ? '#0ea5e9' : '#6b7280'}
          />
        )}
        
        <RNTextInput
          className={textInputStyles}
          placeholderTextColor="#9ca3af"
          secureTextEntry={secureTextEntry}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        
        {actualRightIcon && (
          <TouchableOpacity 
            onPress={actualOnRightIconPress}
            disabled={!actualOnRightIconPress}
            accessibilityRole="button"
            accessibilityLabel={
              showPasswordToggle 
                ? (secureTextEntry ? 'Show password' : 'Hide password')
                : 'Icon'
            }
          >
            <IconSymbol
              name={actualRightIcon as any}
              size={20}
              color={isFocused ? '#0ea5e9' : '#6b7280'}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text 
          variant="small" 
          className="text-error-500 mt-1"
          accessibilityRole="alert"
        >
          {error}
        </Text>
      )}
      
      {hint && !error && (
        <Text 
          variant="caption" 
          className="text-gray-500 dark:text-gray-400 mt-1"
        >
          {hint}
        </Text>
      )}
    </View>
  );
}