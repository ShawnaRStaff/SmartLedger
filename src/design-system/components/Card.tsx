import React from 'react';
import {
  View,
  ViewProps,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { createThemedStyles } from '../theme';

// ============================================================================
// CARD PROPS INTERFACE
// ============================================================================
interface BaseCardProps {
  /**
   * Card variant affecting visual appearance
   */
  variant?: 'default' | 'elevated' | 'outlined';

  /**
   * Card padding size
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';

  /**
   * Border radius size
   */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Whether card should have full width
   */
  fullWidth?: boolean;
}

export interface CardProps extends Omit<ViewProps, 'children'>, BaseCardProps {
  /**
   * Make card pressable
   */
  onPress?: never;
  children: React.ReactNode;
}

export interface PressableCardProps
  extends Omit<TouchableOpacityProps, 'children'>,
    BaseCardProps {
  /**
   * Press handler for interactive cards
   */
  onPress: () => void;
  children: React.ReactNode;
}

// ============================================================================
// CARD COMPONENT
// ============================================================================
export function Card({
  variant = 'default',
  padding = 'md',
  radius = 'md',
  fullWidth = false,
  children,
  style,
  onPress,
  ...props
}: CardProps | PressableCardProps) {
  const styles = useStyles();

  const getCardStyle = () => {
    const baseStyle = [
      styles.base,
      styles[`variant_${variant}`],
      padding !== 'none' && styles[`padding_${padding}`],
      radius !== 'none' && styles[`radius_${radius}`],
      fullWidth && styles.fullWidth,
      style,
    ];

    return baseStyle;
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={getCardStyle()}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        {...(props as TouchableOpacityProps)}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={getCardStyle()} {...(props as ViewProps)}>
      {children}
    </View>
  );
}

// ============================================================================
// CARD HEADER COMPONENT
// ============================================================================
interface CardHeaderProps extends ViewProps {
  children: React.ReactNode;
}

export function CardHeader({ children, style, ...props }: CardHeaderProps) {
  const styles = useStyles();

  return (
    <View style={[styles.header, style]} {...props}>
      {children}
    </View>
  );
}

// ============================================================================
// CARD CONTENT COMPONENT
// ============================================================================
interface CardContentProps extends ViewProps {
  children: React.ReactNode;
}

export function CardContent({ children, style, ...props }: CardContentProps) {
  const styles = useStyles();

  return (
    <View style={[styles.content, style]} {...props}>
      {children}
    </View>
  );
}

// ============================================================================
// CARD FOOTER COMPONENT
// ============================================================================
interface CardFooterProps extends ViewProps {
  children: React.ReactNode;
}

export function CardFooter({ children, style, ...props }: CardFooterProps) {
  const styles = useStyles();

  return (
    <View style={[styles.footer, style]} {...props}>
      {children}
    </View>
  );
}

// ============================================================================
// THEMED STYLES
// ============================================================================
const useStyles = createThemedStyles((theme) => ({
  base: {
    backgroundColor: theme.colors.surface,
  },

  // Variant styles
  variant_default: {
    backgroundColor: theme.colors.surface,
  },

  variant_elevated: {
    backgroundColor: theme.colors.surface,
    ...theme.shadows.md,
  },

  variant_outlined: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  // Padding variants
  padding_sm: {
    padding: theme.spacing.md,
  },

  padding_md: {
    padding: theme.spacing.lg,
  },

  padding_lg: {
    padding: theme.spacing.xl,
  },

  // Radius variants
  radius_sm: {
    borderRadius: theme.borderRadius.sm,
  },

  radius_md: {
    borderRadius: theme.borderRadius.md,
  },

  radius_lg: {
    borderRadius: theme.borderRadius.lg,
  },

  radius_xl: {
    borderRadius: theme.borderRadius.xl,
  },

  // Layout
  fullWidth: {
    width: '100%',
  },

  // Card sections
  header: {
    marginBottom: theme.spacing.md,
  },

  content: {
    flex: 1,
  },

  footer: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
}));
