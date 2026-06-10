/**
 * Quanto Gastei? - Category Types
 * Category hierarchy and related interfaces.
 */

export interface Category {
  id: string;
  user_id: string;
  parent_id: string | null;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
  sort_order: number;
  created_at: string;
  children?: Category[];
}

export interface CategoryWithTotal extends Category {
  total: number;
  percentage: number;
  transaction_count: number;
}

export interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
  parent_id: string | null;
}
