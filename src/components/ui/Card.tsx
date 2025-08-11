import React from 'react';
import { View, ViewProps } from 'react-native';

export interface CardProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
}

export interface CardHeaderProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
}

export interface CardContentProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
}

export interface CardFooterProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className = '', children, ...props }: CardProps) {
  const cardStyles = [
    'bg-white dark:bg-gray-800',
    'border border-gray-200 dark:border-gray-700',
    'rounded-lg',
    'shadow-sm',
    className
  ].filter(Boolean).join(' ');

  return (
    <View className={cardStyles} {...props}>
      {children}
    </View>
  );
}

export function CardHeader({ className = '', children, ...props }: CardHeaderProps) {
  const headerStyles = [
    'p-4 pb-2',
    'border-b border-gray-100 dark:border-gray-700',
    className
  ].filter(Boolean).join(' ');

  return (
    <View className={headerStyles} {...props}>
      {children}
    </View>
  );
}

export function CardContent({ className = '', children, ...props }: CardContentProps) {
  const contentStyles = [
    'p-4',
    className
  ].filter(Boolean).join(' ');

  return (
    <View className={contentStyles} {...props}>
      {children}
    </View>
  );
}

export function CardFooter({ className = '', children, ...props }: CardFooterProps) {
  const footerStyles = [
    'p-4 pt-2',
    'border-t border-gray-100 dark:border-gray-700',
    className
  ].filter(Boolean).join(' ');

  return (
    <View className={footerStyles} {...props}>
      {children}
    </View>
  );
}