import React from 'react';
import { TextInput, TextInputProps } from '@/components/ui/TextInput';

export interface FormFieldProps extends TextInputProps {
  name: string;
  value: string;
  onChangeText: (text: string) => void;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => string | null;
  };
  showValidationOnChange?: boolean;
}

export function FormField({
  name,
  value,
  onChangeText,
  validation,
  showValidationOnChange = false,
  error: externalError,
  ...props
}: FormFieldProps) {
  const [touched, setTouched] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const validateField = React.useCallback((fieldValue: string) => {
    if (!validation) return null;

    // Required validation
    if (validation.required && !fieldValue.trim()) {
      return `${props.label || name} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!fieldValue.trim()) return null;

    // Min length validation
    if (validation.minLength && fieldValue.length < validation.minLength) {
      return `${props.label || name} must be at least ${validation.minLength} characters`;
    }

    // Max length validation
    if (validation.maxLength && fieldValue.length > validation.maxLength) {
      return `${props.label || name} cannot exceed ${validation.maxLength} characters`;
    }

    // Pattern validation
    if (validation.pattern && !validation.pattern.test(fieldValue)) {
      return `${props.label || name} format is invalid`;
    }

    // Custom validation
    if (validation.custom) {
      const customError = validation.custom(fieldValue);
      if (customError) return customError;
    }

    return null;
  }, [validation, props.label, name]);

  const handleChangeText = (text: string) => {
    onChangeText(text);
    
    if (showValidationOnChange || touched) {
      const error = validateField(text);
      setValidationError(error);
    }
  };

  const handleBlur = (e: any) => {
    setTouched(true);
    const error = validateField(value);
    setValidationError(error);
    props.onBlur?.(e);
  };

  const displayError = externalError || (touched ? validationError : null);

  return (
    <TextInput
      {...props}
      value={value}
      onChangeText={handleChangeText}
      onBlur={handleBlur}
      error={displayError || undefined}
      accessibilityLabel={props.label || name}
      accessibilityHint={props.hint}
    />
  );
}