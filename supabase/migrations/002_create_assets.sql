-- ============================================================================
-- Migration 002: Create assets table
-- Global table of supported fiat and crypto currencies
-- ============================================================================

-- Create asset_type enum
CREATE TYPE public.asset_type AS ENUM ('fiat', 'crypto');

-- Create assets table
CREATE TABLE public.assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  asset_type public.asset_type NOT NULL,
  decimals INTEGER NOT NULL DEFAULT 2,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add table comment
COMMENT ON TABLE public.assets IS 'Global table of supported fiat and crypto currencies';

-- Indexes for frequently queried columns
CREATE INDEX idx_assets_code ON public.assets (code);
CREATE INDEX idx_assets_asset_type ON public.assets (asset_type);
CREATE INDEX idx_assets_is_active ON public.assets (is_active);

-- Enable RLS
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Assets are readable by all authenticated users (global/shared table)
CREATE POLICY "Authenticated users can view active assets"
  ON public.assets
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Seed default assets
INSERT INTO public.assets (code, name, symbol, asset_type, decimals) VALUES
  ('BRL', 'Real Brasileiro', 'R$', 'fiat', 2),
  ('USD', 'US Dollar', '$', 'fiat', 2),
  ('EUR', 'Euro', '€', 'fiat', 2),
  ('BTC', 'Bitcoin', '₿', 'crypto', 8),
  ('ETH', 'Ethereum', 'Ξ', 'crypto', 8),
  ('SOL', 'Solana', '◎', 'crypto', 8);
