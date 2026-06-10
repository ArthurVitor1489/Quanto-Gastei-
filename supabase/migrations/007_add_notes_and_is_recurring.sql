-- ============================================================================
-- Migration 007: Add notes and is_recurring columns to transactions table
-- ============================================================================

ALTER TABLE public.transactions
  ADD COLUMN notes TEXT,
  ADD COLUMN is_recurring BOOLEAN NOT NULL DEFAULT FALSE;
