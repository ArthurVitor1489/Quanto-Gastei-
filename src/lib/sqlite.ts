import * as SQLite from 'expo-sqlite';

// Helper to generate UUIDs locally without external dependencies
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

let dbInstance: SQLite.SQLiteDatabase | null = null;

export const getDB = (): SQLite.SQLiteDatabase => {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync('quantogastei.db');
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

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      asset_id TEXT NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
      category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense', 'transfer', 'investment_buy', 'investment_sell')),
      amount REAL NOT NULL CHECK(amount > 0),
      description TEXT,
      payment_method TEXT CHECK(payment_method IN ('pix', 'credit', 'debit', 'cash') OR payment_method IS NULL),
      date TEXT NOT NULL,
      notes TEXT,
      is_recurring INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

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
