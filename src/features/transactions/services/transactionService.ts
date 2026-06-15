import { getDB, generateUUID } from '@/lib/sqlite';
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

const mapRowToTransaction = (row: any): Transaction => {
  return {
    id: row.id,
    user_id: row.user_id,
    asset_id: row.asset_id,
    category_id: row.category_id,
    type: row.type,
    amount: Number(row.amount),
    description: row.description,
    payment_method: row.payment_method,
    date: row.date,
    notes: row.notes,
    is_recurring: Boolean(row.is_recurring),
    created_at: row.created_at,
    updated_at: row.updated_at,
    category: row.category_id ? {
      id: row.category_id,
      user_id: row.user_id,
      parent_id: row.category_parent_id || null,
      name: row.category_name,
      icon: row.category_icon,
      color: row.category_color,
      is_default: Boolean(row.category_is_default),
      sort_order: Number(row.category_sort_order),
      created_at: row.category_created_at,
    } : null,
    asset: {
      id: row.asset_id,
      code: row.asset_code,
      name: row.asset_name,
      symbol: row.asset_symbol,
      asset_type: row.asset_asset_type as any,
      decimals: Number(row.asset_decimals),
      is_active: Boolean(row.asset_is_active),
      created_at: row.asset_created_at,
    },
  } as unknown as Transaction;
};

/**
 * Creates a new transaction in the SQLite database.
 */
export const createTransaction = async (transaction: any): Promise<Transaction> => {
  const db = getDB();
  const userId = 'local-user';
  const id = generateUUID();
  const data = mapTransactionInput(transaction);

  try {
    await db.runAsync(
      `INSERT INTO transactions (id, user_id, asset_id, category_id, type, amount, description, payment_method, date, notes, is_recurring)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        data.asset_id,
        data.category_id,
        data.type,
        data.amount,
        data.description,
        data.payment_method,
        data.date,
        data.notes,
        data.is_recurring ? 1 : 0
      ]
    );

    const newTx = await getTransaction(id);
    if (!newTx) throw new Error('Falha ao recuperar a transação inserida');
    return newTx;
  } catch (error) {
    console.error('Error in createTransaction SQLite:', error);
    throw error;
  }
};

/**
 * Updates an existing transaction in the SQLite database.
 */
export const updateTransaction = async (id: string, transaction: any): Promise<Transaction> => {
  const db = getDB();
  const data = mapTransactionInput(transaction);

  try {
    await db.runAsync(
      `UPDATE transactions
       SET asset_id = ?, category_id = ?, type = ?, amount = ?, description = ?, payment_method = ?, date = ?, notes = ?, is_recurring = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [
        data.asset_id,
        data.category_id,
        data.type,
        data.amount,
        data.description,
        data.payment_method,
        data.date,
        data.notes,
        data.is_recurring ? 1 : 0,
        id
      ]
    );

    const updated = await getTransaction(id);
    if (!updated) throw new Error('Falha ao recuperar a transação atualizada');
    return updated;
  } catch (error) {
    console.error('Error in updateTransaction SQLite:', error);
    throw error;
  }
};

/**
 * Deletes a transaction from the SQLite database.
 */
export const deleteTransaction = async (id: string): Promise<void> => {
  const db = getDB();
  try {
    await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error in deleteTransaction SQLite:', error);
    throw error;
  }
};

/**
 * Fetches all transactions filtered by the specified criteria.
 * Joins category and asset details.
 */
