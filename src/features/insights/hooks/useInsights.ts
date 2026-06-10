import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { getFinancialInsights } from '../services/insightService';
import { DisplayCurrency } from '@/types/portfolio';
import { Insight } from '@/types/insight';

export function useInsights() {
  const { profile } = useAuthStore();
  const userId = profile?.id;
  const preferredCurrency = (profile?.default_currency || 'BRL') as DisplayCurrency;

  return useQuery<Insight[], Error>({
    queryKey: ['insights', userId, preferredCurrency],
    queryFn: () => {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      return getFinancialInsights(userId, preferredCurrency);
    },
    enabled: !!userId,
  });
}
