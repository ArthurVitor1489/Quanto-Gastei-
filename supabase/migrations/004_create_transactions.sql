-- ============================================================================
-- Migration 004: Create transactions table
-- Core financial transactions with support for 5 transaction types
-- ============================================================================

-- Create transaction_type enum
CREATE TYPE public.transaction_type AS ENUM (
  'income',
  'expense',
  'transfer',
  'investment_buy',
  'investment_sell'
);

-- Create payment_method enum
CREATE TYPE public.payment_method AS ENUM (
  'pix',
  'credit',
  'debit',
  'cash'
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE RESTRICT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  type public.transaction_type NOT NULL,
  amount NUMERIC(18, 8) NOT NULL CHECK (amount > 0),
  description TEXT,
  payment_method public.payment_method,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add table comment
COMMENT ON TABLE public.transactions IS 'Core financial transactions supporting income, expense, transfer, and investment operations';

-- Indexes on foreign keys and frequently queried columns
CREATE INDEX idx_transactions_user_id ON public.transactions (user_id);
CREATE INDEX idx_transactions_asset_id ON public.transactions (asset_id);
CREATE INDEX idx_transactions_category_id ON public.transactions (category_id);
CREATE INDEX idx_transactions_date ON public.transactions (date);
CREATE INDEX idx_transactions_type ON public.transactions (type);
CREATE INDEX idx_transactions_user_date ON public.transactions (user_id, date DESC);
CREATE INDEX idx_transactions_user_type ON public.transactions (user_id, type);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Per-operation RLS policies using (SELECT auth.uid()) for performance
CREATE POLICY "Users can view own transactions"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.transactions
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.transactions
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Auto-update updated_at on transactions (reuses function from migration 001)
CREATE TRIGGER set_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
