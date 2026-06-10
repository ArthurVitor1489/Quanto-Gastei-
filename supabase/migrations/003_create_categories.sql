-- ============================================================================
-- Migration 003: Create categories table
-- Per-user hierarchical categories with parent_id self-reference
-- ============================================================================

-- Create categories table
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'ellipsis-horizontal',
  color TEXT NOT NULL DEFAULT '#636E72',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add table comment
COMMENT ON TABLE public.categories IS 'Per-user hierarchical categories with optional parent for subcategories';

-- Indexes on foreign keys and frequently queried columns
CREATE INDEX idx_categories_user_id ON public.categories (user_id);
CREATE INDEX idx_categories_parent_id ON public.categories (parent_id);
CREATE INDEX idx_categories_user_parent ON public.categories (user_id, parent_id);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Per-operation RLS policies using (SELECT auth.uid()) for performance
CREATE POLICY "Users can view own categories"
  ON public.categories
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own categories"
  ON public.categories
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own categories"
  ON public.categories
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own categories"
  ON public.categories
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);
