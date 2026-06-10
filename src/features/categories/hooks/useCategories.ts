import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/categoryService';
import { Category, CategoryFormData } from '@/types/category';

export function useCategories() {
  const queryClient = useQueryClient();
  const { profile } = useAuthStore();
  const userId = profile?.id;

  const categoriesQuery = useQuery<Category[], Error>({
    queryKey: ['categories', userId],
    queryFn: () => {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      return getCategories(userId);
    },
    enabled: !!userId,
  });

  const createMutation = useMutation<Category, Error, CategoryFormData>({
    mutationFn: (data) => {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      return createCategory(userId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', userId] });
    },
  });

  const updateMutation = useMutation<Category, Error, { id: string; data: Partial<CategoryFormData> }>({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', userId] });
    },
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (id) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', userId] });
    },
  });

  return {
    categories: categoriesQuery.data || [],
    isLoading: categoriesQuery.isLoading,
    error: categoriesQuery.error,
    refetch: categoriesQuery.refetch,
    createCategory: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateCategory: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteCategory: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
