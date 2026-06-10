import { create } from 'zustand';
import { DisplayCurrency } from '@/types/portfolio';

interface PortfolioStoreState {
  displayCurrency: DisplayCurrency;
}

interface PortfolioStoreActions {
  setDisplayCurrency: (currency: DisplayCurrency) => void;
}

export type PortfolioStore = PortfolioStoreState & PortfolioStoreActions;

export const usePortfolioStore = create<PortfolioStore>((set) => ({
  displayCurrency: 'BRL',
  setDisplayCurrency: (currency) => set({ displayCurrency: currency }),
}));
