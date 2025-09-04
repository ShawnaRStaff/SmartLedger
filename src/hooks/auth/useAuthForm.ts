import { useState, useCallback, useMemo } from 'react';

export interface FormField {
  value: string;
  error: string | null;
  touched: boolean;
}

export interface AuthFormData {
  email: FormField;
  password: FormField;
  confirmPassword?: FormField;
  displayName?: FormField;
}

export interface ValidationRules {
  email: {
    required: boolean;
    pattern: RegExp;
  };
  password: {
    required: boolean;
    minLength: number;
  };
  confirmPassword?: {
    required: boolean;
    mustMatch: string;
  };
  displayName?: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
}

const defaultValidationRules: ValidationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    required: true,
    minLength: 6,
  },
};

export function useAuthForm(
  includeConfirmPassword = false,
  includeDisplayName = false
) {
  const [formData, setFormData] = useState<AuthFormData>(() => ({
    email: { value: '', error: null, touched: false },
    password: { value: '', error: null, touched: false },
    ...(includeConfirmPassword && {
      confirmPassword: { value: '', error: null, touched: false },
    }),
    ...(includeDisplayName && {
      displayName: { value: '', error: null, touched: false },
    }),
  }));

  const validationRules: ValidationRules = useMemo(
    () => ({
      ...defaultValidationRules,
      ...(includeConfirmPassword && {
        confirmPassword: {
          required: true,
          mustMatch: 'password',
        },
      }),
      ...(includeDisplayName && {
        displayName: {
          required: true,
          minLength: 2,
          maxLength: 50,
        },
      }),
    }),
    [includeConfirmPassword, includeDisplayName]
  );

  const validateField = useCallback(
    (fieldName: keyof AuthFormData, value: string): string | null => {
      const rules = validationRules[fieldName];
      if (!rules) return null;

      // Required validation
      if (rules.required && !value.trim()) {
        return `${getFieldLabel(fieldName)} is required`;
      }

      // Skip other validations if field is empty and not required
      if (!value.trim()) return null;

      // Email pattern validation
      if (fieldName === 'email' && 'pattern' in rules) {
        if (!rules.pattern.test(value)) {
          return 'Please enter a valid email address';
        }
      }

      // Password minimum length
      if (fieldName === 'password' && 'minLength' in rules) {
        if (value.length < rules.minLength) {
          return `Password must be at least ${rules.minLength} characters`;
        }
      }

      // Display name length validation
      if (
        fieldName === 'displayName' &&
        'minLength' in rules &&
        'maxLength' in rules
      ) {
        if (value.length < rules.minLength) {
          return `Name must be at least ${rules.minLength} characters`;
        }
        if (value.length > rules.maxLength) {
          return `Name cannot exceed ${rules.maxLength} characters`;
        }
      }

      // Confirm password match validation
      if (fieldName === 'confirmPassword' && 'mustMatch' in rules) {
        const passwordValue =
          formData[rules.mustMatch as keyof AuthFormData]?.value || '';
        if (value !== passwordValue) {
          return 'Passwords do not match';
        }
      }

      return null;
    },
    [formData, validationRules]
  );

  const updateField = useCallback(
    (fieldName: keyof AuthFormData, value: string) => {
      setFormData((prev) => {
        const currentField = prev[fieldName];
        if (!currentField) return prev;

        const error = validateField(fieldName, value);

        const newFormData = {
          ...prev,
          [fieldName]: {
            ...currentField,
            value,
            error: currentField.touched ? error : null,
          },
        };

        // If this is password field and we have confirmPassword, re-validate confirmPassword
        if (fieldName === 'password' && prev.confirmPassword) {
          const confirmPasswordError = validateField(
            'confirmPassword',
            prev.confirmPassword.value
          );
          newFormData.confirmPassword = {
            ...prev.confirmPassword,
            error: prev.confirmPassword.touched ? confirmPasswordError : null,
          };
        }

        return newFormData;
      });
    },
    [validateField]
  );

  const touchField = useCallback(
    (fieldName: keyof AuthFormData) => {
      setFormData((prev) => {
        const currentField = prev[fieldName];
        if (!currentField) return prev;

        const error = validateField(fieldName, currentField.value);

        return {
          ...prev,
          [fieldName]: {
            ...currentField,
            touched: true,
            error,
          },
        };
      });
    },
    [validateField]
  );

  const validateForm = useCallback((): boolean => {
    let isValid = true;
    const newFormData = { ...formData };

    // Validate all fields
    Object.keys(formData).forEach((fieldName) => {
      const field = formData[fieldName as keyof AuthFormData];
      if (field) {
        const error = validateField(
          fieldName as keyof AuthFormData,
          field.value
        );
        newFormData[fieldName as keyof AuthFormData] = {
          ...field,
          touched: true,
          error,
        };

        if (error) {
          isValid = false;
        }
      }
    });

    setFormData(newFormData);
    return isValid;
  }, [formData, validateField]);

  const resetForm = useCallback(() => {
    setFormData({
      email: { value: '', error: null, touched: false },
      password: { value: '', error: null, touched: false },
      ...(includeConfirmPassword && {
        confirmPassword: { value: '', error: null, touched: false },
      }),
      ...(includeDisplayName && {
        displayName: { value: '', error: null, touched: false },
      }),
    });
  }, [includeConfirmPassword, includeDisplayName]);

  const getFormValues = useCallback(
    () => ({
      email: formData.email.value,
      password: formData.password.value,
      ...(formData.confirmPassword && {
        confirmPassword: formData.confirmPassword.value,
      }),
      ...(formData.displayName && { displayName: formData.displayName.value }),
    }),
    [formData]
  );

  const isFormValid = useCallback((): boolean => {
    return Object.values(formData).every(
      (field) => field && !field.error && field.value.trim() !== ''
    );
  }, [formData]);

  return {
    formData,
    updateField,
    touchField,
    validateForm,
    resetForm,
    getFormValues,
    isFormValid,
  };
}

function getFieldLabel(fieldName: string): string {
  switch (fieldName) {
    case 'email':
      return 'Email';
    case 'password':
      return 'Password';
    case 'confirmPassword':
      return 'Confirm Password';
    case 'displayName':
      return 'Display Name';
    default:
      return fieldName;
  }
}
