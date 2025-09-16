import { useState, useCallback, useEffect, useRef } from 'react';
import { z } from 'zod';

export interface ValidationState {
  [key: string]: string | null;
}

export interface FormState {
  [key: string]: string;
}

interface UseFormValidationProps {
  schema: z.ZodSchema;
  debounceMs?: number;
}

export const useFormValidation = ({ schema, debounceMs = 300 }: UseFormValidationProps) => {
  const [errors, setErrors] = useState<ValidationState>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isValid, setIsValid] = useState(false);
  const [formData, setFormData] = useState<FormState>({});

  const debounceTimeoutsRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  /**
   * Validate a single field (debounced)
   */
  const validateField = useCallback(
    (fieldName: string, value: string) => {
      setFormData(prev => ({ ...prev, [fieldName]: value })); // keep formData updated

      if (debounceTimeoutsRef.current[fieldName]) {
        clearTimeout(debounceTimeoutsRef.current[fieldName]);
      }

      const timeoutId = setTimeout(() => {
        try {
          const fieldSchema = schema instanceof z.ZodObject ? schema.shape[fieldName] : null;
          if (!fieldSchema) {
            throw new Error(`Field "${fieldName}" does not exist in the schema.`);
          }
          fieldSchema.parse(value);
          setErrors(prev => ({ ...prev, [fieldName]: null }));
        } catch (error) {
          if (error instanceof z.ZodError) {
            const fieldErrors = error.issues.map(err => err.message);
            setErrors(prev => ({
              ...prev,
              [fieldName]: fieldErrors.join(', '),
            }));
          }
        }
        delete debounceTimeoutsRef.current[fieldName];
      }, debounceMs);

      debounceTimeoutsRef.current[fieldName] = timeoutId;
    },
    [schema, debounceMs]
  );

  /**
   * Validate entire form (e.g. on submit)
   */
  const validateForm = useCallback(
    (formData: FormState) => {
      setFormData(formData);
      try {
        schema.parse(formData);
        setErrors({});
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const newErrors: ValidationState = {};
          error.issues.forEach(issue => {
            if (issue.path.length > 0) {
              const fieldName = issue.path[0] as string;
              if (!newErrors[fieldName]) {
                newErrors[fieldName] = issue.message;
              } else {
                newErrors[fieldName] += `, ${issue.message}`;
              }
            }
          });
          setErrors(newErrors);
        } else {
          setErrors({ general: 'Validation failed' });
        }
        return false;
      }
    },
    [schema]
  );

  /**
   * Handle field blur
   */
  const handleBlur = useCallback(
    (fieldName: string, value: string) => {
      setTouched(prev => ({ ...prev, [fieldName]: true }));
      validateField(fieldName, value);
    },
    [validateField]
  );

  /**
   * Track validity: all required fields filled + no errors
   */
  useEffect(() => {
    const hasErrors = Object.values(errors).some(err => err !== null);

    const allFieldsFilled = schema instanceof z.ZodObject
      ? Object.keys(schema.shape).every(field => {
          const value = formData[field];
          return value !== undefined && value !== null && value.toString().trim() !== '';
        })
      : false;

    setIsValid(!hasErrors && allFieldsFilled);
  }, [errors, formData, schema]);

  /**
   * Clear error for a field
   */
  const clearError = useCallback((fieldName: string) => {
    setErrors(prev => ({ ...prev, [fieldName]: null }));
  }, []);

  /**
   * Reset everything
   */
  const reset = useCallback(() => {
    Object.values(debounceTimeoutsRef.current).forEach(timeout => clearTimeout(timeout));
    debounceTimeoutsRef.current = {};
    setErrors({});
    setTouched({});
    setFormData({});
    setIsValid(false);
  }, []);

  useEffect(() => {
    return () => {
      Object.values(debounceTimeoutsRef.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return {
    errors,
    touched,
    isValid,
    handleBlur,
    validateForm,
    clearError,
    reset,
  };
};
