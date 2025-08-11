import React, { useState, forwardRef } from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { createThemedStyles, useTheme } from '../theme';

// ============================================================================
// TEXT INPUT PROPS INTERFACE
// ============================================================================
export interface TextInputProps extends Omit<RNTextInputProps, 'placeholderTextColor'> {
  /**
   * Input label
   */
  label?: string;
  
  /**
   * Error message to display
   */
  error?: string;
  
  /**
   * Helper text to display below input
   */
  hint?: string;
  
  /**
   * Icon to display on the left side
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Icon to display on the right side
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Function to call when right icon is pressed
   */
  onRightIconPress?: () => void;
  
  /**
   * Container style override
   */
  containerStyle?: ViewStyle;
  
  /**
   * Input size
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Show password toggle for secure inputs
   */
  showPasswordToggle?: boolean;
  
  /**
   * Whether input is required (adds * to label)
   */
  required?: boolean;
}

// ============================================================================
// TEXT INPUT COMPONENT
// ============================================================================
export const TextInput = forwardRef<RNTextInput, TextInputProps>(
  ({
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    onRightIconPress,
    containerStyle,
    size = 'md',
    showPasswordToggle,
    secureTextEntry: initialSecureTextEntry,
    required,
    style,
    ...props
  }, ref) => {
    const [secureTextEntry, setSecureTextEntry] = useState(initialSecureTextEntry);
    const [isFocused, setIsFocused] = useState(false);
    
    const styles = useStyles();
    const theme = useTheme();

    const handlePasswordToggle = () => {
      setSecureTextEntry(!secureTextEntry);
    };

    const actualRightIcon = showPasswordToggle && initialSecureTextEntry
      ? (
          <TouchableOpacity 
            onPress={handlePasswordToggle}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel={secureTextEntry ? 'Show password' : 'Hide password'}
          >
            <Text style={styles.passwordToggle}>
              {secureTextEntry ? '👁️' : '🙈'}
            </Text>
          </TouchableOpacity>
        )
      : rightIcon;

    const actualOnRightIconPress = showPasswordToggle && initialSecureTextEntry
      ? handlePasswordToggle
      : onRightIconPress;

    // Get input container styles based on state
    const getInputContainerStyle = () => {
      const baseStyle = [styles.inputContainer, styles[`size_${size}`]];
      
      if (error) {
        baseStyle.push(styles.inputContainerError);
      } else if (isFocused) {
        baseStyle.push(styles.inputContainerFocused);
      } else {
        baseStyle.push(styles.inputContainerDefault);
      }
      
      return baseStyle;
    };

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        )}
        
        <View style={getInputContainerStyle()}>
          {leftIcon && (
            <View style={styles.leftIconContainer}>
              {leftIcon}
            </View>
          )}
          
          <RNTextInput
            ref={ref}
            style={[
              styles.input,
              leftIcon && styles.inputWithLeftIcon,
              (actualRightIcon || onRightIconPress) && styles.inputWithRightIcon,
              style,
            ]}
            placeholderTextColor={theme.colors.textTertiary}
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
            <View style={styles.rightIconContainer}>
              {onRightIconPress ? (
                <TouchableOpacity 
                  onPress={actualOnRightIconPress}
                  style={styles.iconButton}
                  accessibilityRole="button"
                >
                  {actualRightIcon}
                </TouchableOpacity>
              ) : (
                actualRightIcon
              )}
            </View>
          )}
        </View>
        
        {error && (
          <Text 
            style={styles.errorText}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            {error}
          </Text>
        )}
        
        {hint && !error && (
          <Text style={styles.hintText}>
            {hint}
          </Text>
        )}
      </View>
    );
  }
);

TextInput.displayName = 'TextInput';

// ============================================================================
// THEMED STYLES
// ============================================================================
const useStyles = createThemedStyles((theme) => ({
  container: {
    marginBottom: theme.spacing.md,
  },
  
  label: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  required: {
    color: theme.colors.error,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    backgroundColor: theme.colors.surface,
  },
  
  inputContainerDefault: {
    borderColor: theme.colors.border,
  },
  
  inputContainerFocused: {
    borderColor: theme.colors.borderFocused,
    ...theme.shadows.sm,
  },
  
  inputContainerError: {
    borderColor: theme.colors.borderError,
  },
  
  // Size variants
  size_sm: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: theme.layout.componentHeight.inputSm,
  },
  
  size_md: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    minHeight: theme.layout.componentHeight.inputMd,
  },
  
  size_lg: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    minHeight: theme.layout.componentHeight.inputLg,
  },
  
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    padding: 0, // Remove default padding
  },
  
  inputWithLeftIcon: {
    marginLeft: theme.spacing.sm,
  },
  
  inputWithRightIcon: {
    marginRight: theme.spacing.sm,
  },
  
  leftIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  rightIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  iconButton: {
    padding: theme.spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  passwordToggle: {
    fontSize: 16,
  },
  
  errorText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  
  hintText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
}));