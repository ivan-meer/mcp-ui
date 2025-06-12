// packages/@auto-ui/components/src/components/AutoForm/AutoForm.tsx
import React, { useState, ChangeEvent, FormEvent, ReactNode } from 'react';

export type FieldType = 'text' | 'email' | 'password' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox' | 'radio';

export interface FormFieldOption {
  value: string | number;
  label: string;
}

export interface FormFieldSchema {
  name: string; // Corresponds to key in formData
  label: string;
  type: FieldType;
  placeholder?: string;
  defaultValue?: any;
  options?: FormFieldOption[]; // For select, radio
  validation?: { // Basic validation
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  };
  // Future: helpText, disabled, readOnly, etc.
}

export interface AutoFormProps {
  fields: FormFieldSchema[];
  initialData?: Record<string, any>;
  onSubmit: (formData: Record<string, any>) => void;
  onCancel?: () => void;
  submitButtonText?: string;
  cancelButtonText?: string;
  className?: string; // For the form element itself
  fieldWrapperClassName?: string; // For each field's wrapper div
  labelClassName?: string;
  inputClassName?: string; // Common class for text-like inputs
  buttonContainerClassName?: string;
  submitButtonClassName?: string;
  cancelButtonClassName?: string;
  formTitle?: ReactNode;
}

// Continuing in packages/@auto-ui/components/src/components/AutoForm/AutoForm.tsx

export const AutoForm: React.FC<AutoFormProps> = ({
  fields,
  initialData = {},
  onSubmit,
  onCancel,
  submitButtonText = 'Submit',
  cancelButtonText = 'Cancel',
  className = 'space-y-6 bg-white p-6 shadow-md rounded-lg',
  fieldWrapperClassName = 'mb-4',
  labelClassName = 'block text-sm font-medium text-gray-700 mb-1',
  inputClassName = 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm',
  buttonContainerClassName = 'flex items-center justify-end space-x-3 pt-4 border-t mt-6',
  submitButtonClassName = 'inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
  cancelButtonClassName = 'py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
  formTitle
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const defaults = fields.reduce((acc, field) => {
      acc[field.name] = field.defaultValue ?? '';
      if (field.type === 'checkbox' && field.defaultValue === undefined) {
        acc[field.name] = false; // Default checkboxes to false if no defaultValue
      }
      return acc;
    }, {} as Record<string, any>);
    return { ...defaults, ...initialData };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';

    setFormData(prev => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateField = (field: FormFieldSchema, value: any): string | null => {
    if (field.validation?.required) {
        if (field.type === 'checkbox' && value === false) {
             // Consider false for a required checkbox as not fulfilling requirement if needed,
             // but typically required on checkbox means it must be checked.
             // For this example, let's assume required means it must be true.
            // return `${field.label} must be checked.`; // Uncomment if this is desired behavior
        } else if (value === '' || value === undefined || (field.type !== 'checkbox' && value === false)) {
            return `${field.label} is required.`;
        }
    }
    if (field.validation?.minLength && typeof value === 'string' && value.length < field.validation.minLength) {
      return `${field.label} must be at least ${field.validation.minLength} characters.`;
    }
    if (field.validation?.maxLength && typeof value === 'string' && value.length > field.validation.maxLength) {
      return `${field.label} must be at most ${field.validation.maxLength} characters.`;
    }
    if (field.validation?.pattern && typeof value === 'string' && !field.validation.pattern.test(value)) {
        return `${field.label} is invalid.`;
    }
    return null;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    fields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    onSubmit(formData);
  };

  const renderField = (field: FormFieldSchema) => {
    const commonInputProps = {
      name: field.name,
      id: field.name,
      onChange: handleChange,
      placeholder: field.placeholder,
      className: inputClassName,
      'aria-invalid': errors[field.name] ? true : undefined,
      'aria-describedby': errors[field.name] ? `${field.name}-error` : undefined,
    };

    switch (field.type) {
      case 'textarea':
        return <textarea {...commonInputProps} value={formData[field.name] ?? ''} rows={3}></textarea>;
      case 'select':
        return (
          <select {...commonInputProps} value={formData[field.name] ?? ''}>
            {field.placeholder && <option value="">{field.placeholder}</option>}
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              name={field.name}
              id={field.name}
              checked={Boolean(formData[field.name])}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              aria-invalid={errors[field.name] ? true : undefined}
              aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
            />
            {/* Optional: Label next to checkbox if not using the main label */}
            {/* <label htmlFor={field.name} className="ml-2 block text-sm text-gray-900">{field.label}</label> */}
          </div>
        );
      // Add 'radio' case if needed
      default: // text, email, password, number, date
        return <input type={field.type} {...commonInputProps} value={formData[field.name] ?? ''} />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      {formTitle && (typeof formTitle === 'string' ? <h2 className="text-xl font-semibold mb-6 text-gray-800">{formTitle}</h2> : formTitle)}
      {fields.map(field => (
        <div key={field.name} className={fieldWrapperClassName}>
          <label htmlFor={field.name} className={labelClassName}>
            {field.label}
            {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {renderField(field)}
          {errors[field.name] && <p id={`${field.name}-error`} className="mt-1 text-xs text-red-600">{errors[field.name]}</p>}
        </div>
      ))}
      <div className={buttonContainerClassName}>
        {onCancel && (
          <button type="button" onClick={onCancel} className={cancelButtonClassName}>
            {cancelButtonText}
          </button>
        )}
        <button type="submit" className={submitButtonClassName}>
          {submitButtonText}
        </button>
      </div>
    </form>
  );
};
