import React, { useState, forwardRef } from 'react';
import { 
  TextInput as RNTextInput, 
  TextInputProps as RNTextInputProps, 
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle
} from 'react-native';
import { IconSymbol } from './IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

export interface TextInputProps extends Omit<RNTextInputProps, 'placeholderTextColor'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  showPasswordToggle?: boolean;
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
    style,
    ...props
  }, ref) => {
    const [secureTextEntry, setSecureTextEntry] = useState(initialSecureTextEntry);
    const [isFocused, setIsFocused] = useState(false);

    const borderColor = useThemeColor({ light: '#D1D5DB', dark: '#4B5563' }, 'text');
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const placeholderColor = useThemeColor({ light: '#9CA3AF', dark: '#6B7280' }, 'text');
    const primaryColor = useThemeColor({}, 'tint');
    const errorColor = '#EF4444';
    const iconColor = isFocused ? primaryColor : '#6B7280';

    const handlePasswordToggle = () => {
      setSecureTextEntry(!secureTextEntry);
    };

    const actualRightIcon = showPasswordToggle && initialSecureTextEntry
      ? (secureTextEntry ? 'eye' : 'eye.slash')
      : rightIcon;

    const actualOnRightIconPress = showPasswordToggle && initialSecureTextEntry
      ? handlePasswordToggle
      : onRightIconPress;

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text style={[styles.label, { color: textColor }]}>
            {label}
          </Text>
        )}
        
        <View style={[
          styles.inputContainer,
          {
            borderColor: error ? errorColor : (isFocused ? primaryColor : borderColor),
            backgroundColor,
          }
        ]}>
          {leftIcon && (
            <IconSymbol
              name={leftIcon as any}
              size={20}
              color={iconColor}
              style={styles.leftIcon}
            />
          )}
          
          <RNTextInput
            ref={ref}
            style={[
              styles.input,
              { color: textColor },
              leftIcon && styles.inputWithLeftIcon,
              (rightIcon || showPasswordToggle) && styles.inputWithRightIcon,
              style,
            ]}
            placeholderTextColor={placeholderColor}
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
              style={styles.rightIconButton}
            >
              <IconSymbol
                name={actualRightIcon as any}
                size={20}
                color={iconColor}
              />
            </TouchableOpacity>
          )}
        </View>
        
        {error && (
          <Text 
            style={[styles.errorText, { color: errorColor }]}
            accessibilityRole="alert"
          >
            {error}
          </Text>
        )}
        
        {hint && !error && (
          <Text style={[styles.hintText, { color: placeholderColor }]}>
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
  leftIcon: {
    marginRight: 4,
  },
  rightIconButton: {
    padding: 4,
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