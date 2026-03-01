/**
 * Validation utilities for Expense Tracker
 * Author: Prem Pagare | Arizona State University
 */

export const VALIDATION_RULES = {
  title: {
    required: true,
    minLength: 2,
    maxLength: 80,
  },
  amount: {
    required: true,
    min: 0.01,
    max: 1_000_000,
    isPositiveNumber: true,
  },
  category: {
    required: true,
  },
  description: {
    maxLength: 300,
  },
};

export function validateExpense(formData) {
  const errors = {};

  // Title validation
  if (!formData.title || formData.title.trim() === '') {
    errors.title = 'Title is required.';
  } else if (formData.title.trim().length < VALIDATION_RULES.title.minLength) {
    errors.title = `Title must be at least ${VALIDATION_RULES.title.minLength} characters.`;
  } else if (formData.title.trim().length > VALIDATION_RULES.title.maxLength) {
    errors.title = `Title cannot exceed ${VALIDATION_RULES.title.maxLength} characters.`;
  }

  // Amount validation — must be a valid positive number (integer or decimal)
  const rawAmount = formData.amount;
  if (rawAmount === '' || rawAmount === null || rawAmount === undefined) {
    errors.amount = 'Amount is required.';
  } else {
    const numericAmount = Number(rawAmount);
    if (isNaN(numericAmount)) {
      errors.amount = 'Amount must be a valid number.';
    } else if (numericAmount <= 0) {
      errors.amount = 'Amount must be greater than zero.';
    } else if (numericAmount > VALIDATION_RULES.amount.max) {
      errors.amount = `Amount cannot exceed $${VALIDATION_RULES.amount.max.toLocaleString()}.`;
    } else if (!/^\d+(\.\d{1,2})?$/.test(String(rawAmount).trim())) {
      errors.amount = 'Amount must be a positive number (up to 2 decimal places).';
    }
  }

  // Category validation
  if (!formData.category || formData.category === '') {
    errors.category = 'Please select a category.';
  }

  // Description (optional but capped)
  if (formData.description && formData.description.length > VALIDATION_RULES.description.maxLength) {
    errors.description = `Description cannot exceed ${VALIDATION_RULES.description.maxLength} characters.`;
  }

  // Date validation
  if (!formData.date) {
    errors.date = 'Date is required.';
  } else {
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (selectedDate > today) {
      errors.date = 'Date cannot be in the future.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
