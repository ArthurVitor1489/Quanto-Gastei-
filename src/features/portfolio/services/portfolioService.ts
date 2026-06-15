import { getDB } from '@/lib/sqlite';
import { Asset } from '@/types/asset';
import { PortfolioSummary, PortfolioItem, ExchangeRates, DisplayCurrency } from '@/types/portfolio';
import { convertToBRL, convertToUSD, convertToEUR, convertToDisplayCurrency } from './assetPriceService';
import { getCurrentMonth, getMonthRange, addMonths, formatMonthYear, parseLocalDate } from '@/utils/dateHelpers';


/**
 * Fetches user asset balances using SQLite.
 */
export const getUserPortfolio = async (
  userId: string
): Promise<{ asset: Asset; balance: number }[]> => {
  const db = getDB();
  try {
    const query = `
      SELECT
        a.id AS asset_id,
        a.code,
        a.name,
        a.symbol,
        a.asset_type,
        a.decimals,
        a.is_active,
        a.created_at,
        SUM(
          CASE
            WHEN t.type IN ('income', 'investment_sell') THEN t.amount
            WHEN t.type IN ('expense', 'investment_buy', 'transfer') THEN -t.amount
            ELSE 0
          END
        ) AS balance
      FROM transactions t
      INNER JOIN assets a ON a.id = t.asset_id
      WHERE t.user_id = ?
      GROUP BY a.id, a.code, a.name, a.symbol, a.asset_type, a.decimals, a.is_active, a.created_at
      HAVING SUM(
        CASE
          WHEN t.type IN ('income', 'investment_sell') THEN t.amount
          WHEN t.type IN ('expense', 'investment_buy', 'transfer') THEN -t.amount
          ELSE 0
        END
      ) <> 0
      ORDER BY a.asset_type, a.code
    `;

    const rows = await db.getAllAsync<any>(query, [userId]);

    return rows.map((row: any) => ({
      asset: {
        id: row.asset_id,
        code: row.code,
        name: row.name,
        symbol: row.symbol,
        asset_type: row.asset_type,
        decimals: Number(row.decimals),
        is_active: Boolean(row.is_active),
        created_at: row.created_at,
      },
      balance: Number(row.balance),
    }));
  } catch (error) {
    console.error('Error fetching user portfolio SQLite:', error);
    throw error;
  }
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
  // 1. Fetch all transactions chronologically from SQLite
  const db = getDB();
  let transactions: any[] = [];
  try {
    const query = `
      SELECT 
        t.*,
        a.code as asset_code,
        a.name as asset_name,
        a.symbol as asset_symbol,
        a.asset_type as asset_asset_type,
        a.decimals as asset_decimals
      FROM transactions t
      INNER JOIN assets a ON t.asset_id = a.id
      WHERE t.user_id = ?
      ORDER BY t.date ASC
    `;
    const rows = await db.getAllAsync<any>(query, [userId]);
    transactions = rows.map((row: any) => ({
      id: row.id,
      type: row.type,
      amount: Number(row.amount),
      date: row.date,
      asset: {
        id: row.asset_id,
        code: row.asset_code,
        name: row.asset_name,
        symbol: row.asset_symbol,
        asset_type: row.asset_asset_type,
        decimals: Number(row.asset_decimals),
      }
    }));
  } catch (error) {
    console.error('Error fetching transactions for portfolio history SQLite:', error);
    throw error;
  }

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

