import { supabase } from '@/lib/supabase';
import { Category, CategoryFormData } from '@/types/category';

/**
 * Fetches all categories available for a user.
 * This includes global system-default categories and user-specific custom categories.
 */
export const getCategories = async (userId: string): Promise<Category[]> => {
  const { data, error } = await (supabase
    .from('categories') as any)
    .select('*')
    .or(`user_id.eq.${userId},is_default.eq.true`)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data || []) as Category[];
};

/**
 * Creates a new custom category for a user.
 */
export const createCategory = async (
  userId: string,
  categoryData: CategoryFormData
): Promise<Category> => {
  // Determine next sort order by looking at max
  const { data: existing } = await (supabase
    .from('categories') as any)
    .select('sort_order')
    .eq('user_id', userId);
  
  const maxSortOrder = existing && existing.length > 0 
    ? Math.max(...existing.map((e: any) => e.sort_order ?? 0))
    : 10;

  const newCategory = {
    user_id: userId,
    parent_id: categoryData.parent_id,
    name: categoryData.name,
    icon: categoryData.icon,
    color: categoryData.color,
    is_default: false,
    sort_order: maxSortOrder + 1,
  };

  const { data, error } = await (supabase
    .from('categories') as any)
    .insert([newCategory])
    .select()
    .single();

  if (error) throw error;
  return data as Category;
};

/**
 * Updates a custom category.
 */
export const updateCategory = async (
  categoryId: string,
  updates: Partial<CategoryFormData>
): Promise<Category> => {
  const { data, error } = await (supabase
    .from('categories') as any)
    .update(updates)
    .eq('id', categoryId)
    .select()
    .single();

  if (error) throw error;
  return data as Category;
};

/**
 * Deletes a custom category.
 * Note: DB cascade or triggers will handle transactions referencing this category.
 */
export const deleteCategory = async (categoryId: string): Promise<void> => {
  const { error } = await (supabase
    .from('categories') as any)
    .delete()
    .eq('id', categoryId);

  if (error) throw error;
};
