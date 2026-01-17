// Select Component - Styled dropdown select
import { SelectHTMLAttributes } from 'react';
import './Select.css';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: SelectOption[];
  placeholder?: string;
  variant?: 'default' | 'compact' | 'inline';
}

export function Select({
  options,
  placeholder,
  variant = 'default',
  className = '',
  ...props
}: SelectProps) {
  return (
    <select className={`select select-${variant} ${className}`} {...props}>
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
