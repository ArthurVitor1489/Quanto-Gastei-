import { supabase } from '@/lib/supabase';
import { Transaction, TransactionFilter } from '@/types/transaction';
import { Category } from '@/types/category';
import { Asset } from '@/types/asset';

// Helper to map UI/Zod keys to DB keys
const mapTransactionInput = (transaction: any) => {
  return {
    amount: Number(transaction.amount),
    description: transaction.description || '',
    type: transaction.transaction_type || transaction.type,
    asset_id: transaction.asset_id,
    category_id: transaction.category_id || null,
    payment_method: transaction.payment_method || null,
    date: transaction.transaction_date || transaction.date,
    notes: transaction.notes || null,
    is_recurring: transaction.is_recurring ?? false,
  };
};

/**
 * Creates a new transaction in the database.
 */
export const createTransaction = async (transaction: any): Promise<Transaction> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const insertData = {
    ...mapTransactionInput(transaction),
    user_id: user.id,
  };

  const { data, error } = await (supabase
    .from('transactions') as any)
    .insert(insertData)
    .select('*, category:categories(*), asset:assets(*)')
    .single();

  if (error) throw error;
  return data as unknown as Transaction;
};

/**
 * Updates an existing transaction in the database.
 */
export const updateTransaction = async (id: string, transaction: any): Promise<Transaction> => {
  const updateData = mapTransactionInput(transaction);

  const { data, error } = await (supabase
    .from('transactions') as any)
    .update(updateData)
    .eq('id', id)
    .select('*, category:categories(*), asset:assets(*)')
    .single();

  if (error) throw error;
  return data as unknown as Transaction;
};

/**
 * Deletes a transaction from the database.
 */
export const deleteTransaction = async (id: string): Promise<void> => {
  const { error } = await (supabase
    .from('transactions') as any)
    .delete()
    .eq('id', id);

  if (error) throw error;
};

/**
 * Fetches all transactions filtered by the specified criteria.
 * Joins category and asset details.
 */
export const getTransactions = async (filters?: TransactionFilter & { startDate?: string; endDate?: string; assetId?: string; categoryId?: string }): Promise<Transaction[]> => {
  let query = (supabase
    .from('transactions') as any)
    .select('*, category:categories(*), asset:assets(*)')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (filters) {
    const startDate = filters.startDate || filters.date_from;
    const endDate = filters.endDate || filters.date_to;
    const assetId = filters.assetId || filters.asset_id;
    const categoryId = filters.categoryId || filters.category_id;

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (assetId) {
      query = query.eq('asset_id', assetId);
    }
    if (categoryId) {
      if (categoryId === 'null' || categoryId === null) {
        query = query.is('category_id', null);
      } else {
        query = query.eq('category_id', categoryId);
      }
    }
    if (filters.payment_method) {
      query = query.eq('payment_method', filters.payment_method);
    }
    if (filters.search) {
      query = query.ilike('description', `%${filters.search}%`);
    }
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as unknown as Transaction[];
};

/**
 * Fetches a single transaction by its ID.
 */
export const getTransaction = async (id: string): Promise<Transaction> => {
  const { data, error } = await (supabase
    .from('transactions') as any)
    .select('*, category:categories(*), asset:assets(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as unknown as Transaction;
};

/**
 * Fetches all active assets from the database.
 */
export const getAssets = async (): Promise<Asset[]> => {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('is_active', true)
    .order('code', { ascending: true });

  if (error) throw error;
  return data as unknown as Asset[];
};

/**
 * Fetches all default categories and user-specific categories.
 */
export const getCategories = async (): Promise<Category[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  let query = supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (user) {
    query = query.or(`is_default.eq.true,user_id.eq.${user.id}`);
  } else {
    query = query.eq('is_default', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as unknown as Category[];
};
