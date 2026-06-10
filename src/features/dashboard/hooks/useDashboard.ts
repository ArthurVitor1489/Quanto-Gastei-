import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { getDashboardData, DashboardData } from '../services/dashboardService';
import { DisplayCurrency } from '@/types/portfolio';

export function useDashboard() {
  const { profile } = useAuthStore();
  const userId = profile?.id;
  const preferredCurrency = (profile?.default_currency || 'BRL') as DisplayCurrency;

  return useQuery<DashboardData, Error>({
    queryKey: ['dashboard', userId, preferredCurrency],
    queryFn: () => {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      return getDashboardData(userId, preferredCurrency);
    },
    enabled: !!userId,
  });
}
