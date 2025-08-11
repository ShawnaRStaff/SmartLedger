import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { Text } from './Text';

export interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  className?: string;
  textClassName?: string;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  textClassName = '',
  children,
  ...props
}: ButtonProps) {
  
  const baseStyles = 'rounded-lg items-center justify-center flex-row';
  
  const sizeStyles = {
    sm: 'px-3 py-2 min-h-[32px]',
    md: 'px-4 py-3 min-h-[44px]',
    lg: 'px-6 py-4 min-h-[52px]',
  };

  const variantStyles = {
    primary: 'bg-primary-500 active:bg-primary-600 disabled:bg-gray-300 dark:disabled:bg-gray-600',
    secondary: 'bg-secondary-500 active:bg-secondary-600 disabled:bg-gray-300 dark:disabled:bg-gray-600',
    outline: 'border border-primary-500 bg-transparent active:bg-primary-50 dark:active:bg-primary-900 disabled:border-gray-300 dark:disabled:border-gray-600',
    ghost: 'bg-transparent active:bg-gray-100 dark:active:bg-gray-800',
  };

  const textStyles = {
    primary: 'text-white font-semibold',
    secondary: 'text-white font-semibold',
    outline: 'text-primary-500 font-semibold disabled:text-gray-400 dark:disabled:text-gray-500',
    ghost: 'text-primary-500 font-semibold disabled:text-gray-400 dark:disabled:text-gray-500',
  };

  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const isDisabled = disabled || loading;

  const buttonClassName = [
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    isDisabled ? 'opacity-50' : '',
    className
  ].filter(Boolean).join(' ');

  const buttonTextClassName = [
    textStyles[variant],
    textSizeStyles[size],
    textClassName
  ].filter(Boolean).join(' ');

  return (
    <TouchableOpacity
      className={buttonClassName}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      {...props}
    >
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' || variant === 'secondary' ? '#FFFFFF' : '#0ea5e9'}
          style={{ marginRight: 8 }}
        />
      )}
      <Text className={buttonTextClassName}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}