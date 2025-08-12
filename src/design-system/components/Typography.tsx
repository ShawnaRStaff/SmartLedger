import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { createThemedStyles, useTheme } from '../theme';

// ============================================================================
// TYPOGRAPHY COMPONENT PROPS
// ============================================================================
export interface TypographyProps extends RNTextProps {
  /**
   * Typography variant
   */
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'subtitle1' | 'subtitle2' | 'caption' | 'overline' | 'button';
  
  /**
   * Text color semantic key
   */
  color?: 'primary' | 'secondary' | 'text' | 'textSecondary' | 'textTertiary' | 'success' | 'warning' | 'error' | 'info';
  
  /**
   * Text alignment
   */
  align?: 'left' | 'center' | 'right' | 'justify';
  
  /**
   * Font weight override
   */
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  
  /**
   * Whether text should be selectable
   */
  selectable?: boolean;
  
  /**
   * Number of lines before truncation
   */
  numberOfLines?: number;
  
  children: React.ReactNode;
}

// ============================================================================
// TYPOGRAPHY COMPONENT
// ============================================================================
export function Typography({
  variant = 'body1',
  color = 'text',
  align = 'left',
  weight,
  style,
  children,
  ...props
}: TypographyProps) {
  const styles = useStyles();
  const theme = useTheme();
  
  const getColorValue = () => {
    switch (color) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'text':
        return theme.colors.text;
      case 'textSecondary':
        return theme.colors.textSecondary;
      case 'textTertiary':
        return theme.colors.textTertiary;
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'error':
        return theme.colors.error;
      case 'info':
        return theme.colors.info;
      default:
        return theme.colors.text;
    }
  };
  
  const textStyle = [
    styles[variant],
    { color: getColorValue() },
    align !== 'left' && { textAlign: align },
    weight && styles[`weight_${weight}`],
    style,
  ];

  return (
    <RNText style={textStyle} {...props}>
      {children}
    </RNText>
  );
}

// ============================================================================
// CONVENIENCE COMPONENTS
// ============================================================================
export const Heading1 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h1" {...props} />
);

export const Heading2 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h2" {...props} />
);

export const Heading3 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h3" {...props} />
);

export const Heading4 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h4" {...props} />
);

export const Heading5 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h5" {...props} />
);

export const Heading6 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h6" {...props} />
);

export const Body1 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="body1" {...props} />
);

export const Body2 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="body2" {...props} />
);

export const Subtitle1 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="subtitle1" {...props} />
);

export const Subtitle2 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="subtitle2" {...props} />
);

export const Caption = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="caption" {...props} />
);

export const Overline = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="overline" {...props} />
);

// ============================================================================
// THEMED STYLES
// ============================================================================
const useStyles = createThemedStyles((theme) => ({
  // Heading variants
  h1: {
    fontSize: theme.typography.fontSize.h1,
    fontWeight: theme.typography.fontWeight.bold,
    lineHeight: theme.typography.fontSize.h1 * theme.typography.lineHeight.tight,
    marginBottom: theme.spacing.lg,
  },
  
  h2: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: theme.typography.fontWeight.bold,
    lineHeight: theme.typography.fontSize.h2 * theme.typography.lineHeight.tight,
    marginBottom: theme.spacing.lg,
  },
  
  h3: {
    fontSize: theme.typography.fontSize.h3,
    fontWeight: theme.typography.fontWeight.semibold,
    lineHeight: theme.typography.fontSize.h3 * theme.typography.lineHeight.tight,
    marginBottom: theme.spacing.md,
  },
  
  h4: {
    fontSize: theme.typography.fontSize.h4,
    fontWeight: theme.typography.fontWeight.semibold,
    lineHeight: theme.typography.fontSize.h4 * theme.typography.lineHeight.normal,
    marginBottom: theme.spacing.md,
  },
  
  h5: {
    fontSize: theme.typography.fontSize.h5,
    fontWeight: theme.typography.fontWeight.medium,
    lineHeight: theme.typography.fontSize.h5 * theme.typography.lineHeight.normal,
    marginBottom: theme.spacing.sm,
  },
  
  h6: {
    fontSize: theme.typography.fontSize.h6,
    fontWeight: theme.typography.fontWeight.medium,
    lineHeight: theme.typography.fontSize.h6 * theme.typography.lineHeight.normal,
    marginBottom: theme.spacing.sm,
  },
  
  // Body variants
  body1: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.regular,
    lineHeight: theme.typography.fontSize.md * theme.typography.lineHeight.normal,
  },
  
  body2: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.regular,
    lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.normal,
  },
  
  subtitle1: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium,
    lineHeight: theme.typography.fontSize.lg * theme.typography.lineHeight.normal,
  },
  
  subtitle2: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    lineHeight: theme.typography.fontSize.md * theme.typography.lineHeight.normal,
  },
  
  caption: {
    fontSize: theme.typography.fontSize.caption,
    fontWeight: theme.typography.fontWeight.regular,
    lineHeight: theme.typography.fontSize.caption * theme.typography.lineHeight.normal,
  },
  
  overline: {
    fontSize: theme.typography.fontSize.overline,
    fontWeight: theme.typography.fontWeight.medium,
    lineHeight: theme.typography.fontSize.overline * theme.typography.lineHeight.normal,
    textTransform: 'uppercase',
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  
  button: {
    fontSize: theme.typography.fontSize.button,
    fontWeight: theme.typography.fontWeight.semibold,
    lineHeight: theme.typography.fontSize.button * theme.typography.lineHeight.tight,
  },
  
  // Weight overrides
  weight_regular: {
    fontWeight: theme.typography.fontWeight.regular,
  },
  
  weight_medium: {
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  weight_semibold: {
    fontWeight: theme.typography.fontWeight.semibold,
  },
  
  weight_bold: {
    fontWeight: theme.typography.fontWeight.bold,
  },
}));