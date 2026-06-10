/**
 * Quanto Gastei? - App Configuration
 * Global constants and configuration values.
 */

import { DisplayCurrency } from '../types/portfolio';

export const APP_NAME = 'Quanto Gastei?';

export const DEFAULT_CURRENCY = 'BRL';

export const SUPPORTED_DISPLAY_CURRENCIES: readonly DisplayCurrency[] = [
  'BRL',
  'USD',
  'EUR',
] as const;

export const MAX_DECIMAL_PLACES = {
  fiat: 2,
  crypto: 8,
} as const;

export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
} as const;

export const ANIMATION = {
  durationFast: 150,
  durationNormal: 300,
  durationSlow: 500,
} as const;

export const CACHE = {
  exchangeRateTtlMs: 5 * 60 * 1000, // 5 minutes
  portfolioTtlMs: 1 * 60 * 1000, // 1 minute
} as const;

export const LIMITS = {
  maxDescriptionLength: 200,
  maxNotesLength: 500,
  maxCategoryNameLength: 50,
  maxDisplayNameLength: 100,
  minPasswordLength: 6,
} as const;

export const DATE_FORMATS = {
  display: 'dd/MM/yyyy',
  api: 'yyyy-MM-dd',
  monthYear: 'MMMM yyyy',
  shortMonth: 'MMM yyyy',
} as const;
