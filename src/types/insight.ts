/**
 * Quanto Gastei? - Insight Types
 * AI-powered insights, rules, and financial context.
 */

export type InsightType = 'spending' | 'trend' | 'portfolio' | 'suggestion';

export type InsightSeverity = 'info' | 'warning' | 'positive' | 'negative';

export interface Insight {
  id: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  description: string;
  value: number | null;
  icon: string;
  color: string;
  created_at: string;
  dismissed: boolean;
}

export interface InsightRule {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  evaluate: (context: UserFinancialContext) => Insight | null;
}

export interface UserFinancialContext {
  total_income: number;
  total_expense: number;
  net_balance: number;
  top_categories: Array<{
    name: string;
    total: number;
    percentage: number;
  }>;
  monthly_trend: Array<{
    month: string;
    income: number;
    expense: number;
  }>;
  portfolio_value: number;
  savings_rate: number;
  recurring_expenses: number;
  average_daily_expense: number;
}
