import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCreditCards,
  createCreditCard,
  updateCreditCard,
  deleteCreditCard,
} from '../services/creditCardService';
import { CreditCard, CreditCardFormData } from '@/types/creditCard';

export function useCreditCards() {
  const queryClient = useQueryClient();

  const creditCardsQuery = useQuery<CreditCard[], Error>({
    queryKey: ['creditCards'],
    queryFn: () => getCreditCards(),
  });

  const createMutation = useMutation<CreditCard, Error, CreditCardFormData>({
    mutationFn: (data) => createCreditCard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creditCards'] });
    },
  });

  const updateMutation = useMutation<CreditCard, Error, { id: string; data: Partial<CreditCardFormData> }>({
    mutationFn: ({ id, data }) => updateCreditCard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creditCards'] });
    },
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (id) => deleteCreditCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creditCards'] });
    },
  });

  return {
    creditCards: creditCardsQuery.data || [],
    isLoading: creditCardsQuery.isLoading,
    error: creditCardsQuery.error,
    refetch: creditCardsQuery.refetch,
    createCreditCard: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateCreditCard: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteCreditCard: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
