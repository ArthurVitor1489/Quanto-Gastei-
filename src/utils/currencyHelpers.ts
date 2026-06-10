/**
 * Quanto Gastei? - Currency Helpers
 * Asset symbol lookup, decimal handling, and conversion utilities.
 */

import { ASSET_MAP } from '../constants/assets';
import { MAX_DECIMAL_PLACES } from '../constants/appConfig';
import { ExchangeRates } from '../types/portfolio';

/**
 * Returns the display symbol for an asset code.
 * Falls back to the code itself if not found.
 */
export const getAssetSymbol = (code: string): string => {
  return ASSET_MAP.get(code)?.symbol ?? code;
};

/**
 * Returns the number of decimal places for a given asset code.
 */
export const getDecimalPlaces = (code: string): number => {
  const asset = ASSET_MAP.get(code);
  if (asset) return asset.decimals;
  return MAX_DECIMAL_PLACES.fiat;
};

/**
 * Converts an amount from one currency to another using exchange rates.
 *
 * @param amount - Source amount
 * @param fromCode - Source asset code
 * @param toCode - Target asset code
 * @param rates - Current exchange rates
 * @returns Converted amount or null if conversion is not possible
 */
export const convertAmount = (
  amount: number,
  fromCode: string,
  toCode: string,
  rates: ExchangeRates,
): number | null => {
  if (fromCode === toCode) return amount;

  // Build a rate key like 'BRL_USD'
  const rateKey = `${fromCode}_${toCode}` as keyof ExchangeRates;
  const directRate = rates[rateKey];

  if (typeof directRate === 'number') {
    return amount * directRate;
  }

  // Try via USD as intermediary
  const toUsdKey = `${fromCode}_USD` as keyof ExchangeRates;
  const fromUsdKey = `USD_${toCode}` as keyof ExchangeRates;
  const toUsdRate = rates[toUsdKey];
  const fromUsdRate = rates[fromUsdKey];

  if (typeof toUsdRate === 'number' && typeof fromUsdRate === 'number') {
    return amount * toUsdRate * fromUsdRate;
  }

  return null;
};

/**
 * Formats a raw amount according to the asset's decimal rules.
 *
 * @param amount - Numeric amount
 * @param code - Asset code for decimal lookup
 * @returns Formatted string (e.g. "0.00042000" for crypto)
 */
export const formatAssetAmount = (amount: number, code: string): string => {
  const decimals = getDecimalPlaces(code);
  const isCrypto = ASSET_MAP.get(code)?.asset_type === 'crypto';

  return amount.toLocaleString('en-US', {
    minimumFractionDigits: isCrypto ? 2 : decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Parses a user-entered string into a valid amount number.
 * Handles both comma and dot as decimal separators.
 */
export const parseAmountInput = (input: string): number | null => {
  // Replace comma with dot for Brazilian users
  const normalized = input.replace(',', '.').replace(/[^\d.]/g, '');

  // Ensure only one decimal point
  const parts = normalized.split('.');
  if (parts.length > 2) return null;

  const parsed = parseFloat(normalized);
  if (isNaN(parsed) || parsed < 0) return null;

  return parsed;
};
