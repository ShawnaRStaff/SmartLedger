/**
 * SmartLedger Check Register - Account Form Component
 * Presentational component for account creation and editing
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  useColorScheme,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Typography, useTheme } from '@/design-system';
import { ProfessionalAlert } from '@/components/ui/ProfessionalAlert';
import {
  validateSchema,
  CreateAccountSchema,
  UpdateAccountSchema,
} from '../../utils/validation';
import type {
  Account,
  CreateAccountInput,
  UpdateAccountInput,
  AccountType,
  AccountStatus,
} from '../../types';

// ============================================================================
// INTERFACES
// ============================================================================

export interface AccountFormProps {
  account?: Account; // For editing existing account
  onSubmit: (data: CreateAccountInput | UpdateAccountInput) => void;
  onCancel: () => void;
  loading?: boolean;
  testID?: string;
}

export interface AccountFormData {
  name: string;
  type: AccountType;
  startingBalance: string;
  currency: string;
  description: string;
  institution: string;
  accountNumber: string;
  color: string;
  icon: string;
  includeInTotals: boolean;
  sortOrder: string;
  status?: AccountStatus;
}

// ============================================================================
// PROFESSIONAL COLOR PALETTE
// ============================================================================

const COLORS = {
  // Primary Colors
  navy: '#1A237E',
  darkNavy: '#0D47A1',
  accent: '#1976D2',
  accentLight: '#42A5F5',
  accentDark: '#0D47A1',

  // Secondary Colors
  forest: '#2E7D32',
  darkForest: '#1B5E20',

  // Status Colors
  success: '#2E7D32',
  warning: '#F57C00',
  error: '#C62828',

  // Light Mode Colors
  surface: '#FFFFFF',
  textPrimary: '#263238',
  textSecondary: '#546E7A',

  // Dark Mode Colors
  darkSurface: '#1E1E1E',
  darkSurfaceElevated: '#252525',
  darkTextPrimary: '#FFFFFF',
  darkTextSecondary: '#B0B0B0',

  // Glass Effects
  shadow: 'rgba(0, 0, 0, 0.08)',
};

// ============================================================================
// CONSTANTS
// ============================================================================

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'checking', label: 'Checking Account' },
  { value: 'savings', label: 'Savings Account' },
  { value: 'cash', label: 'Cash' },
  { value: 'credit', label: 'Credit Card' },
  { value: 'investment', label: 'Investment Account' },
  { value: 'other', label: 'Other' },
];

const ACCOUNT_STATUSES: { value: AccountStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'closed', label: 'Closed' },
];

const PREDEFINED_COLORS = [
  '#0a7ea4',
  '#16a34a',
  '#dc2626',
  '#7c3aed',
  '#ea580c',
  '#0891b2',
  '#059669',
  '#b91c1c',
  '#9333ea',
  '#c2410c',
  '#0284c7',
  '#047857',
  '#991b1b',
  '#7c2d12',
  '#92400e',
];

const DEFAULT_ICONS = [
  'account-balance-wallet',
  'account-balance',
  'savings',
  'credit-card',
  'trending-up',
  'attach-money',
  'account-box',
  'business',
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AccountForm: React.FC<AccountFormProps> = ({
  account,
  onSubmit,
  onCancel,
  loading = false,
  testID,
}) => {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // ============================================================================
  // FORM STATE
  // ============================================================================

  const [formData, setFormData] = useState<AccountFormData>({
    name: account?.name || '',
    type: account?.type || 'checking',
    startingBalance: account?.startingBalance?.toString() || '0',
    currency: account?.currency || 'USD',
    description: account?.description || '',
    institution: account?.institution || '',
    accountNumber: account?.accountNumber || '',
    color: account?.color || PREDEFINED_COLORS[0],
    icon: account?.icon || DEFAULT_ICONS[0],
    includeInTotals: account?.includeInTotals ?? true,
    sortOrder: account?.sortOrder?.toString() || '0',
    status: account?.status,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isEditing = !!account;

  // ============================================================================
  // FORM VALIDATION
  // ============================================================================

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Convert form data to validation format
    const validationData = {
      name: formData.name.trim(),
      type: formData.type,
      startingBalance: parseFloat(formData.startingBalance) || 0,
      currency: formData.currency,
      description: formData.description.trim() || undefined,
      institution: formData.institution.trim() || undefined,
      accountNumber: formData.accountNumber.trim() || undefined,
      color: formData.color,
      icon: formData.icon,
      includeInTotals: formData.includeInTotals,
      sortOrder: parseInt(formData.sortOrder) || 0,
    };

    // Add status for editing
    if (isEditing && formData.status) {
      (validationData as any).status = formData.status;
    }

    // Validate with appropriate schema
    const validation = isEditing
      ? validateSchema(UpdateAccountSchema, validationData)
      : validateSchema(CreateAccountSchema, validationData);

    if (!validation.success) {
      validation.errors?.issues.forEach((issue: any) => {
        const fieldName = issue.path.join('.');
        newErrors[fieldName] = issue.message;
      });
    }

    // Additional custom validations
    if (!formData.name.trim()) {
      newErrors.name = 'Account name is required';
    }

    if (formData.accountNumber && formData.accountNumber.length > 4) {
      newErrors.accountNumber = 'Only last 4 digits allowed';
    }

    if (formData.accountNumber && !/^\d*$/.test(formData.accountNumber)) {
      newErrors.accountNumber = 'Must be numeric';
    }

    const balance = parseFloat(formData.startingBalance);
    if (isNaN(balance) || balance < 0) {
      newErrors.startingBalance = 'Must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================================
  // FORM HANDLERS
  // ============================================================================

  const handleInputChange = (
    field: keyof AccountFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      ProfessionalAlert.error(
        'Validation Error',
        'Please fix the errors below and try again.'
      );
      return;
    }

    const submissionData = {
      name: formData.name.trim(),
      type: formData.type,
      startingBalance: parseFloat(formData.startingBalance) || 0,
      currency: formData.currency,
      description: formData.description.trim() || undefined,
      institution: formData.institution.trim() || undefined,
      accountNumber: formData.accountNumber.trim() || undefined,
      color: formData.color,
      icon: formData.icon,
      includeInTotals: formData.includeInTotals,
      sortOrder: parseInt(formData.sortOrder) || 0,
    };

    // Add status for editing
    if (isEditing && formData.status) {
      (submissionData as any).status = formData.status;
    }

    onSubmit(submissionData);
  };

  const handleColorSelect = (color: string) => {
    handleInputChange('color', color);
  };

  const handleIconSelect = (icon: string) => {
    handleInputChange('icon', icon);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderInput = (
    field: keyof AccountFormData,
    label: string,
    placeholder?: string,
    keyboardType: any = 'default',
    multiline: boolean = false
  ) => (
    <View style={styles.inputGroup}>
      <Typography variant="body2" style={styles.label}>
        {label}
      </Typography>
      <TextInput
        style={[
          styles.input,
          {
            borderColor: errors[field]
              ? theme.colors.error
              : theme.colors.border,
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
          },
          multiline && styles.textArea,
        ]}
        value={formData[field] as string}
        onChangeText={(value) => handleInputChange(field, value)}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        testID={`${testID}-${field}`}
      />
      {errors[field] && (
        <Typography variant="caption" style={styles.errorText}>
          {errors[field]}
        </Typography>
      )}
    </View>
  );

  const renderPicker = (
    field: keyof AccountFormData,
    label: string,
    options: { value: string; label: string }[]
  ) => (
    <View style={styles.inputGroup}>
      <Typography variant="body2" style={styles.label}>
        {label}
      </Typography>
      <View
        style={[
          styles.pickerContainer,
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        {options.map((option) => (
          <Pressable
            key={option.value}
            style={[
              styles.pickerOption,
              formData[field] === option.value && {
                backgroundColor: theme.colors.primary,
              },
            ]}
            onPress={() => handleInputChange(field, option.value)}
            testID={`${testID}-${field}-${option.value}`}
          >
            <Text
              style={[
                styles.pickerOptionText,
                {
                  color:
                    formData[field] === option.value
                      ? '#FFFFFF'
                      : theme.colors.text,
                },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
      {errors[field] && (
        <Typography variant="caption" style={styles.errorText}>
          {errors[field]}
        </Typography>
      )}
    </View>
  );

  const renderColorPicker = () => (
    <View style={styles.inputGroup}>
      <Typography variant="body2" style={styles.label}>
        Color
      </Typography>
      <View style={styles.colorGrid}>
        {PREDEFINED_COLORS.map((color) => (
          <Pressable
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              formData.color === color && styles.selectedColor,
            ]}
            onPress={() => handleColorSelect(color)}
            testID={`${testID}-color-${color}`}
          />
        ))}
      </View>
    </View>
  );

  const renderIconPicker = () => (
    <View style={styles.inputGroup}>
      <Typography variant="body2" style={styles.label}>
        Icon
      </Typography>
      <View style={styles.iconGrid}>
        {DEFAULT_ICONS.map((icon) => (
          <Pressable
            key={icon}
            style={[
              styles.iconOption,
              { borderColor: theme.colors.border },
              formData.icon === icon && {
                backgroundColor: theme.colors.primary,
              },
            ]}
            onPress={() => handleIconSelect(icon)}
            testID={`${testID}-icon-${icon}`}
          >
            <Text
              style={[
                styles.iconText,
                {
                  color: formData.icon === icon ? '#FFFFFF' : theme.colors.text,
                },
              ]}
            >
              {icon.split('-')[0]}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const renderSwitch = (
    field: keyof AccountFormData,
    label: string,
    description?: string
  ) => (
    <View style={styles.switchGroup}>
      <View style={styles.switchLabelContainer}>
        <Typography variant="body2" style={styles.label}>
          {label}
        </Typography>
        {description && (
          <Typography
            variant="caption"
            color="textSecondary"
            style={styles.switchDescription}
          >
            {description}
          </Typography>
        )}
      </View>
      <Switch
        value={formData[field] as boolean}
        onValueChange={(value) => handleInputChange(field, value)}
        testID={`${testID}-${field}`}
      />
    </View>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface },
      ]}
    >
      {/* Professional Header */}
      <LinearGradient
        colors={[COLORS.accent, COLORS.accentDark]}
        style={styles.professionalHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Pressable onPress={onCancel} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="white" />
          </Pressable>
          <View style={styles.headerCenter}>
            <View style={styles.headerIconContainer}>
              <Ionicons
                name={isEditing ? 'pencil' : 'add-circle'}
                size={32}
                color="white"
              />
            </View>
            <Text style={styles.headerTitle}>
              {isEditing ? 'Edit Account' : 'Create Account'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isEditing
                ? 'Update account information'
                : 'Set up a new financial account'}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Typography variant="h4" style={styles.sectionTitle}>
              Basic Information
            </Typography>

            {renderInput('name', 'Account Name *', 'e.g., My Checking Account')}
            {renderPicker('type', 'Account Type *', ACCOUNT_TYPES)}
            {renderInput(
              'startingBalance',
              'Starting Balance *',
              '0.00',
              'numeric'
            )}
            {renderInput('currency', 'Currency', 'USD')}
          </View>

          {/* Optional Details */}
          <View style={styles.section}>
            <Typography variant="h4" style={styles.sectionTitle}>
              Optional Details
            </Typography>

            {renderInput(
              'description',
              'Description',
              'Account description',
              'default',
              true
            )}
            {renderInput('institution', 'Bank/Institution', 'e.g., Chase Bank')}
            {renderInput(
              'accountNumber',
              'Last 4 Digits',
              'e.g., 1234',
              'numeric'
            )}
          </View>

          {/* Appearance */}
          <View style={styles.section}>
            <Typography variant="h4" style={styles.sectionTitle}>
              Appearance
            </Typography>
            {renderColorPicker()}
            {renderIconPicker()}
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <Typography variant="h4" style={styles.sectionTitle}>
              Settings
            </Typography>

            {renderSwitch(
              'includeInTotals',
              'Include in Total Balance',
              'Whether this account should be included in total balance calculations'
            )}

            {/* Advanced Settings */}
            <Pressable
              style={styles.advancedToggle}
              onPress={() => setShowAdvanced(!showAdvanced)}
            >
              <Typography
                variant="body2"
                style={[
                  styles.advancedToggleText,
                  { color: theme.colors.primary },
                ]}
              >
                {showAdvanced ? '▼ Hide Advanced' : '▶ Show Advanced'}
              </Typography>
            </Pressable>

            {showAdvanced && (
              <>
                {renderInput('sortOrder', 'Sort Order', '0', 'numeric')}
                {isEditing &&
                  renderPicker('status', 'Status', ACCOUNT_STATUSES)}
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Professional Action Buttons */}
      <View
        style={[
          styles.actions,
          {
            backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
          },
        ]}
      >
        <Pressable
          style={[styles.actionButton, styles.cancelButton]}
          onPress={onCancel}
          disabled={loading}
          testID={`${testID}-cancel`}
        >
          <LinearGradient
            colors={
              isDark
                ? [COLORS.darkSurfaceElevated, COLORS.darkSurfaceElevated]
                : ['#F5F5F5', '#EEEEEE']
            }
            style={styles.buttonGradient}
          >
            <Ionicons
              name="close"
              size={18}
              color={isDark ? COLORS.darkTextPrimary : COLORS.textPrimary}
            />
            <Text
              style={[
                styles.cancelButtonText,
                {
                  color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
                },
              ]}
            >
              Cancel
            </Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          style={[styles.actionButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
          testID={`${testID}-submit`}
        >
          <LinearGradient
            colors={[COLORS.forest, COLORS.darkForest]}
            style={styles.buttonGradient}
          >
            <Ionicons
              name={loading ? 'hourglass' : isEditing ? 'checkmark' : 'add'}
              size={18}
              color="white"
            />
            <Text style={styles.submitButtonText}>
              {loading
                ? 'Saving...'
                : isEditing
                  ? 'Update Account'
                  : 'Create Account'}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Professional Header Styles
  professionalHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 30,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },

  headerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
    textAlign: 'center',
  },

  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },

  headerSpacer: {
    width: 40,
  },

  scrollView: {
    flex: 1,
  },

  form: {
    padding: 16,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },

  inputGroup: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },

  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },

  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },

  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },

  pickerOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },

  pickerOptionText: {
    fontSize: 14,
    textAlign: 'center',
  },

  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
  },

  selectedColor: {
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  iconOption: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconText: {
    fontSize: 12,
    fontWeight: '500',
  },

  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  switchLabelContainer: {
    flex: 1,
    marginRight: 16,
  },

  switchDescription: {
    fontSize: 12,
    marginTop: 2,
  },

  advancedToggle: {
    marginTop: 8,
  },

  advancedToggleText: {
    fontSize: 14,
    fontWeight: '500',
  },

  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  actionButton: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
  },

  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  cancelButton: {},

  disabledButton: {
    opacity: 0.6,
  },

  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AccountForm;
