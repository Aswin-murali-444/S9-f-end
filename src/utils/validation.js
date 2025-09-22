// Centralized validation utilities for all forms
export const validationUtils = {
  // Phone number validation - prevents invalid numbers like "99999999999"
  validatePhone: (value) => {
    if (!value) return { isValid: false, error: 'Phone number is required' };
    
    const cleanValue = value.trim();
    
    // Check for invalid patterns
    if (/^(\d)\1{9,}$/.test(cleanValue.replace(/[^\d]/g, ''))) {
      return { isValid: false, error: 'Phone number cannot be all the same digits' };
    }
    
    // Check for sequential patterns (1234567890, 9876543210, etc.)
    const digits = cleanValue.replace(/[^\d]/g, '');
    if (digits.length >= 10) {
      const isSequential = digits === '0123456789' || digits === '9876543210';
      const isRepeating = /^(\d)\1+$/.test(digits);
      if (isSequential || isRepeating) {
        return { isValid: false, error: 'Phone number cannot be sequential or repeating digits' };
      }
    }
    
    // Allow digits, space, hyphen, parentheses, and optional leading plus
    if (/[^0-9+\-\s()]/.test(cleanValue)) {
      return { isValid: false, error: 'Only numbers, spaces, (), - and + allowed' };
    }
    
    const plusCount = (cleanValue.match(/\+/g) || []).length;
    if (plusCount > 1 || (plusCount === 1 && !cleanValue.startsWith('+'))) {
      return { isValid: false, error: 'Plus sign is only allowed at the start' };
    }
    
    const digitCount = (cleanValue.match(/\d/g) || []).length;
    if (digitCount < 10) {
      return { isValid: false, error: 'Enter at least 10 digits' };
    }
    if (digitCount > 15) {
      return { isValid: false, error: 'Enter at most 15 digits' };
    }
    
    // If starts with +, enforce basic E.164 shape
    if (cleanValue.startsWith('+')) {
      const e164 = cleanValue.replace(/[^\d+]/g, '');
      if (!/^\+[1-9]\d{9,14}$/.test(e164)) {
        return { isValid: false, error: 'Enter a valid international number, e.g. +14155552671' };
      }
    }
    
    return { isValid: true, error: null };
  },

  // Email validation
  validateEmail: (value) => {
    if (!value) return { isValid: false, error: 'Email is required' };
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
    
    return { isValid: true, error: null };
  },

  // Name validation
  validateName: (value, fieldName = 'Name') => {
    if (!value) return { isValid: false, error: `${fieldName} is required` };
    
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      return { isValid: false, error: `${fieldName} must be at least 2 characters` };
    }
    
    if (trimmed.length > 50) {
      return { isValid: false, error: `${fieldName} must be less than 50 characters` };
    }
    
    if (!/^[A-Za-z\s\-']+$/.test(trimmed)) {
      return { isValid: false, error: `${fieldName} can contain letters, spaces, - and ' characters only` };
    }
    
    return { isValid: true, error: null };
  },

  // Password validation
  validatePassword: (value) => {
    if (!value) return { isValid: false, error: 'Password is required' };
    
    if (value.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters' };
    }
    
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[@$!%*?&]/.test(value);
    
    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      return { 
        isValid: false, 
        error: 'Password must contain uppercase, lowercase, number, and special character' 
      };
    }
    
    return { isValid: true, error: null };
  },

  // Numeric validation for amounts, prices, etc.
  validateNumeric: (value, options = {}) => {
    const { 
      min = 0, 
      max = Number.MAX_SAFE_INTEGER, 
      allowDecimals = true, 
      fieldName = 'Value',
      required = true 
    } = options;
    
    if (!value && !required) return { isValid: true, error: null };
    if (!value && required) return { isValid: false, error: `${fieldName} is required` };
    
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      return { isValid: false, error: `${fieldName} must be a valid number` };
    }
    
    if (!allowDecimals && !Number.isInteger(numValue)) {
      return { isValid: false, error: `${fieldName} must be a whole number` };
    }
    
    if (numValue < min) {
      return { isValid: false, error: `${fieldName} must be at least ${min}` };
    }
    
    if (numValue > max) {
      return { isValid: false, error: `${fieldName} must be no more than ${max}` };
    }
    
    return { isValid: true, error: null };
  },

  // Date validation
  validateDate: (value, options = {}) => {
    const { 
      minDate = null, 
      maxDate = null, 
      fieldName = 'Date',
      required = true 
    } = options;
    
    if (!value && !required) return { isValid: true, error: null };
    if (!value && required) return { isValid: false, error: `${fieldName} is required` };
    
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return { isValid: false, error: `Enter a valid ${fieldName.toLowerCase()}` };
    }
    
    if (minDate && date < new Date(minDate)) {
      return { isValid: false, error: `${fieldName} cannot be before ${new Date(minDate).toLocaleDateString()}` };
    }
    
    if (maxDate && date > new Date(maxDate)) {
      return { isValid: false, error: `${fieldName} cannot be after ${new Date(maxDate).toLocaleDateString()}` };
    }
    
    return { isValid: true, error: null };
  },

  // Text length validation
  validateTextLength: (value, options = {}) => {
    const { 
      min = 0, 
      max = 1000, 
      fieldName = 'Text',
      required = true 
    } = options;
    
    if (!value && !required) return { isValid: true, error: null };
    if (!value && required) return { isValid: false, error: `${fieldName} is required` };
    
    const length = value.trim().length;
    
    if (length < min) {
      return { isValid: false, error: `${fieldName} must be at least ${min} characters` };
    }
    
    if (length > max) {
      return { isValid: false, error: `${fieldName} must be less than ${max} characters` };
    }
    
    return { isValid: true, error: null };
  },

  // URL validation
  validateUrl: (value, fieldName = 'URL') => {
    if (!value) return { isValid: true, error: null };
    
    try {
      new URL(value);
      return { isValid: true, error: null };
    } catch {
      return { isValid: false, error: `Enter a valid ${fieldName.toLowerCase()}` };
    }
  },

  // File validation
  validateFile: (file, options = {}) => {
    const { 
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
      fieldName = 'File'
    } = options;
    
    if (!file) return { isValid: true, error: null };
    
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: `${fieldName} must be a valid image file (JPEG, PNG, GIF)` };
    }
    
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return { isValid: false, error: `${fieldName} must be smaller than ${maxSizeMB}MB` };
    }
    
    return { isValid: true, error: null };
  }
};

