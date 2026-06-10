-- ============================================================================
-- Migration 005: Create database functions and triggers
-- handle_new_user: auto-creates profile + seeds default categories
-- get_user_portfolio: calculates asset balances from transactions
-- ============================================================================

-- ============================================================================
-- Function: handle_new_user()
-- Triggered after a new user signs up via auth.users
-- Creates their profile and seeds default categories with subcategories
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_investimentos_id UUID;
BEGIN
  -- 1. Create user profile from auth metadata
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name'
  );

  -- 2. Seed default top-level categories
  INSERT INTO public.categories (user_id, name, icon, color, is_default, sort_order) VALUES
    (NEW.id, 'Alimentação',   'restaurant',          '#FF6B6B', TRUE, 1),
    (NEW.id, 'Transporte',    'car',                 '#4ECDC4', TRUE, 2),
    (NEW.id, 'Casa',          'home',                '#45B7D1', TRUE, 3),
    (NEW.id, 'Saúde',         'medical',             '#96CEB4', TRUE, 4),
    (NEW.id, 'Lazer',         'game-controller',     '#FFEAA7', TRUE, 5),
    (NEW.id, 'Bike',          'bicycle',             '#74B9FF', TRUE, 6),
    (NEW.id, 'Educação',      'school',              '#A29BFE', TRUE, 7),
    (NEW.id, 'Outros',        'ellipsis-horizontal', '#636E72', TRUE, 8),
    (NEW.id, 'Investimentos', 'trending-up',         '#A371F7', TRUE, 9);

  -- 3. Get the Investimentos category ID for subcategories
  SELECT id INTO v_investimentos_id
  FROM public.categories
  WHERE user_id = NEW.id
    AND name = 'Investimentos'
    AND parent_id IS NULL;

  -- 4. Seed investment subcategories under Investimentos
  INSERT INTO public.categories (user_id, parent_id, name, icon, color, is_default, sort_order) VALUES
    (NEW.id, v_investimentos_id, 'Bitcoin',              'logo-bitcoin',     '#F7931A', TRUE, 1),
    (NEW.id, v_investimentos_id, 'Ethereum',             'diamond',          '#627EEA', TRUE, 2),
    (NEW.id, v_investimentos_id, 'Solana',               'flash',            '#9945FF', TRUE, 3),
    (NEW.id, v_investimentos_id, 'ETFs',                 'bar-chart',        '#58A6FF', TRUE, 4),
    (NEW.id, v_investimentos_id, 'Ações',                'stats-chart',      '#3FB950', TRUE, 5),
    (NEW.id, v_investimentos_id, 'Renda Fixa',           'shield-checkmark', '#2EA043', TRUE, 6),
    (NEW.id, v_investimentos_id, 'Fundos Imobiliários',  'business',         '#D29922', TRUE, 7);

  RETURN NEW;
END;
$$;

-- Trigger on auth.users to auto-create profile and seed categories
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- Function: get_user_portfolio(p_user_id UUID)
-- Calculates asset balances from transactions
-- income/investment_sell = positive, expense/investment_buy/transfer = negative
-- Returns only assets with non-zero balance
-- ============================================================================
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