export const getTransactions = async (filters?: TransactionFilter & { startDate?: string; endDate?: string; assetId?: string; categoryId?: string }): Promise<Transaction[]> => {
  const db = getDB();
  try {
    let query = `
      SELECT 
        t.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        c.is_default as category_is_default,
        c.sort_order as category_sort_order,
        c.created_at as category_created_at,
        c.parent_id as category_parent_id,
        a.code as asset_code,
        a.name as asset_name,
        a.symbol as asset_symbol,
        a.asset_type as asset_asset_type,
        a.decimals as asset_decimals,
        a.is_active as asset_is_active,
        a.created_at as asset_created_at
      FROM transactions t
      INNER JOIN assets a ON t.asset_id = a.id
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = 'local-user'
    `;

    const params: any[] = [];

    if (filters) {
      const startDate = filters.startDate || filters.date_from;
      const endDate = filters.endDate || filters.date_to;
      const assetId = filters.assetId || filters.asset_id;
      const categoryId = filters.categoryId || filters.category_id;

      if (startDate) {
        query += ' AND t.date >= ?';
        params.push(startDate);
      }
      if (endDate) {
        query += ' AND t.date <= ?';
        params.push(endDate);
      }
      if (filters.type) {
        query += ' AND t.type = ?';
        params.push(filters.type);
      }
      if (assetId) {
        query += ' AND t.asset_id = ?';
        params.push(assetId);
      }
      if (categoryId) {
        if (categoryId === 'null' || categoryId === null) {
          query += ' AND t.category_id IS NULL';
        } else {
          query += ' AND t.category_id = ?';
          params.push(categoryId);
        }
      }
      if (filters.payment_method) {
        query += ' AND t.payment_method = ?';
        params.push(filters.payment_method);
      }
      if (filters.search) {
        query += ' AND t.description LIKE ?';
        params.push(`%${filters.search}%`);
      }
    }

    query += ' ORDER BY t.date DESC, t.created_at DESC';

    const rows = await db.getAllAsync<any>(query, params);
    return rows.map(mapRowToTransaction);
  } catch (error) {
    console.error('Error in getTransactions SQLite:', error);
    throw error;
  }
};

/**
 * Fetches a single transaction by its ID.
 */
export const getTransaction = async (id: string): Promise<Transaction> => {
  const db = getDB();
  try {
    const row = await db.getFirstAsync<any>(
      `SELECT 
        t.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        c.is_default as category_is_default,
        c.sort_order as category_sort_order,
        c.created_at as category_created_at,
        c.parent_id as category_parent_id,
        a.code as asset_code,
        a.name as asset_name,
        a.symbol as asset_symbol,
        a.asset_type as asset_asset_type,
        a.decimals as asset_decimals,
        a.is_active as asset_is_active,
        a.created_at as asset_created_at
      FROM transactions t
      INNER JOIN assets a ON t.asset_id = a.id
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?`,
      [id]
    );

    if (!row) throw new Error('Transação não encontrada');
    return mapRowToTransaction(row);
  } catch (error) {
    console.error('Error in getTransaction SQLite:', error);
    throw error;
  }
};

/**
 * Fetches all active assets from the SQLite database.
 */
export const getAssets = async (): Promise<Asset[]> => {
  const db = getDB();
  try {
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM assets WHERE is_active = 1 ORDER BY code ASC'
    );
    return rows.map(row => ({
      id: row.id,
      code: row.code,
      name: row.name,
      symbol: row.symbol,
      asset_type: row.asset_type,
      decimals: Number(row.decimals),
      is_active: Boolean(row.is_active),
      created_at: row.created_at,
    }));
  } catch (error) {
    console.error('Error in getAssets SQLite:', error);
    throw error;
  }
};

/**
 * Fetches all default categories and user-specific categories from SQLite.
 */
export const getCategories = async (): Promise<Category[]> => {
  const db = getDB();
  try {
    const rows = await db.getAllAsync<any>(
      "SELECT * FROM categories WHERE is_default = 1 OR user_id = 'local-user' ORDER BY sort_order ASC"
    );
    return rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      parent_id: row.parent_id,
      name: row.name,
      icon: row.icon,
      color: row.color,
      is_default: Boolean(row.is_default),
      sort_order: Number(row.sort_order),
      created_at: row.created_at,
    }));
  } catch (error) {
    console.error('Error in getCategories SQLite:', error);
    throw error;
  }
};

