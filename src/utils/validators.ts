/**
 * Quanto Gastei? - Validators
 * Input validation utilities for forms and data.
 */

import { LIMITS } from '../constants/appConfig';

/**
 * Validates an email address format.
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates a password meets minimum requirements.
 * Must be at least LIMITS.minPasswordLength characters.
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= LIMITS.minPasswordLength;
};

/**
 * Checks if a value is a positive number (> 0).
 */
export const isPositiveNumber = (value: number): boolean => {
  return typeof value === 'number' && isFinite(value) && value > 0;
};

/**
 * Validates that an amount is valid for a transaction.
 * Must be a finite positive number.
 */
export const isValidAmount = (amount: number): boolean => {
  return isPositiveNumber(amount);
};

/**
 * Validates a description string.
 */
export const isValidDescription = (description: string): boolean => {
  const trimmed = description.trim();
  return trimmed.length > 0 && trimmed.length <= LIMITS.maxDescriptionLength;
};

/**
 * Validates a display name.
 */
export const isValidDisplayName = (name: string): boolean => {
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= LIMITS.maxDisplayNameLength;
};

/**
 * Validates a category name.
 */
export const isValidCategoryName = (name: string): boolean => {
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= LIMITS.maxCategoryNameLength;
};

/**
 * Validates a date string is in ISO format (YYYY-MM-DD).
 */
export const isValidDateISO = (dateStr: string): boolean => {
  const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoRegex.test(dateStr)) return false;

  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

/**
 * Returns validation error messages for a login form.
 */
export const validateLoginForm = (
  email: string,
  password: string,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!email.trim()) {
    errors.email = 'Email é obrigatório';
  } else if (!isValidEmail(email)) {
    errors.email = 'Email inválido';
  }

  if (!password) {
    errors.password = 'Senha é obrigatória';
  } else if (!isValidPassword(password)) {
    errors.password = `Senha deve ter no mínimo ${LIMITS.minPasswordLength} caracteres`;
  }

  return errors;
};
