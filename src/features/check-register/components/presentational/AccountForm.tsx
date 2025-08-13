/**
 * SmartLedger Check Register - Account Form Component
 * Presentational component for account creation and editing
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  Switch
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { validateSchema, CreateAccountSchema, UpdateAccountSchema } from '../../utils/validation';
import type { 
  Account, 
  CreateAccountInput, 
  UpdateAccountInput,
  AccountType,
  AccountStatus 
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
// CONSTANTS
// ============================================================================

const ACCOUNT_TYPES: Array<{ value: AccountType; label: string }> = [
  { value: 'checking', label: 'Checking Account' },
  { value: 'savings', label: 'Savings Account' },
  { value: 'cash', label: 'Cash' },
  { value: 'credit', label: 'Credit Card' },
  { value: 'investment', label: 'Investment Account' },
  { value: 'other', label: 'Other' }
];

const ACCOUNT_STATUSES: Array<{ value: AccountStatus; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'closed', label: 'Closed' }
];

const PREDEFINED_COLORS = [
  '#0a7ea4', '#16a34a', '#dc2626', '#7c3aed', '#ea580c',
  '#0891b2', '#059669', '#b91c1c', '#9333ea', '#c2410c',
  '#0284c7', '#047857', '#991b1b', '#7c2d12', '#92400e'
];

const DEFAULT_ICONS = [
  'account-balance-wallet', 'account-balance', 'savings', 'credit-card',
  'trending-up', 'attach-money', 'account-box', 'business'
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AccountForm: React.FC<AccountFormProps> = ({
  account,
  onSubmit,
  onCancel,
  loading = false,
  testID
}) => {
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'tint');

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
    status: account?.status
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
      sortOrder: parseInt(formData.sortOrder) || 0
    };

    // Add status for editing
    if (isEditing && formData.status) {
      (validationData as any).status = formData.status;
    }

    // Validate with appropriate schema
    const schema = isEditing ? UpdateAccountSchema : CreateAccountSchema;
    const validation = validateSchema(schema, validationData);

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

  const handleInputChange = (field: keyof AccountFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors below and try again.');
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
      sortOrder: parseInt(formData.sortOrder) || 0
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
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TextInput
        style={[
          styles.input,
          { 
            borderColor: errors[field] ? '#F44336' : borderColor,
            backgroundColor: cardBackgroundColor,
            color: textColor
          },
          multiline && styles.textArea
        ]}
        value={formData[field] as string}
        onChangeText={(value) => handleInputChange(field, value)}
        placeholder={placeholder}
        placeholderTextColor={secondaryTextColor}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        testID={`${testID}-${field}`}
      />
      {errors[field] && (
        <ThemedText style={styles.errorText}>{errors[field]}</ThemedText>
      )}
    </View>
  );

  const renderPicker = (
    field: keyof AccountFormData,
    label: string,
    options: Array<{ value: string; label: string }>
  ) => (
    <View style={styles.inputGroup}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <View style={[styles.pickerContainer, { borderColor, backgroundColor: cardBackgroundColor }]}>
        {options.map((option) => (
          <Pressable
            key={option.value}
            style={[
              styles.pickerOption,
              formData[field] === option.value && { backgroundColor: primaryColor }
            ]}
            onPress={() => handleInputChange(field, option.value)}
            testID={`${testID}-${field}-${option.value}`}
          >
            <Text style={[
              styles.pickerOptionText,
              { color: formData[field] === option.value ? '#FFFFFF' : textColor }
            ]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
      {errors[field] && (
        <ThemedText style={styles.errorText}>{errors[field]}</ThemedText>
      )}
    </View>
  );

  const renderColorPicker = () => (
    <View style={styles.inputGroup}>
      <ThemedText style={styles.label}>Color</ThemedText>
      <View style={styles.colorGrid}>
        {PREDEFINED_COLORS.map((color) => (
          <Pressable
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              formData.color === color && styles.selectedColor
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
      <ThemedText style={styles.label}>Icon</ThemedText>
      <View style={styles.iconGrid}>
        {DEFAULT_ICONS.map((icon) => (
          <Pressable
            key={icon}
            style={[
              styles.iconOption,
              { borderColor },
              formData.icon === icon && { backgroundColor: primaryColor }
            ]}
            onPress={() => handleIconSelect(icon)}
            testID={`${testID}-icon-${icon}`}
          >
            <Text style={[
              styles.iconText,
              { color: formData.icon === icon ? '#FFFFFF' : textColor }
            ]}>
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
        <ThemedText style={styles.label}>{label}</ThemedText>
        {description && (
          <ThemedText style={[styles.switchDescription, { color: secondaryTextColor }]}>
            {description}
          </ThemedText>
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
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Basic Information */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Basic Information</ThemedText>
            
            {renderInput('name', 'Account Name *', 'e.g., My Checking Account')}
            {renderPicker('type', 'Account Type *', ACCOUNT_TYPES)}
            {renderInput('startingBalance', 'Starting Balance *', '0.00', 'numeric')}
            {renderInput('currency', 'Currency', 'USD')}
          </View>

          {/* Optional Details */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Optional Details</ThemedText>
            
            {renderInput('description', 'Description', 'Account description', 'default', true)}
            {renderInput('institution', 'Bank/Institution', 'e.g., Chase Bank')}
            {renderInput('accountNumber', 'Last 4 Digits', 'e.g., 1234', 'numeric')}
          </View>

          {/* Appearance */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Appearance</ThemedText>
            {renderColorPicker()}
            {renderIconPicker()}
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Settings</ThemedText>
            
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
              <ThemedText style={[styles.advancedToggleText, { color: primaryColor }]}>
                {showAdvanced ? '▼ Hide Advanced' : '▶ Show Advanced'}
              </ThemedText>
            </Pressable>

            {showAdvanced && (
              <>
                {renderInput('sortOrder', 'Sort Order', '0', 'numeric')}
                {isEditing && renderPicker('status', 'Status', ACCOUNT_STATUSES)}
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actions, { borderTopColor: borderColor }]}>
        <Pressable
          style={[styles.actionButton, styles.cancelButton]}
          onPress={onCancel}
          disabled={loading}
          testID={`${testID}-cancel`}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
        
        <Pressable
          style={[
            styles.actionButton,
            styles.submitButton,
            { backgroundColor: primaryColor },
            loading && styles.disabledButton
          ]}
          onPress={handleSubmit}
          disabled={loading}
          testID={`${testID}-submit`}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Saving...' : isEditing ? 'Update Account' : 'Create Account'}
          </Text>
        </Pressable>
      </View>
    </ThemedView>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  
  submitButton: {
    backgroundColor: '#2196F3',
  },
  
  disabledButton: {
    opacity: 0.6,
  },
  
  cancelButtonText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '600',
  },
  
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AccountForm;