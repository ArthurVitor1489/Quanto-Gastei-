-- ============================================================================
-- Migration 006: Rename transaction_type to type and transaction_date to date
-- and update dependent function get_user_portfolio
-- ============================================================================

-- 1. Drop dependent function first
DROP FUNCTION IF EXISTS public.get_user_portfolio(UUID);

-- 2. Rename columns in transactions table
ALTER TABLE public.transactions RENAME COLUMN transaction_type TO type;
ALTER TABLE public.transactions RENAME COLUMN transaction_date TO date;

-- 3. Rename indexes for consistency
ALTER INDEX IF EXISTS idx_transactions_transaction_type RENAME TO idx_transactions_type;
ALTER INDEX IF EXISTS idx_transactions_transaction_date RENAME TO idx_transactions_date;

-- 4. Recreate get_user_portfolio using the new column names
CREATE OR REPLACE FUNCTION public.get_user_portfolio(p_user_id UUID)
RETURNS TABLE (
  asset_id UUID,
  code TEXT,
  name TEXT,
  symbol TEXT,
  asset_type public.asset_type,
  decimals INTEGER,
  balance NUMERIC(18, 8)
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id AS asset_id,
    a.code,
    a.name,
    a.symbol,
    a.asset_type,
    a.decimals,
    SUM(
      CASE
        WHEN t.type IN ('income', 'investment_sell') THEN t.amount
        WHEN t.type IN ('expense', 'investment_buy', 'transfer') THEN -t.amount
        ELSE 0
      END
    ) AS balance
  FROM public.transactions t
  INNER JOIN public.assets a ON a.id = t.asset_id
  WHERE t.user_id = p_user_id
  GROUP BY a.id, a.code, a.name, a.symbol, a.asset_type, a.decimals
  HAVING SUM(
    CASE
      WHEN t.type IN ('income', 'investment_sell') THEN t.amount
      WHEN t.type IN ('expense', 'investment_buy', 'transfer') THEN -t.amount
      ELSE 0
    END
  ) <> 0
  ORDER BY a.asset_type, a.code;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_portfolio(UUID) TO authenticated;
