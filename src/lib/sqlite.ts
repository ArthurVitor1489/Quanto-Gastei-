import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// Helper to generate UUIDs locally without external dependencies
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Mock SQLite implementation for Web platform utilizing localStorage
class WebSQLiteDatabase {
  private getTable(table: string): any[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(`quantogastei_db_${table}`);
    return data ? JSON.parse(data) : [];
  }

  private setTable(table: string, data: any[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`quantogastei_db_${table}`, JSON.stringify(data));
  }

  async execAsync(sql: string): Promise<void> {
    const tables = ['profiles', 'assets', 'categories', 'credit_cards', 'transactions'];
    for (const table of tables) {
      if (typeof window !== 'undefined' && !localStorage.getItem(`quantogastei_db_${table}`)) {
        localStorage.setItem(`quantogastei_db_${table}`, JSON.stringify([]));
      }
    }
  }

  async runAsync(sql: string, params: any[] = []): Promise<{ lastInsertRowId: number; changes: number }> {
    const cleanSql = sql.trim().replace(/\s+/g, ' ');
    const upperSql = cleanSql.toUpperCase();
    
    if (upperSql.startsWith('INSERT INTO')) {
      const match = cleanSql.match(/INSERT INTO (\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
      if (match) {
        const tableName = match[1].toLowerCase();
        const columns = match[2].split(',').map(c => c.trim());
        const tableData = this.getTable(tableName);
        
        const newRow: any = {};
        columns.forEach((col, idx) => {
          newRow[col] = params[idx];
        });
        
        if (!newRow.created_at) newRow.created_at = new Date().toISOString();
        if (!newRow.updated_at) newRow.updated_at = new Date().toISOString();
        
        tableData.push(newRow);
        this.setTable(tableName, tableData);
        return { lastInsertRowId: tableData.length, changes: 1 };
      }
    }
    
    if (upperSql.startsWith('UPDATE')) {
      const match = cleanSql.match(/UPDATE (\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i);
      if (match) {
        const tableName = match[1].toLowerCase();
        const setPart = match[2];
        const wherePart = match[3];
        
        const setAssignments = setPart.split(',').map(s => s.trim());
        const setColumns = setAssignments.map(s => s.split('=')[0].trim());
        
        const tableData = this.getTable(tableName);
        let updatedCount = 0;
        
        const updatedTableData = tableData.map(row => {
          if (this.evaluateWhere(tableName, row, wherePart, params, setColumns.length)) {
            const newRow = { ...row };
            setColumns.forEach((col, idx) => {
              newRow[col] = params[idx];
            });
            newRow.updated_at = new Date().toISOString();
            updatedCount++;
            return newRow;
          }
          return row;
        });
        
        this.setTable(tableName, updatedTableData);
        return { lastInsertRowId: 0, changes: updatedCount };
      }
    }
    
    if (upperSql.startsWith('DELETE FROM')) {
      const match = cleanSql.match(/DELETE FROM (\w+)(?:\s+WHERE\s+(.+))?$/i);
      if (match) {
        const tableName = match[1].toLowerCase();
        const wherePart = match[2];
        
        const tableData = this.getTable(tableName);
        const initialLength = tableData.length;
        
        const updatedTableData = tableData.filter(row => {
          return !this.evaluateWhere(tableName, row, wherePart, params, 0);
        });
        
        this.setTable(tableName, updatedTableData);
        return { lastInsertRowId: 0, changes: initialLength - updatedTableData.length };
      }
    }
    
    return { lastInsertRowId: 0, changes: 0 };
  }

  async getFirstAsync<T>(sql: string, params: any[] = []): Promise<T | null> {
    const all = await this.getAllAsync<T>(sql, params);
    return all.length > 0 ? all[0] : null;
  }

  async getAllAsync<T>(sql: string, params: any[] = []): Promise<T[]> {
    const cleanSql = sql.trim().replace(/\s+/g, ' ');
    const upperSql = cleanSql.toUpperCase();
    
    let tableName = '';
    if (upperSql.includes('FROM TRANSACTIONS')) tableName = 'transactions';
    else if (upperSql.includes('FROM CATEGORIES')) tableName = 'categories';
    else if (upperSql.includes('FROM CREDIT_CARDS')) tableName = 'credit_cards';
    else if (upperSql.includes('FROM ASSETS')) tableName = 'assets';
    else if (upperSql.includes('FROM PROFILES')) tableName = 'profiles';
    else return [] as T[];
    
    let data = this.getTable(tableName);
    
    if (upperSql.startsWith('SELECT COUNT(*)')) {
      const whereMatch = cleanSql.match(/WHERE\s+([^ORDER|GROUP|LIMIT]+)/i);
      let count = data.length;
      if (whereMatch) {
        const wherePart = whereMatch[1].trim();
        count = data.filter(row => this.evaluateWhere(tableName, row, wherePart, params, 0)).length;
      }
      return [{ count }] as any as T[];
    }
    
    const whereMatch = cleanSql.match(/WHERE\s+([^ORDER|GROUP|LIMIT|LEFT|JOIN]+)/i);
    if (whereMatch) {
      const wherePart = whereMatch[1].trim();
      data = data.filter(row => this.evaluateWhere(tableName, row, wherePart, params, 0));
    }
    
    if (tableName === 'transactions') {
      const categories = this.getTable('categories');
      const assets = this.getTable('assets');
      
      data = data.map(tx => {
        const category = categories.find(c => c.id === tx.category_id) || null;
        const asset = assets.find(a => a.id === tx.asset_id) || null;
        
        return {
          ...tx,
          category_name: category ? category.name : null,
          category_icon: category ? category.icon : null,
          category_color: category ? category.color : null,
          category_is_default: category ? category.is_default : null,
          category_sort_order: category ? category.sort_order : null,
          category_created_at: category ? category.created_at : null,
          category_parent_id: category ? category.parent_id : null,
          asset_code: asset ? asset.code : null,
          asset_name: asset ? asset.name : null,
          asset_symbol: asset ? asset.symbol : null,
          asset_asset_type: asset ? asset.asset_type : null,
          asset_decimals: asset ? asset.decimals : null,
          asset_is_active: asset ? asset.is_active : null,
          asset_created_at: asset ? asset.created_at : null,
        };
      });
    }
    
    if (upperSql.includes('ORDER BY')) {
      const orderMatch = cleanSql.match(/ORDER BY\s+([^\s,]+)(?:\s+(ASC|DESC))?/i);
      if (orderMatch) {
        const field = orderMatch[1].trim();
        const dir = orderMatch[2] ? orderMatch[2].toUpperCase() : 'ASC';
        data.sort((a, b) => {
          const valA = a[field] ?? '';
          const valB = b[field] ?? '';
          if (valA < valB) return dir === 'DESC' ? 1 : -1;
          if (valA > valB) return dir === 'DESC' ? -1 : 1;
          return 0;
        });
      }
    }
    
    return data as T[];
  }

  private evaluateWhere(tableName: string, row: any, whereSql: string | undefined, params: any[], paramOffset: number): boolean {
    if (!whereSql) return true;
    
    let normalized = whereSql.trim().replace(/\s+/g, ' ');
    const conditions = normalized.split(/\s+AND\s+/i);
    let paramIndex = paramOffset;
    
    for (const cond of conditions) {
      const match = cond.match(/([\w.]+)\s*(=|!=|>|<|>=|<=|IS\s+NOT|IS|LIKE)\s*(.+)$/i);
      if (!match) continue;
      
      let field = match[1].trim();
      if (field.includes('.')) field = field.split('.')[1];
      
      const op = match[2].toUpperCase().replace(/\s+/g, ' ');
      let rawVal = match[3].trim();
      
      let targetVal: any;
      if (rawVal === '?') {
        targetVal = params[paramIndex++];
      } else if (rawVal.startsWith("'") && rawVal.endsWith("'")) {
        targetVal = rawVal.slice(1, -1);
      } else if (rawVal.toUpperCase() === 'NULL') {
        targetVal = null;
      } else {
        targetVal = Number(rawVal);
      }
      
      const rowVal = row[field];
      
      if (op === '=') {
        if (rowVal != targetVal) return false;
      } else if (op === '!=') {
        if (rowVal == targetVal) return false;
      } else if (op === '>') {
        if (!(rowVal > targetVal)) return false;
      } else if (op === '<') {
        if (!(rowVal < targetVal)) return false;
      } else if (op === '>=') {
        if (!(rowVal >= targetVal)) return false;
      } else if (op === '<=') {
        if (!(rowVal <= targetVal)) return false;
      } else if (op === 'IS') {
        if (targetVal === null && rowVal !== null && rowVal !== undefined) return false;
      } else if (op === 'IS NOT') {
        if (targetVal === null && (rowVal === null || rowVal === undefined)) return false;
      } else if (op === 'LIKE') {
        const cleanPattern = targetVal.toString().replace(/%/g, '').toLowerCase();
        if (!rowVal || !rowVal.toString().toLowerCase().includes(cleanPattern)) return false;
      }
    }
    
    return true;
  }
}

export interface AppDatabase {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, params?: any[]): Promise<{ lastInsertRowId: number; changes: number }>;
  getFirstAsync<T = any>(sql: string, params?: any[]): Promise<T | null>;
  getAllAsync<T = any>(sql: string, params?: any[]): Promise<T[]>;
}

let dbInstance: AppDatabase | null = null;

export const getDB = (): AppDatabase => {
  if (!dbInstance) {
    if (Platform.OS === 'web') {
      dbInstance = new WebSQLiteDatabase() as unknown as AppDatabase;
    } else {
      dbInstance = SQLite.openDatabaseSync('quantogastei.db') as unknown as AppDatabase;
    }
  }
  return dbInstance;
};

/**
 * Initializes the local SQLite database.
 * Creates the schema (profiles, assets, categories, transactions) and seeds default data.
 */
export const initializeDatabase = async (): Promise<void> => {
  const db = getDB();

  // 1. Create tables
  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      display_name TEXT,
      avatar_url TEXT,
      default_currency TEXT DEFAULT 'BRL',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      symbol TEXT NOT NULL,
      asset_type TEXT NOT NULL CHECK(asset_type IN ('fiat', 'crypto')),
      decimals INTEGER NOT NULL DEFAULT 2,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      parent_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'ellipsis-horizontal',
      color TEXT NOT NULL DEFAULT '#636E72',
      is_default INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS credit_cards (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      closing_day INTEGER NOT NULL CHECK(closing_day BETWEEN 1 AND 31),
      due_day INTEGER NOT NULL CHECK(due_day BETWEEN 1 AND 31),
      limit_amount REAL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      asset_id TEXT NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
      category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
      credit_card_id TEXT REFERENCES credit_cards(id) ON DELETE SET NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense', 'transfer', 'investment_buy', 'investment_sell')),
      amount REAL NOT NULL CHECK(amount > 0),
      description TEXT,
      payment_method TEXT CHECK(payment_method IN ('pix', 'credit', 'debit', 'cash') OR payment_method IS NULL),
      date TEXT NOT NULL,
      notes TEXT,
      is_recurring INTEGER NOT NULL DEFAULT 0,
      installment_group_id TEXT,
      installment_number INTEGER,
      total_installments INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Dynamically add columns to existing transactions table if they don't exist
  try {
    await db.execAsync(`
      ALTER TABLE transactions ADD COLUMN credit_card_id TEXT REFERENCES credit_cards(id) ON DELETE SET NULL;
    `);
  } catch (e) {}
  try {
    await db.execAsync(`
      ALTER TABLE transactions ADD COLUMN installment_group_id TEXT;
    `);
  } catch (e) {}
  try {
    await db.execAsync(`
      ALTER TABLE transactions ADD COLUMN installment_number INTEGER;
    `);
  } catch (e) {}
  try {
    await db.execAsync(`
      ALTER TABLE transactions ADD COLUMN total_installments INTEGER;
    `);
  } catch (e) {}


  // 2. Check if assets already seeded, if not, seed default assets
  const assetsCountRes = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM assets');
  if (!assetsCountRes || assetsCountRes.count === 0) {
    const defaultAssets = [
      { id: generateUUID(), code: 'BRL', name: 'Real Brasileiro', symbol: 'R$', asset_type: 'fiat', decimals: 2 },
      { id: generateUUID(), code: 'USD', name: 'US Dollar', symbol: '$', asset_type: 'fiat', decimals: 2 },
      { id: generateUUID(), code: 'EUR', name: 'Euro', symbol: '€', asset_type: 'fiat', decimals: 2 },
      { id: generateUUID(), code: 'BTC', name: 'Bitcoin', symbol: '₿', asset_type: 'crypto', decimals: 8 },
      { id: generateUUID(), code: 'ETH', name: 'Ethereum', symbol: 'Ξ', asset_type: 'crypto', decimals: 8 },
      { id: generateUUID(), code: 'SOL', name: 'Solana', symbol: '◎', asset_type: 'crypto', decimals: 8 },
    ];

    for (const asset of defaultAssets) {
      await db.runAsync(
        'INSERT INTO assets (id, code, name, symbol, asset_type, decimals, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
        [asset.id, asset.code, asset.name, asset.symbol, asset.asset_type, asset.decimals]
      );
    }
  }

  // 3. Check if categories already seeded for local-user, if not, seed them
  const categoriesCountRes = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM categories WHERE user_id = 'local-user'"
  );
  if (!categoriesCountRes || categoriesCountRes.count === 0) {
    const userId = 'local-user';

    // Seed top-level categories
    const categoriesToSeed = [
      { id: generateUUID(), name: 'Alimentação', icon: 'restaurant', color: '#FF6B6B', is_default: 1, sort_order: 1 },
      { id: generateUUID(), name: 'Transporte', icon: 'car', color: '#4ECDC4', is_default: 1, sort_order: 2 },
      { id: generateUUID(), name: 'Casa', icon: 'home', color: '#45B7D1', is_default: 1, sort_order: 3 },
      { id: generateUUID(), name: 'Saúde', icon: 'medical', color: '#96CEB4', is_default: 1, sort_order: 4 },
      { id: generateUUID(), name: 'Lazer', icon: 'game-controller', color: '#FFEAA7', is_default: 1, sort_order: 5 },
      { id: generateUUID(), name: 'Bike', icon: 'bicycle', color: '#74B9FF', is_default: 1, sort_order: 6 },
      { id: generateUUID(), name: 'Educação', icon: 'school', color: '#A29BFE', is_default: 1, sort_order: 7 },
      { id: generateUUID(), name: 'Outros', icon: 'ellipsis-horizontal', color: '#636E72', is_default: 1, sort_order: 8 },
      { id: generateUUID(), name: 'Investimentos', icon: 'trending-up', color: '#A371F7', is_default: 1, sort_order: 9 },
    ];

    for (const cat of categoriesToSeed) {
      await db.runAsync(
        'INSERT INTO categories (id, user_id, parent_id, name, icon, color, is_default, sort_order) VALUES (?, ?, NULL, ?, ?, ?, ?, ?)',
        [cat.id, userId, cat.name, cat.icon, cat.color, cat.is_default, cat.sort_order]
      );
    }

    // Get Investimentos id to seed subcategories
    const invCat = await db.getFirstAsync<{ id: string }>(
      "SELECT id FROM categories WHERE user_id = ? AND name = 'Investimentos' AND parent_id IS NULL",
      [userId]
    );

    if (invCat) {
      const subcategories = [
        { id: generateUUID(), name: 'Bitcoin', icon: 'logo-bitcoin', color: '#F7931A', sort_order: 1 },
        { id: generateUUID(), name: 'Ethereum', icon: 'diamond', color: '#627EEA', sort_order: 2 },
        { id: generateUUID(), name: 'Solana', icon: 'flash', color: '#9945FF', sort_order: 3 },
        { id: generateUUID(), name: 'ETFs', icon: 'bar-chart', color: '#58A6FF', sort_order: 4 },
        { id: generateUUID(), name: 'Ações', icon: 'stats-chart', color: '#3FB950', sort_order: 5 },
        { id: generateUUID(), name: 'Renda Fixa', icon: 'shield-checkmark', color: '#2EA043', sort_order: 6 },
        { id: generateUUID(), name: 'Fundos Imobiliários', icon: 'business', color: '#D29922', sort_order: 7 },
      ];

      for (const sub of subcategories) {
        await db.runAsync(
          'INSERT INTO categories (id, user_id, parent_id, name, icon, color, is_default, sort_order) VALUES (?, ?, ?, ?, ?, ?, 1, ?)',
          [sub.id, userId, invCat.id, sub.name, sub.icon, sub.color, sub.sort_order]
        );
      }
    }
  }

  // 4. Seed default local profile if not exists
  const profileExists = await db.getFirstAsync<{ id: string }>(
    "SELECT id FROM profiles WHERE id = 'local-user'"
  );
  if (!profileExists) {
    await db.runAsync(
      "INSERT INTO profiles (id, display_name, avatar_url, default_currency) VALUES ('local-user', 'Usuário Local', NULL, 'BRL')"
    );
  }
};
