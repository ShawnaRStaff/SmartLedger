import React from 'react';
import { 
  TouchableOpacity, 
  TouchableOpacityProps, 
  ActivityIndicator, 
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  
  const primaryColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  
  const isDisabled = disabled || loading;

  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.base];
    
    // Size styles
    if (size === 'sm') baseStyle.push(styles.sm);
    else if (size === 'lg') baseStyle.push(styles.lg);
    else baseStyle.push(styles.md);

    // Variant styles
    if (variant === 'primary') {
      baseStyle.push({ backgroundColor: primaryColor });
    } else if (variant === 'secondary') {
      baseStyle.push({ backgroundColor: '#6B7280' });
    } else if (variant === 'outline') {
      baseStyle.push(styles.outline, { borderColor: primaryColor });
    } else if (variant === 'ghost') {
      baseStyle.push(styles.ghost);
    }

    if (isDisabled) {
      baseStyle.push(styles.disabled);
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle[] => {
    const textStyles: TextStyle[] = [styles.text];
    
    // Size text styles
    if (size === 'sm') textStyles.push(styles.textSm);
    else if (size === 'lg') textStyles.push(styles.textLg);
    else textStyles.push(styles.textMd);

    // Variant text styles
    if (variant === 'primary' || variant === 'secondary') {
      textStyles.push(styles.textWhite);
    } else if (variant === 'outline' || variant === 'ghost') {
      textStyles.push({ color: primaryColor });
    }

    if (isDisabled) {
      textStyles.push(styles.textDisabled);
    }

    return textStyles;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style as ViewStyle]}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      {...props}
    >
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' || variant === 'secondary' ? '#FFFFFF' : primaryColor}
          style={styles.loader}
        />
      )}
      <Text style={getTextStyle()}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  sm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 32,
  },
  md: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  lg: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 52,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
  },
  textSm: {
    fontSize: 14,
  },
  textMd: {
    fontSize: 16,
  },
  textLg: {
    fontSize: 18,
  },
  textWhite: {
    color: '#FFFFFF',
  },
  textDisabled: {
    opacity: 0.7,
  },
  loader: {
    marginRight: 8,
  },
});