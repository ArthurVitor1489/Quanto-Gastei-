/**
 * Quanto Gastei? - Transaction Types
 * Transaction, filter, and related type definitions.
 */

import { Asset } from './asset';
import { Category } from './category';

export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'pix' | 'credit' | 'debit' | 'cash';

export interface Transaction {
  id: string;
  user_id: string;
  asset_id: string;
  category_id: string | null;
  type: TransactionType;
  amount: number;
  description: string;
  payment_method: PaymentMethod | null;
  date: string;
  notes: string | null;
  is_recurring: boolean;
  credit_card_id?: string | null;
  installment_group_id?: string | null;
  installment_number?: number | null;
  total_installments?: number | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  asset?: Asset;
  category?: Category;
}

export interface TransactionFilter {
  type?: TransactionType;
  category_id?: string;
  asset_id?: string;
  payment_method?: PaymentMethod;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  search?: string;
}

export interface TransactionFormData {
  type: TransactionType;
  amount: string;
  description: string;
  asset_id: string;
  category_id: string | null;
  payment_method: PaymentMethod | null;
  date: string;
  notes: string;
  is_recurring: boolean;
}

export interface TransactionGroup {
  date: string;
  transactions: Transaction[];
  total_income: number;
  total_expense: number;
}
