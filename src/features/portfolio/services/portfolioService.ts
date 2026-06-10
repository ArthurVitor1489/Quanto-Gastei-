import { supabase } from '@/lib/supabase';
import { Asset } from '@/types/asset';
import { PortfolioSummary, PortfolioItem, ExchangeRates, DisplayCurrency } from '@/types/portfolio';
import { convertToBRL, convertToUSD, convertToEUR, convertToDisplayCurrency } from './assetPriceService';
import { getCurrentMonth, getMonthRange, addMonths, formatMonthYear, parseLocalDate } from '@/utils/dateHelpers';


/**
 * Fetches user asset balances using get_user_portfolio RPC.
 */
export const getUserPortfolio = async (
  userId: string
): Promise<{ asset: Asset; balance: number }[]> => {
  const { data, error } = await (supabase as any).rpc('get_user_portfolio', {
    p_user_id: userId,
  });

  if (error) {
    console.error('Error fetching user portfolio:', error);
    throw error;
  }

  if (!data) return [];

  // Map the DB RPC response to { asset, balance } structure
  return data.map((row: any) => ({
    asset: {
      id: row.asset_id,
      code: row.code,
      name: row.name,
      symbol: row.symbol,
      asset_type: row.asset_type,
      decimals: row.decimals,
      is_active: true,
      created_at: new Date().toISOString(), // Mock fallback as it is not returned by the RPC
    },
    balance: Number(row.balance),
  }));
};

/**
 * Maps each asset balance into BRL/USD/EUR values, computes totals,
 * percentages, cash vs investment breakdown, and sorts assets by value.
 */
export const calculatePortfolioSummary = (
  balances: { asset: Asset; balance: number }[],
  rates: ExchangeRates,
  displayCurrency: DisplayCurrency
): PortfolioSummary => {
  let total_brl = 0;
  let total_usd = 0;
  let total_eur = 0;
  let cash_total = 0;
  let investment_total = 0;

  // 1. Calculate values for each item
  const items: PortfolioItem[] = balances.map(({ asset, balance }) => {
    const value_brl = convertToBRL(balance, asset.code, rates);
    const value_usd = convertToUSD(balance, asset.code, rates);
    const value_eur = convertToEUR(balance, asset.code, rates);

    total_brl += value_brl;
    total_usd += value_usd;
    total_eur += value_eur;

    const valueInDisplay = convertToDisplayCurrency(balance, asset.code, displayCurrency, rates);
    if (asset.asset_type === 'fiat') {
      cash_total += valueInDisplay;
    } else {
      investment_total += valueInDisplay;
    }

    return {
      asset,
      balance,
      value_brl,
      value_usd,
      percentage: 0, // Will calculate in the next pass
    };
  });

  // 2. Calculate percentages
  items.forEach((item) => {
    if (total_brl > 0) {
      item.percentage = (item.value_brl / total_brl) * 100;
    } else {
      item.percentage = 0;
    }
  });

  // 3. Sort items by value descending
  items.sort((a, b) => b.value_brl - a.value_brl);

  return {
    items,
    total_brl,
    total_usd,
    total_eur,
    cash_total,
    investment_total,
  };
};

export interface PortfolioHistoryItem {
  month: string;
  monthKey: string;
  value: number;
}

/**
  * Calculates historical net worth balances for each of the last 6 months.
  */
export const getPortfolioHistory = async (
  userId: string,
  displayCurrency: DisplayCurrency,
  rates: ExchangeRates
): Promise<PortfolioHistoryItem[]> => {
  // 1. Fetch all transactions chronologically
  const { data: rawTransactions, error } = await supabase
    .from('transactions')
    .select('*, asset:assets(*)')
    .eq('user_id', userId)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching transactions for portfolio history:', error);
    throw error;
  }

  const transactions = rawTransactions || [];

  // 2. Generate the last 6 months ending ranges
  const history: PortfolioHistoryItem[] = [];
  const currentMonthStr = getCurrentMonth(); // YYYY-MM

  for (let i = -5; i <= 0; i++) {
    const mKey = addMonths(currentMonthStr, i);
    const { end: monthEnd } = getMonthRange(mKey);

    // Calculate asset balances up to this month's end date
    const assetBalances = new Map<string, { balance: number; code: string }>();

    transactions.forEach((tx: any) => {
      const txDate = parseLocalDate(tx.date);
      if (txDate <= monthEnd) {
        const assetCode = tx.asset?.code;
        if (!assetCode) return;

        const current = assetBalances.get(assetCode) || { balance: 0, code: assetCode };
        
        if (tx.type === 'income') {
          current.balance += Number(tx.amount);
        } else if (tx.type === 'expense') {
          current.balance -= Number(tx.amount);
        }
        
        assetBalances.set(assetCode, current);
      }
    });

    // Convert balances to displayCurrency and sum them up
    let totalValue = 0;
    assetBalances.forEach((item) => {
      const valueInDisplay = convertToDisplayCurrency(item.balance, item.code, displayCurrency, rates);
      totalValue += valueInDisplay;
    });

    // Format short month name (e.g. "Junho 2026" -> "Jun")
    const fullMonthYear = formatMonthYear(mKey);
    const monthName = fullMonthYear.split(' ')[0];
    const shortMonth = monthName.slice(0, 3);

    history.push({
      month: shortMonth,
      monthKey: mKey,
      value: totalValue,
    });
  }

  return history;
};

