/**
 * Quanto Gastei? - Report Types
 * Reporting, aggregation, and comparison interfaces.
 */

export interface ReportPeriod {
  start_date: string;
  end_date: string;
  label: string;
}

export interface CategoryReportItem {
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  total: number;
  percentage: number;
  transaction_count: number;
  average_per_transaction: number;
}

export interface MonthlyReportItem {
  month: string;
  year: number;
  total_income: number;
  total_expense: number;
  balance: number;
  transaction_count: number;
}

export interface ComparisonItem {
  label: string;
  current_value: number;
  previous_value: number;
  change_amount: number;
  change_percentage: number;
}

export interface ReportSummary {
  period: ReportPeriod;
  total_income: number;
  total_expense: number;
  net_balance: number;
  categories: CategoryReportItem[];
  monthly_breakdown: MonthlyReportItem[];
}
