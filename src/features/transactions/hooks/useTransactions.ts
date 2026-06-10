import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactions,
  getTransaction,
  getAssets,
  getCategories,
} from '../services/transactionService';
import { TransactionFilter } from '@/types/transaction';

/**
 * Hook to fetch transactions list with optional filters.
 */
export const useTransactions = (filters?: TransactionFilter & { startDate?: string; endDate?: string; assetId?: string; categoryId?: string }) => {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => getTransactions(filters),
  });
};

/**
 * Hook to fetch a single transaction by ID.
 */
export const useTransaction = (id: string) => {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: () => getTransaction(id),
    enabled: !!id,
  });
};

/**
 * Hook to create a new transaction.
 * Invalidates transactions, dashboard, and portfolio cache keys upon success.
 */
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

/**
 * Hook to update an existing transaction.
 * Invalidates transactions, target transaction, dashboard, and portfolio cache keys.
 */
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, transaction }: { id: string; transaction: any }) =>
      updateTransaction(id, transaction),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction', data.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

/**
 * Hook to delete an existing transaction.
 * Invalidates transactions, dashboard, and portfolio cache keys.
 */
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

/**
 * Hook to fetch active assets.
 */
export const useAssets = () => {
  return useQuery({
    queryKey: ['assets'],
    queryFn: getAssets,
  });
};

/**
 * Hook to fetch categories.
 */
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
};
