import { supabase } from '@/lib/supabase';
import { Transaction } from '@/types/transaction';
import { DisplayCurrency } from '@/types/portfolio';
import { ReportSummary, CategoryReportItem, MonthlyReportItem, ReportPeriod } from '@/types/report';
import { convertAmount } from '@/utils/currencyHelpers';
import { getCurrentMonth, getMonthRange, formatMonthYear, addMonths, parseLocalDate } from '@/utils/dateHelpers';
import { MOCK_EXCHANGE_RATES } from '@/features/dashboard/services/dashboardService';
import { getExchangeRates } from '@/features/portfolio/services/assetPriceService';

export type PeriodType = 'month' | '3months' | '6months' | 'year';

export const getReportSummary = async (
  userId: string,
  periodType: PeriodType = 'month',
  preferredCurrency: DisplayCurrency = 'BRL'
): Promise<ReportSummary> => {
  // 1. Determine period date range
  const currentMonthStr = getCurrentMonth();
  const now = new Date();
  
  let startDate: Date;
  let endDate: Date = getMonthRange(currentMonthStr).end;
  let label = '';

  switch (periodType) {
    case 'month':
      const currentMonth = getMonthRange(currentMonthStr);
      startDate = currentMonth.start;
      label = formatMonthYear(currentMonthStr);
      break;
    case '3months':
      startDate = getMonthRange(addMonths(currentMonthStr, -2)).start;
      label = 'Últimos 3 Meses';
      break;
    case '6months':
      startDate = getMonthRange(addMonths(currentMonthStr, -5)).start;
      label = 'Últimos 6 Meses';
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      label = `Ano de ${now.getFullYear()}`;
      break;
    default:
      startDate = getMonthRange(currentMonthStr).start;
      label = formatMonthYear(currentMonthStr);
  }

  const period: ReportPeriod = {
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    label,
  };

  // 2. Fetch all user transactions
  const { data: rawTransactions, error } = await supabase
    .from('transactions')
    .select(`
      *,
      category:categories(*),
      asset:assets(*)
    `)
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;

  const transactions = (rawTransactions || []) as unknown as Transaction[];
  let rates = MOCK_EXCHANGE_RATES;
  try {
    rates = await getExchangeRates();
  } catch (err) {
    console.warn('Error fetching live rates for reports:', err);
  }

  // Filter transactions within the selected period
  const filteredTransactions = transactions.filter((tx) => {
    const txDate = parseLocalDate(tx.date);
    return txDate >= startDate && txDate <= endDate;
  });

  // 3. Compute totals
  let totalIncome = 0;
  let totalExpense = 0;

  filteredTransactions.forEach((tx) => {
    const assetCode = tx.asset?.code || 'BRL';
    const amountInPreferred = convertAmount(tx.amount, assetCode, preferredCurrency, rates) ?? tx.amount;

    if (tx.type === 'income') {
      totalIncome += amountInPreferred;
    } else if (tx.type === 'expense') {
      totalExpense += amountInPreferred;
    }
  });

  const netBalance = totalIncome - totalExpense;

  // 4. Compute category report items (Expenses only)
  const categoryMap = new Map<
    string,
    { id: string; name: string; icon: string; color: string; total: number; count: number }
  >();

  filteredTransactions
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
        count: 0,
      };

      existing.total += amountInPreferred;
      existing.count += 1;
      categoryMap.set(catId, existing);
    });

  const categories: CategoryReportItem[] = Array.from(categoryMap.values())
    .map((item) => ({
      category_id: item.id,
      category_name: item.name,
      category_icon: item.icon,
      category_color: item.color,
      total: item.total,
      percentage: totalExpense > 0 ? (item.total / totalExpense) * 100 : 0,
      transaction_count: item.count,
      average_per_transaction: item.count > 0 ? item.total / item.count : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // 5. Compute monthly breakdown
  const monthKeys: string[] = [];
  let tempMonth = getCurrentMonth();
  
  // Calculate how many months back we need to display
  let monthsBack = 1;
  if (periodType === '3months') monthsBack = 3;
  if (periodType === '6months') monthsBack = 6;
  if (periodType === 'year') monthsBack = now.getMonth() + 1; // months from Jan to now

  for (let i = -(monthsBack - 1); i <= 0; i++) {
    monthKeys.push(addMonths(tempMonth, i));
  }

  const monthlyBreakdown: MonthlyReportItem[] = monthKeys.map((mKey) => {
    const { start, end } = getMonthRange(mKey);
    let mIncome = 0;
    let mExpense = 0;
    let mCount = 0;

    transactions.forEach((tx) => {
      const txDate = parseLocalDate(tx.date);
      if (txDate >= start && txDate <= end) {
        mCount += 1;
        const assetCode = tx.asset?.code || 'BRL';
        const amountInPreferred = convertAmount(tx.amount, assetCode, preferredCurrency, rates) ?? tx.amount;

        if (tx.type === 'income') {
          mIncome += amountInPreferred;
        } else if (tx.type === 'expense') {
          mExpense += amountInPreferred;
        }
      }
    });

    const [yearStr, monthNumStr] = mKey.split('-');

    return {
      month: formatMonthYear(mKey),
      year: parseInt(yearStr, 10),
      total_income: mIncome,
      total_expense: mExpense,
      balance: mIncome - mExpense,
      transaction_count: mCount,
    };
  });

  return {
    period,
    total_income: totalIncome,
    total_expense: totalExpense,
    net_balance: netBalance,
    categories,
    monthly_breakdown: monthlyBreakdown,
  };
};
