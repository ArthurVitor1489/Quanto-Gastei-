import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { usePortfolioStore } from '@/store/portfolioStore';
import { getExchangeRates } from '../services/assetPriceService';
import { getUserPortfolio, calculatePortfolioSummary, getPortfolioHistory, PortfolioHistoryItem } from '../services/portfolioService';
import { PortfolioSummary } from '@/types/portfolio';

export const PORTFOLIO_QUERY_KEY = 'portfolio';

/**
 * Custom React Query hook to fetch asset balances and exchange rates,
 * then calculate and return the formatted portfolio summary.
 */
export const usePortfolio = () => {
  const user = useAuthStore((state) => state.user);
  const displayCurrency = usePortfolioStore((state) => state.displayCurrency);
  const userId = user?.id;

  return useQuery<PortfolioSummary | null, Error>({
    queryKey: [PORTFOLIO_QUERY_KEY, userId, displayCurrency],
    queryFn: async () => {
      if (!userId) {
        return null;
      }

      // Fetch active balances and current exchange rates in parallel
      const [balances, rates] = await Promise.all([
        getUserPortfolio(userId),
        getExchangeRates(),
      ]);

      // Calculate the portfolio totals, percentages, and breakdowns
      return calculatePortfolioSummary(balances, rates, displayCurrency);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes cache stale time
  });
};

/**
 * Custom React Query hook to fetch historical net worth balances.
 */
export const usePortfolioHistory = () => {
  const user = useAuthStore((state) => state.user);
  const displayCurrency = usePortfolioStore((state) => state.displayCurrency);
  const userId = user?.id;

  return useQuery<PortfolioHistoryItem[] | null, Error>({
    queryKey: [PORTFOLIO_QUERY_KEY, 'history', userId, displayCurrency],
    queryFn: async () => {
      if (!userId) {
        return null;
      }

      const rates = await getExchangeRates();
      return getPortfolioHistory(userId, displayCurrency, rates);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes cache stale time
  });
};

