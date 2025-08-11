import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

export interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'caption';
  className?: string;
  lightColor?: string;
  darkColor?: string;
}

export function Text({
  variant = 'body',
  className = '',
  style,
  lightColor,
  darkColor,
  children,
  ...props
}: TextProps) {
  const colorScheme = useColorScheme();
  
  // Base styles for each variant
  const variantStyles = {
    h1: 'text-3xl font-bold leading-tight',
    h2: 'text-2xl font-bold leading-tight',
    h3: 'text-xl font-semibold leading-tight',
    body: 'text-base leading-relaxed',
    small: 'text-sm leading-relaxed',
    caption: 'text-xs leading-normal',
  };

  // Default dark mode text colors
  const defaultColors = {
    h1: 'text-gray-900 dark:text-gray-100',
    h2: 'text-gray-900 dark:text-gray-100', 
    h3: 'text-gray-900 dark:text-gray-100',
    body: 'text-gray-700 dark:text-gray-300',
    small: 'text-gray-600 dark:text-gray-400',
    caption: 'text-gray-500 dark:text-gray-500',
  };

  // Build className with variant and dark mode support
  const combinedClassName = [
    variantStyles[variant],
    defaultColors[variant],
    className
  ].filter(Boolean).join(' ');

  // Handle custom colors if provided
  const customColor = lightColor || darkColor 
    ? (colorScheme === 'dark' ? darkColor : lightColor) 
    : undefined;

  return (
    <RNText
      className={combinedClassName}
      style={[
        customColor ? { color: customColor } : {},
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}