// Common validation patterns
export const validationPatterns = {
  phone: /^\+?[0-9\-\s()]{7,15}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  name: /^[A-Za-z\s\-']+$/,
  alphanumeric: /^[A-Za-z0-9\s\-]+$/,
  postalCode: /^[A-Za-z0-9\s\-]{3,10}$/,
  country: /^[A-Za-z\s\-]{2,}$/
};

// Validation error messages
export const validationMessages = {
  required: (field) => `${field} is required`,
  minLength: (field, min) => `${field} must be at least ${min} characters`,
  maxLength: (field, max) => `${field} must be less than ${max} characters`,
  invalidFormat: (field) => `Invalid ${field.toLowerCase()} format`,
  invalidPhone: 'Enter a valid phone number',
  invalidEmail: 'Please enter a valid email address',
  invalidNumber: 'Must be a valid number',
  invalidDate: 'Please enter a valid date',
  invalidFile: 'Please select a valid file',
  phoneTooShort: 'Phone number must be at least 10 digits',
  phoneTooLong: 'Phone number must be no more than 15 digits',
  phoneInvalidPattern: 'Phone number cannot be all the same digits or sequential',
  passwordWeak: 'Password must contain uppercase, lowercase, number, and special character',
  passwordsNotMatch: 'Passwords do not match'
};



