'use client';

import { useState, useEffect } from 'react';
import { useListingDraftStore } from '@/hooks/useListingDraftStore';
import { getByPath } from '@/utils/objectPath';

interface EditableProps {
  dataPath: string;
  value?: string | number;
  placeholder?: string;
  inputType?: 'text' | 'number' | 'percent' | 'currency' | 'multiline';
  constraints?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
  className?: string;
  as?: 'span' | 'p' | 'div';
  spacing?: 'none' | 'small' | 'medium' | 'large';
}

export function Editable({
  dataPath,
  value,
  placeholder,
  inputType = 'text',
  constraints,
  className = '',
  as = 'span',
  spacing = 'none',
}: EditableProps) {
  const { isEditing, draftData, updateField } = useListingDraftStore();
  const [inputValue, setInputValue] = useState<string>('');

  // Resolve current field value - prioritize draft data over the value prop
  const draftValue = draftData ? getByPath(draftData, dataPath) : undefined;
  const currentValue = draftValue !== undefined ? draftValue : value;
  
  // Initialize input value when component mounts or value changes
  useEffect(() => {
    setInputValue(formatForInput(currentValue, inputType));
  }, [currentValue, inputType]);

  // Format value for display (non-editing mode)
  const formatForDisplay = (val: any, type: string): string => {
    if (val === null || val === undefined) return '';
    
    switch (type) {
      case 'percent':
        return typeof val === 'string' ? val : `${val}%`;
      case 'currency':
        return typeof val === 'string' ? val : `$${val}`;
      case 'number':
        return typeof val === 'number' ? val.toString() : val;
      default:
        return String(val);
    }
  };

  // Format value for input (editing mode)
  const formatForInput = (val: any, type: string): string => {
    if (val === null || val === undefined) return '';
    
    switch (type) {
      case 'percent':
        return typeof val === 'string' ? val.replace('%', '') : String(val);
      case 'currency':
        return typeof val === 'string' ? val.replace(/[$,]/g, '') : String(val);
      default:
        return String(val);
    }
  };

  // Parse input value back to storage format
  const parseInputValue = (inputVal: string, type: string): any => {
    if (!inputVal.trim()) return '';
    
    switch (type) {
      case 'percent':
        const percentVal = inputVal.replace('%', '');
        const percentNum = parseFloat(percentVal);
        return isNaN(percentNum) ? inputVal : `${percentNum}%`;
      case 'currency':
        const currencyVal = inputVal.replace(/[$,]/g, '');
        const currencyNum = parseFloat(currencyVal);
        return isNaN(currencyNum) ? inputVal : `$${currencyNum.toLocaleString()}`;
      case 'number':
        const num = parseFloat(inputVal);
        return isNaN(num) ? inputVal : num;
      default:
        return inputVal;
    }
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Validate constraints
    if (constraints) {
      if (constraints.min !== undefined && parseFloat(newValue) < constraints.min) return;
      if (constraints.max !== undefined && parseFloat(newValue) > constraints.max) return;
      if (constraints.pattern && !new RegExp(constraints.pattern).test(newValue)) return;
    }
    
    // Update the store
    const parsedValue = parseInputValue(newValue, inputType);
    updateField(dataPath, parsedValue);
  };

  // Handle select change
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    updateField(dataPath, newValue);
  };

  // Get spacing classes based on spacing prop
  const getSpacingClasses = () => {
    switch (spacing) {
      case 'small':
        return 'mb-2';
      case 'medium':
        return 'mb-4';
      case 'large':
        return 'mb-6';
      default:
        return '';
    }
  };

  // If not editing, render as appropriate element
  if (!isEditing) {
    const spacingClasses = getSpacingClasses();
    const combinedClassName = `${className} ${spacingClasses}`.trim();
    
    if (as === 'p') {
      return (
        <p className={combinedClassName}>
          {formatForDisplay(currentValue, inputType) || placeholder}
        </p>
      );
    } else if (as === 'div') {
      return (
        <div className={combinedClassName}>
          {formatForDisplay(currentValue, inputType) || placeholder}
        </div>
      );
    } else {
      return (
        <span className={combinedClassName}>
          {formatForDisplay(currentValue, inputType) || placeholder}
        </span>
      );
    }
  }

  // Render appropriate input based on type
  if (inputType === 'multiline') {
    return (
      <textarea
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        rows={3}
      />
    );
  }

  if (constraints?.options) {
    return (
      <select
        value={inputValue}
        onChange={handleSelectChange}
        className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      >
        <option value="">{placeholder || 'Select...'}</option>
        {constraints.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type={inputType === 'number' ? 'number' : 'text'}
      value={inputValue}
      onChange={handleChange}
      placeholder={placeholder}
      min={constraints?.min}
      max={constraints?.max}
      pattern={constraints?.pattern}
      className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  );
} 