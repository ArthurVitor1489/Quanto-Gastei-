import { getTransactions } from '@/features/transactions/services/transactionService';
import { Transaction } from '@/types/transaction';
import { DisplayCurrency, ExchangeRates } from '@/types/portfolio';
import { convertAmount } from '@/utils/currencyHelpers';
import { getCurrentMonth, getMonthRange, formatMonthYear, addMonths, parseLocalDate } from '@/utils/dateHelpers';
import { getExchangeRates } from '@/features/portfolio/services/assetPriceService';

export interface DashboardData {
  totalIncome: number;
  totalExpense: number;
  netCashflow: number;
  recentTransactions: Transaction[];
  categorySpending: Array<{
    category_id: string;
    category_name: string;
    category_icon: string;
    category_color: string;
    total: number;
    percentage: number;
  }>;
  monthlyBreakdown: Array<{
    month: string;
    monthKey: string; // YYYY-MM
    income: number;
    expense: number;
  }>;
}

// Global mock exchange rates for currency conversion (fallback)
export const MOCK_EXCHANGE_RATES: ExchangeRates = {
  BRL_USD: 0.18,
  BRL_EUR: 0.16,
  USD_BRL: 5.50,
  EUR_BRL: 6.10,
  BTC_USD: 67000,
  ETH_USD: 3500,
  SOL_USD: 150,
  updated_at: new Date().toISOString(),
};

/**
 * Fetches dashboard aggregates and details for the specified user and display currency.
 */
export const getDashboardData = async (
  userId: string,
  preferredCurrency: DisplayCurrency = 'BRL'
): Promise<DashboardData> => {
  // 1. Fetch transactions from local SQLite
  const transactions = await getTransactions();

  // 2. Fetch exchange rates (using real-time endpoints with local fallback)
  let rates = MOCK_EXCHANGE_RATES;
  try {
    rates = await getExchangeRates();
  } catch (err) {
    console.warn('Error fetching live rates for dashboard:', err);
  }

  const currentMonthStr = getCurrentMonth(); // YYYY-MM
  const { start: currentMonthStart, end: currentMonthEnd } = getMonthRange(currentMonthStr);

  let totalIncome = 0;
  let totalExpense = 0;

  // Filter current month transactions for the summary cards and category charts
  const currentMonthTransactions = transactions.filter((tx) => {
    const txDate = parseLocalDate(tx.date);
    return txDate >= currentMonthStart && txDate <= currentMonthEnd;
  });

  // Calculate total income and expense in the preferred currency
  currentMonthTransactions.forEach((tx) => {
    const assetCode = tx.asset?.code || 'BRL';
    const amountInPreferred = convertAmount(tx.amount, assetCode, preferredCurrency, rates) ?? tx.amount;

    if (tx.type === 'income') {
      totalIncome += amountInPreferred;
    } else if (tx.type === 'expense') {
      totalExpense += amountInPreferred;
    }
  });

  const netCashflow = totalIncome - totalExpense;

  // Recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  // 3. Category Spending Breakdown (Expenses only for the current month)
  const categoryMap = new Map<
    string,
    { id: string; name: string; icon: string; color: string; total: number }
  >();

  currentMonthTransactions
    .filter((tx) => tx.type === 'expense')
    .forEach((tx) => {
      const catId = tx.category_id || 'outros';
      const catName = tx.category?.name || 'Outros';
      const catIcon = tx.category?.icon || 'more-horiz';
      const catColor = tx.category?.color || '#8B949E';

      const assetCode = tx.asset?.code || 'BRL';
      const amountInPreferred = convertAmount(tx.amount, assetCode, preferredCurrency, rates) ?? tx.amount;

      const existing = categoryMap.get(catId) || {
        id: catId,
        name: catName,
        icon: catIcon,
        color: catColor,
        total: 0,
      };

      existing.total += amountInPreferred;
      categoryMap.set(catId, existing);
    });

  const categorySpending = Array.from(categoryMap.values())
    .map((item) => ({
      category_id: item.id,
      category_name: item.name,
      category_icon: item.icon,
      category_color: item.color,
      total: item.total,
      percentage: totalExpense > 0 ? (item.total / totalExpense) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // 4. Monthly Chart Breakdown (last 4 months including the current one)
  const last4Months: string[] = [];
  for (let i = -3; i <= 0; i++) {
    last4Months.push(addMonths(currentMonthStr, i));
  }

  const monthlyBreakdown = last4Months.map((mKey) => {
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
      month: formatMonthYear(mKey),
      monthKey: mKey,
      income: monthIncome,
      expense: monthExpense,
    };
  });

  return {
    totalIncome,
    totalExpense,
    netCashflow,
    recentTransactions,
    categorySpending,
    monthlyBreakdown,
  };
};
