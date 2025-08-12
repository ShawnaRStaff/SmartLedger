import React, { useState, forwardRef } from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../theme';

export interface TextInputProps extends Omit<RNTextInputProps, 'placeholderTextColor'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  showPasswordToggle?: boolean;
  required?: boolean;
}

export const TextInput = forwardRef<RNTextInput, TextInputProps>(
  ({
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    onRightIconPress,
    containerStyle,
    showPasswordToggle,
    secureTextEntry: initialSecureTextEntry,
    required,
    style,
    ...props
  }, ref) => {
    const [secureTextEntry, setSecureTextEntry] = useState(initialSecureTextEntry);
    const [isFocused, setIsFocused] = useState(false);
    
    const theme = useTheme();

    const handlePasswordToggle = () => {
      setSecureTextEntry(!secureTextEntry);
    };

    const actualRightIcon = showPasswordToggle && initialSecureTextEntry
      ? (
          <TouchableOpacity 
            onPress={handlePasswordToggle}
            style={styles.iconButton}
          >
            <Text style={styles.passwordToggle}>
              {secureTextEntry ? '👁️' : '🙈'}
            </Text>
          </TouchableOpacity>
        )
      : rightIcon;

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text style={[styles.label, { color: theme.colors.text }]}>
            {label}
            {required && <Text style={[styles.required, { color: theme.colors.error }]}> *</Text>}
          </Text>
        )}
        
        <View style={[
          styles.inputContainer,
          {
            borderColor: error ? theme.colors.error : (isFocused ? theme.colors.primary : theme.colors.border),
            backgroundColor: theme.colors.surface,
          }
        ]}>
          {leftIcon && (
            <View style={styles.leftIconContainer}>
              {leftIcon}
            </View>
          )}
          
          <RNTextInput
            ref={ref}
            style={[
              styles.input,
              { color: theme.colors.text },
              leftIcon ? styles.inputWithLeftIcon : undefined,
              actualRightIcon ? styles.inputWithRightIcon : undefined,
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
              {actualRightIcon}
            </View>
          )}
        </View>
        
        {error && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
        )}
        
        {hint && !error && (
          <Text style={[styles.hintText, { color: theme.colors.textSecondary }]}>
            {hint}
          </Text>
        )}
      </View>
    );
  }
);

TextInput.displayName = 'TextInput';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  required: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  inputWithLeftIcon: {
    marginLeft: 8,
  },
  inputWithRightIcon: {
    marginRight: 8,
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
    padding: 4,
  },
  passwordToggle: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  hintText: {
    fontSize: 12,
    marginTop: 4,
  },
});