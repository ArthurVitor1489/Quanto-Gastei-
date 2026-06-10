/**
 * Quanto Gastei? - Date Helpers
 * Utility functions for date manipulation and formatting.
 */

interface MonthRange {
  start: Date;
  end: Date;
}

/**
 * Returns the current month as 'YYYY-MM'.
 */
export const getCurrentMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Parses a 'YYYY-MM-DD' string into a local Date object.
 */
export const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Returns the start and end dates of a given month string ('YYYY-MM').
 */
export const getMonthRange = (monthStr: string): MonthRange => {
  const [yearStr, monthNumStr] = monthStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthNumStr, 10) - 1;

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

  return { start, end };
};

/**
 * Checks if a given date is today.
 */
export const isToday = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? parseLocalDate(date) : date;
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
};

/**
 * Returns a Portuguese greeting based on the current hour.
 * - 5-11: Bom dia
 * - 12-17: Boa tarde
 * - 18-4: Boa noite
 */
export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
};

/**
 * Formats a month string ('YYYY-MM') or Date to a localized month/year.
 * E.g., '2026-06' → 'Junho 2026'
 */
export const formatMonthYear = (input: string | Date): string => {
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  let month: number;
  let year: number;

  if (typeof input === 'string') {
    const [yearStr, monthStr] = input.split('-');
    year = parseInt(yearStr, 10);
    month = parseInt(monthStr, 10) - 1;
  } else {
    year = input.getFullYear();
    month = input.getMonth();
  }

  return `${months[month]} ${year}`;
};

/**
 * Formats a Date object as 'YYYY-MM-DD' in the local timezone.
 */
export const toLocalISOString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Returns today as 'YYYY-MM-DD'.
 */
export const getTodayISO = (): string => {
  return toLocalISOString(new Date());
};

/**
 * Adds N months to a given month string and returns 'YYYY-MM'.
 */
export const addMonths = (monthStr: string, count: number): string => {
  const [yearStr, monthNumStr] = monthStr.split('-');
  const date = new Date(
    parseInt(yearStr, 10),
    parseInt(monthNumStr, 10) - 1 + count,
    1,
  );
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
};
