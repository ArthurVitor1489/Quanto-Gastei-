/**
 * Quanto Gastei? - Color Palette
 * Dark theme color tokens for the entire application.
 */

export const colors = {
  // Base
  background: '#0D1117',
  card: '#161B22',
  cardHover: '#1C2128',
  surface: '#21262D',
  border: '#30363D',
  overlay: 'rgba(0,0,0,0.6)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#8B949E',

  // Income (Green)
  income: '#2EA043',
  incomeLight: '#3FB950',

  // Expense (Red)
  expense: '#F85149',
  expenseLight: '#FF7B72',

  // Accent (Blue)
  accent: '#58A6FF',
  accentLight: '#79C0FF',

  // Warning (Yellow)
  warning: '#D29922',

  // Asset types
  crypto: '#F7931A',
  cryptoLight: '#FFB84D',
  fiat: '#58A6FF',
  investment: '#A371F7',

  // Semantic aliases
  success: '#2EA043',
  error: '#F85149',
  info: '#58A6FF',
} as const;

export type ColorToken = keyof typeof colors;
