/**
 * Quanto Gastei? - Portfolio Types
 * Portfolio, exchange rates, and display currency definitions.
 */

import { Asset } from './asset';

export type DisplayCurrency = 'BRL' | 'USD' | 'EUR';

export interface PortfolioItem {
  asset: Asset;
  balance: number;
  value_brl: number;
  value_usd: number;
  percentage: number;
}

export interface PortfolioSummary {
  items: PortfolioItem[];
  total_brl: number;
  total_usd: number;
  total_eur: number;
  cash_total: number;
  investment_total: number;
}

export interface ExchangeRates {
  BRL_USD: number;
  BRL_EUR: number;
  USD_BRL: number;
  EUR_BRL: number;
  BTC_USD: number;
  ETH_USD: number;
  SOL_USD: number;
  updated_at: string;
}

export interface PortfolioPerformance {
  current_value: number;
  previous_value: number;
  change_amount: number;
  change_percentage: number;
  period: string;
}
