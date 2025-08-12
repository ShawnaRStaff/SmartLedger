/**
 * SmartLedger Design System
 * 
 * A comprehensive design system for consistent UI across the SmartLedger app.
 * Includes tokens, themes, and components built for financial applications.
 */

// ============================================================================
// CORE THEME EXPORTS
// ============================================================================
export * from './theme';

// ============================================================================
// COMPONENT EXPORTS
// ============================================================================
export { Button } from './components/Button';
export type { ButtonProps } from './components/Button';

export { TextInput } from './components/TextInput';
export type { TextInputProps } from './components/TextInput';

export { 
  Typography, 
  Heading1, 
  Heading2, 
  Heading3, 
  Heading4, 
  Heading5, 
  Heading6,
  Body1,
  Body2,
  Subtitle1,
  Subtitle2,
  Caption,
  Overline
} from './components/Typography';
export type { TypographyProps } from './components/Typography';

export { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter 
} from './components/Card';
export type { CardProps, PressableCardProps } from './components/Card';

// ============================================================================
// DESIGN SYSTEM VERSION
// ============================================================================
export const DESIGN_SYSTEM_VERSION = '1.0.0';

// ============================================================================
// USAGE EXAMPLES AND DOCUMENTATION
// ============================================================================

/**
 * Basic Usage Examples:
 * 
 * ```tsx
 * import { 
 *   ThemeProvider, 
 *   useTheme, 
 *   Button, 
 *   TextInput, 
 *   Typography,
 *   Card 
 * } from '@/design-system';
 * 
 * // Wrap your app with ThemeProvider
 * function App() {
 *   return (
 *     <ThemeProvider>
 *       <YourAppContent />
 *     </ThemeProvider>
 *   );
 * }
 * 
 * // Use components in your screens
 * function LoginScreen() {
 *   const theme = useTheme();
 *   
 *   return (
 *     <Card variant="elevated" padding="lg">
 *       <Typography variant="h2">Welcome Back</Typography>
 *       
 *       <TextInput
 *         label="Email"
 *         placeholder="Enter your email"
 *         leftIcon={<EmailIcon />}
 *       />
 *       
 *       <Button variant="primary" fullWidth>
 *         Sign In
 *       </Button>
 *     </Card>
 *   );
 * }
 * 
 * // Create custom themed styles
 * const useStyles = createThemedStyles((theme) => ({
 *   container: {
 *     padding: theme.spacing.lg,
 *     backgroundColor: theme.colors.background,
 *   },
 *   title: {
 *     fontSize: theme.typography.fontSize.h1,
 *     color: theme.colors.primary,
 *   },
 * }));
 * ```
 */

/**
 * Design System Features:
 * 
 * ✅ Semantic color system with light/dark theme support
 * ✅ 8pt spacing system for consistent layouts
 * ✅ Typography scale with proper line heights
 * ✅ Elevation system with platform-optimized shadows
 * ✅ Accessible components with ARIA labels
 * ✅ TypeScript support throughout
 * ✅ Responsive design tokens
 * ✅ Animation and timing constants
 * ✅ Financial app specific colors (profit/loss/pending)
 * 
 * Component Library:
 * - Button (7 variants, 3 sizes)
 * - TextInput (with icons, validation, password toggle)
 * - Typography (comprehensive text component system)
 * - Card (elevated, outlined, pressable variants)
 * - Theme system (automatic light/dark mode)
 * 
 * Design Tokens:
 * - Colors: 40+ semantic colors
 * - Spacing: 8pt grid system (8 sizes)
 * - Typography: 13 text styles + 5 weights
 * - Shadows: 6 elevation levels
 * - Border radius: 8 radius options
 * - Animation: 5 duration presets
 */