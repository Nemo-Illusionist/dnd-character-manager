// FormField Component - Consistent form field styling
import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';
import './FormField.scss';

interface BaseFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
}

// Input Field
interface InputFieldProps extends BaseFieldProps, InputHTMLAttributes<HTMLInputElement> {
  type?: 'text' | 'number' | 'email' | 'password' | 'tel' | 'url';
}

export function InputField({
  label,
  error,
  hint,
  className = '',
  ...props
}: InputFieldProps) {
  return (
    <div className={`form-field ${error ? 'has-error' : ''} ${className}`}>
      {label && <label className="form-field-label">{label}</label>}
      <input className="form-field-input" {...props} />
      {hint && !error && <span className="form-field-hint">{hint}</span>}
      {error && <span className="form-field-error">{error}</span>}
    </div>
  );
}

// Textarea Field
interface TextareaFieldProps extends BaseFieldProps, TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function TextareaField({
  label,
  error,
  hint,
  className = '',
  ...props
}: TextareaFieldProps) {
  return (
    <div className={`form-field ${error ? 'has-error' : ''} ${className}`}>
      {label && <label className="form-field-label">{label}</label>}
      <textarea className="form-field-textarea" {...props} />
      {hint && !error && <span className="form-field-hint">{hint}</span>}
      {error && <span className="form-field-error">{error}</span>}
    </div>
  );
}

// Select Field
interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectFieldProps extends BaseFieldProps, Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: SelectOption[];
  placeholder?: string;
}

export function SelectField({
  label,
  error,
  hint,
  options,
  placeholder,
  className = '',
  ...props
}: SelectFieldProps) {
  return (
    <div className={`form-field ${error ? 'has-error' : ''} ${className}`}>
      {label && <label className="form-field-label">{label}</label>}
      <select className="form-field-select" {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && !error && <span className="form-field-hint">{hint}</span>}
      {error && <span className="form-field-error">{error}</span>}
    </div>
  );
}

// Checkbox Field
interface CheckboxFieldProps extends BaseFieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  children: ReactNode;
}

export function CheckboxField({
  label,
  error,
  children,
  className = '',
  ...props
}: CheckboxFieldProps) {
  return (
    <div className={`form-field form-field-checkbox ${error ? 'has-error' : ''} ${className}`}>
      <label className="form-field-checkbox-label">
        <input type="checkbox" className="form-field-checkbox-input" {...props} />
        <span className="form-field-checkbox-text">{children}</span>
      </label>
      {error && <span className="form-field-error">{error}</span>}
    </div>
  );
}

// Form Row - for inline fields
interface FormRowProps {
  children: ReactNode;
  className?: string;
}

export function FormRow({ children, className = '' }: FormRowProps) {
  return <div className={`form-row ${className}`}>{children}</div>;
}
