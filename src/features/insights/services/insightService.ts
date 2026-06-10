import { supabase } from '@/lib/supabase';
import { Transaction } from '@/types/transaction';
import { DisplayCurrency } from '@/types/portfolio';
import { Insight, UserFinancialContext } from '@/types/insight';
import { evaluateFinancialContext } from '../engines/insightEngine';
import { convertAmount } from '@/utils/currencyHelpers';
import { getCurrentMonth, getMonthRange, addMonths, parseLocalDate } from '@/utils/dateHelpers';
import { MOCK_EXCHANGE_RATES } from '@/features/dashboard/services/dashboardService';

/**
 * Fetches data, compiles financial context, and returns active insights.
 */
export const getFinancialInsights = async (
  userId: string,
  preferredCurrency: DisplayCurrency = 'BRL'
): Promise<Insight[]> => {
  // 1. Fetch transactions with category and asset joins
  const { data: rawTransactions, error } = await supabase
    .from('transactions')
    .select(`
      *,
      category:categories(*),
      asset:assets(*)
    `)
    .eq('user_id', userId);

  if (error) throw error;

  const transactions = (rawTransactions || []) as unknown as Transaction[];
  const rates = MOCK_EXCHANGE_RATES;

  // 2. Identify periods
  const currentMonthStr = getCurrentMonth();
  const { start: currentMonthStart, end: currentMonthEnd } = getMonthRange(currentMonthStr);
  const today = new Date();
  const dayOfMonth = today.getDate();

  // 3. Current month aggregates
  let totalIncome = 0;
  let totalExpense = 0;
  let recurringExpenses = 0;

  const currentMonthTransactions = transactions.filter((tx) => {
    const txDate = parseLocalDate(tx.date);
    return txDate >= currentMonthStart && txDate <= currentMonthEnd;
  });

  currentMonthTransactions.forEach((tx) => {
    const assetCode = tx.asset?.code || 'BRL';
    const amountInPreferred = convertAmount(tx.amount, assetCode, preferredCurrency, rates) ?? tx.amount;

    if (tx.type === 'income') {
      totalIncome += amountInPreferred;
    } else if (tx.type === 'expense') {
      totalExpense += amountInPreferred;
      if (tx.is_recurring) {
        recurringExpenses += amountInPreferred;
      }
    }
  });

  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;
  const averageDailyExpense = totalExpense / Math.max(1, dayOfMonth);

  // 4. Top spending categories (current month)
  const categoryMap = new Map<string, { name: string; total: number }>();
  currentMonthTransactions
    .filter((tx) => tx.type === 'expense')
    .forEach((tx) => {
      const catName = tx.category?.name || 'Outros';
      const assetCode = tx.asset?.code || 'BRL';
      const amountInPreferred = convertAmount(tx.amount, assetCode, preferredCurrency, rates) ?? tx.amount;

      const existing = categoryMap.get(catName) || { name: catName, total: 0 };
      existing.total += amountInPreferred;
      categoryMap.set(catName, existing);
    });

  const topCategories = Array.from(categoryMap.values())
    .map((item) => ({
      name: item.name,
      total: item.total,
      percentage: totalExpense > 0 ? (item.total / totalExpense) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // 5. Monthly trend (income & expenses for the last 3 months)
  const trendMonths = [
    addMonths(currentMonthStr, -2),
    addMonths(currentMonthStr, -1),
    currentMonthStr,
  ];

  const monthlyTrend = trendMonths.map((mKey) => {
    const { start, end } = getMonthRange(mKey);
    let monthIncome = 0;
    let monthExpense = 0;

    transactions.forEach((tx) => {
      const txDate = parseLocalDate(tx.date);
      if (txDate >= start && txDate <= end) {
        const assetCode = tx.asset?.code || 'BRL';
        const amountInPreferred = convertAmount(tx.amount, assetCode, preferredCurrency, rates) ?? tx.amount;

        if (tx.type === 'income') {
          monthIncome += amountInPreferred;
        } else if (tx.type === 'expense') {
          monthExpense += amountInPreferred;
        }
      }
    });

    return {
      month: mKey,
      income: monthIncome,
      expense: monthExpense,
    };
  });

  // 6. Portfolio balances and concentration (crypto vs cash/fiat)
  const assetBalances = new Map<string, { balance: number; asset_type: 'fiat' | 'crypto' }>();

  transactions.forEach((tx) => {
    const assetCode = tx.asset?.code;
    const assetType = tx.asset?.asset_type || 'fiat';
    if (!assetCode) return;

    const currentData = assetBalances.get(assetCode) || { balance: 0, asset_type: assetType };

    // Standard cashflow impact
    if (tx.type === 'income') {
      currentData.balance += tx.amount;
    } else if (tx.type === 'expense') {
      currentData.balance -= tx.amount;
    }

    assetBalances.set(assetCode, currentData);
  });

  let portfolioValue = 0;
  let cryptoValue = 0;
  let cashValue = 0;

  assetBalances.forEach((item, assetCode) => {
    const valueInPreferred = convertAmount(item.balance, assetCode, preferredCurrency, rates) ?? item.balance;
    if (valueInPreferred > 0) {
      portfolioValue += valueInPreferred;
      if (item.asset_type === 'crypto') {
        cryptoValue += valueInPreferred;
      } else {
        cashValue += valueInPreferred;
      }
    }
  });

  const cryptoPercentage = portfolioValue > 0 ? (cryptoValue / portfolioValue) * 100 : 0;
  const cashPercentage = portfolioValue > 0 ? (cashValue / portfolioValue) * 100 : 0;

  // 7. Assemble context
  const context: UserFinancialContext & { crypto_percentage: number; cash_percentage: number } = {
    total_income: totalIncome,
    total_expense: totalExpense,
    net_balance: netBalance,
    top_categories: topCategories,
    monthly_trend: monthlyTrend,
    portfolio_value: portfolioValue,
    savings_rate: savingsRate,
    recurring_expenses: recurringExpenses,
    average_daily_expense: averageDailyExpense,
    crypto_percentage: cryptoPercentage,
    cash_percentage: cashPercentage,
  };

  // 8. Run rules engine
  return evaluateFinancialContext(context);
};
