import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { getReportSummary, PeriodType } from '../services/reportService';
import { DisplayCurrency } from '@/types/portfolio';
import { ReportSummary } from '@/types/report';

export function useReports(periodType: PeriodType) {
  const { profile } = useAuthStore();
  const userId = profile?.id;
  const preferredCurrency = (profile?.default_currency || 'BRL') as DisplayCurrency;

  return useQuery<ReportSummary, Error>({
    queryKey: ['reports', userId, periodType, preferredCurrency],
    queryFn: () => {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      return getReportSummary(userId, periodType, preferredCurrency);
    },
    enabled: !!userId,
  });
}
