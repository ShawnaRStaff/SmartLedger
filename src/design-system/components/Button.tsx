import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { createThemedStyles, useTheme } from '../theme';

// ============================================================================
// BUTTON PROPS INTERFACE
// ============================================================================
export interface ButtonProps extends TouchableOpacityProps {
  /**
   * Button variant affecting color scheme
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'error';
  
  /**
   * Button size affecting padding and text size
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Show loading spinner
   */
  loading?: boolean;
  
  /**
   * Full width button
   */
  fullWidth?: boolean;
  
  /**
   * Icon to show before text
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Icon to show after text
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Button text content
   */
  children: React.ReactNode;
}

// ============================================================================
// BUTTON COMPONENT
// ============================================================================
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const styles = useStyles();
  const theme = useTheme();
  
  const isDisabled = disabled || loading;

  // Get variant styles
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    const { colors } = theme;
    
    switch (variant) {
      case 'primary':
        return {
          container: { 
            backgroundColor: isDisabled ? colors.disabled : colors.primary,
          },
          text: { 
            color: colors.textInverse,
          },
        };
        
      case 'secondary':
        return {
          container: { 
            backgroundColor: isDisabled ? colors.disabled : colors.secondary,
          },
          text: { 
            color: colors.textInverse,
          },
        };
        
      case 'outline':
        return {
          container: { 
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: isDisabled ? colors.disabled : colors.primary,
          },
          text: { 
            color: isDisabled ? colors.disabled : colors.primary,
          },
        };
        
      case 'ghost':
        return {
          container: { 
            backgroundColor: 'transparent',
          },
          text: { 
            color: isDisabled ? colors.disabled : colors.primary,
          },
        };
        
      case 'success':
        return {
          container: { 
            backgroundColor: isDisabled ? colors.disabled : colors.success,
          },
          text: { 
            color: colors.textInverse,
          },
        };
        
      case 'warning':
        return {
          container: { 
            backgroundColor: isDisabled ? colors.disabled : colors.warning,
          },
          text: { 
            color: colors.textInverse,
          },
        };
        
      case 'error':
        return {
          container: { 
            backgroundColor: isDisabled ? colors.disabled : colors.error,
          },
          text: { 
            color: colors.textInverse,
          },
        };
        
      default:
        return {
          container: { backgroundColor: colors.primary },
          text: { color: colors.textInverse },
        };
    }
  };

  const variantStyles = getVariantStyles();
  
  const containerStyle = [
    styles.base,
    styles[size],
    variantStyles.container,
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`text_${size}`],
    variantStyles.text,
  ];

  const getLoaderColor = () => {
    if (variant === 'outline' || variant === 'ghost') {
      return theme.colors.primary;
    }
    return theme.colors.textInverse;
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      {...props}
    >
      {leftIcon && !loading && leftIcon}
      
      {loading ? (
        <ActivityIndicator 
          size={size === 'sm' ? 'small' : 'small'} 
          color={getLoaderColor()}
          style={leftIcon || rightIcon ? styles.loaderWithIcon : undefined}
        />
      ) : null}
      
      <Text style={textStyle}>{children}</Text>
      
      {rightIcon && !loading && rightIcon}
    </TouchableOpacity>
  );
}

// ============================================================================
// THEMED STYLES
// ============================================================================
const useStyles = createThemedStyles((theme) => ({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  
  // Size variants
  sm: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: theme.layout.componentHeight.buttonSm,
  },
  
  md: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: theme.layout.componentHeight.buttonMd,
  },
  
  lg: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: theme.layout.componentHeight.buttonLg,
  },
  
  // Layout
  fullWidth: {
    width: '100%',
  },
  
  disabled: {
    opacity: theme.opacity.disabled,
  },
  
  // Text styles
  text: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  
  text_sm: {
    fontSize: theme.typography.fontSize.sm,
  },
  
  text_md: {
    fontSize: theme.typography.fontSize.button,
  },
  
  text_lg: {
    fontSize: theme.typography.fontSize.lg,
  },
  
  loaderWithIcon: {
    marginRight: theme.spacing.sm,
  },
}));