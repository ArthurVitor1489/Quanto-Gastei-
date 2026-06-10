/**
 * Quanto Gastei? - Formatters
 * Currency, date, and percentage formatting utilities.
 */

import { ASSET_MAP } from '../constants/assets';
import { MAX_DECIMAL_PLACES } from '../constants/appConfig';
import { parseLocalDate } from './dateHelpers';

/**
 * Formats a numeric amount as currency with the correct symbol and locale.
 *
 * @param amount - The numeric value to format
 * @param assetCode - The asset code (e.g. 'BRL', 'BTC')
 * @param decimals - Override decimal places (optional)
 * @returns Formatted currency string (e.g. "R$ 1.234,56")
 */
export const formatCurrency = (
  amount: number,
  assetCode: string = 'BRL',
  decimals?: number,
): string => {
  const asset = ASSET_MAP.get(assetCode);
  const symbol = asset?.symbol ?? assetCode;
  const isCrypto = asset?.asset_type === 'crypto';
  const decimalPlaces =
    decimals ?? (isCrypto ? MAX_DECIMAL_PLACES.crypto : MAX_DECIMAL_PLACES.fiat);

  // Use pt-BR locale for BRL, en-US for others
  const locale = assetCode === 'BRL' ? 'pt-BR' : 'en-US';

  const formatted = Math.abs(amount).toLocaleString(locale, {
    minimumFractionDigits: isCrypto ? 2 : decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });

  const sign = amount < 0 ? '-' : '';
  return `${sign}${symbol} ${formatted}`;
};

/**
 * Formats a Date object to a display string (dd/MM/yyyy).
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseLocalDate(date) : date;
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Formats a date as a relative string (Hoje, Ontem, or dd/MM/yyyy).
 */
export const formatRelativeDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseLocalDate(date) : date;
  const now = new Date();

  // Reset times to compare actual calendar days
  const nowZero = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dZero = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((nowZero.getTime() - dZero.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Hoje';
  }

  if (diffDays === 1) {
    return 'Ontem';
  }

  if (diffDays > 1 && diffDays < 7) {
    const weekdays = [
      'Domingo',
      'Segunda',
      'Terça',
      'Quarta',
      'Quinta',
      'Sexta',
      'Sábado',
    ];
    return weekdays[d.getDay()];
  }

  return formatDate(d);
};

/**
 * Formats a number as a percentage string.
 */
export const formatPercentage = (
  value: number,
  decimals: number = 1,
): string => {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
};

/**
 * Abbreviates large numbers (e.g. 1.2K, 3.4M).
 */
export const formatCompact = (value: number): string => {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toFixed(1)}K`;
  }
  return `${sign}${abs.toFixed(0)}`;
};
