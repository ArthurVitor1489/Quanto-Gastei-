import { getDB, generateUUID } from '@/lib/sqlite';
import { Category, CategoryFormData } from '@/types/category';

/**
 * Maps a SQLite database row to the Category interface
 */
const mapRowToCategory = (row: any): Category => {
  return {
    id: row.id,
    user_id: row.user_id,
    parent_id: row.parent_id || null,
    name: row.name,
    icon: row.icon,
    color: row.color,
    is_default: Boolean(row.is_default),
    sort_order: Number(row.sort_order),
    created_at: row.created_at,
  };
};

/**
 * Fetches all categories available for a user from local SQLite.
 * This includes global system-default categories and user-specific custom categories.
 */
export const getCategories = async (userId: string): Promise<Category[]> => {
  const db = getDB();
  try {
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM categories WHERE user_id = ? OR is_default = 1 ORDER BY sort_order ASC',
      [userId]
    );
    return rows.map(mapRowToCategory);
  } catch (error) {
    console.error('Error in SQLite getCategories:', error);
    throw error;
  }
};

/**
 * Creates a new custom category for a user in SQLite.
 */
export const createCategory = async (
  userId: string,
  categoryData: CategoryFormData
): Promise<Category> => {
  const db = getDB();
  const id = generateUUID();

  try {
    // Determine next sort order by looking at max
    const existing = await db.getAllAsync<any>(
      'SELECT sort_order FROM categories WHERE user_id = ?',
      [userId]
    );
    
    const maxSortOrder = existing && existing.length > 0 
      ? Math.max(...existing.map((e: any) => Number(e.sort_order ?? 0)))
      : 10;

    const sort_order = maxSortOrder + 1;

    await db.runAsync(
      `INSERT INTO categories (id, user_id, parent_id, name, icon, color, is_default, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
      [
        id,
        userId,
        categoryData.parent_id || null,
        categoryData.name,
        categoryData.icon,
        categoryData.color,
        sort_order
      ]
    );

    const row = await db.getFirstAsync<any>('SELECT * FROM categories WHERE id = ?', [id]);
    if (!row) throw new Error('Falha ao recuperar categoria criada');
    return mapRowToCategory(row);
  } catch (error) {
    console.error('Error in SQLite createCategory:', error);
    throw error;
  }
};

/**
 * Updates a custom category in SQLite.
 */
export const updateCategory = async (
  categoryId: string,
  updates: Partial<CategoryFormData>
): Promise<Category> => {
  const db = getDB();
  try {
    // Fetch existing first
    const row = await db.getFirstAsync<any>('SELECT * FROM categories WHERE id = ?', [categoryId]);
    if (!row) throw new Error('Categoria não encontrada');

    const name = updates.name !== undefined ? updates.name : row.name;
    const icon = updates.icon !== undefined ? updates.icon : row.icon;
    const color = updates.color !== undefined ? updates.color : row.color;
    const parent_id = updates.parent_id !== undefined ? updates.parent_id : row.parent_id;

    await db.runAsync(
      'UPDATE categories SET name = ?, icon = ?, color = ?, parent_id = ? WHERE id = ?',
      [name, icon, color, parent_id || null, categoryId]
    );

    const updatedRow = await db.getFirstAsync<any>('SELECT * FROM categories WHERE id = ?', [categoryId]);
    if (!updatedRow) throw new Error('Falha ao recuperar categoria atualizada');
    return mapRowToCategory(updatedRow);
  } catch (error) {
    console.error('Error in SQLite updateCategory:', error);
    throw error;
  }
};

/**
 * Deletes a custom category from SQLite.
 */
export const deleteCategory = async (categoryId: string): Promise<void> => {
  const db = getDB();
  try {
    await db.runAsync('DELETE FROM categories WHERE id = ?', [categoryId]);
  } catch (error) {
    console.error('Error in SQLite deleteCategory:', error);
    throw error;
  }
};

