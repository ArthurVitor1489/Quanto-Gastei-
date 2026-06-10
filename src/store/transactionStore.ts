import { create } from 'zustand';
import { TransactionFilter } from '@/types/transaction';

interface TransactionStoreState {
  filters: TransactionFilter;
}

interface TransactionStoreActions {
  setFilters: (filters: Partial<TransactionFilter>) => void;
  resetFilters: () => void;
  setSearch: (search: string) => void;
  setCategory: (categoryId: string | undefined) => void;
  setAsset: (assetId: string | undefined) => void;
  setType: (type: TransactionFilter['type'] | undefined) => void;
}

export type TransactionStore = TransactionStoreState & TransactionStoreActions;

const initialFilters: TransactionFilter = {
  search: '',
  type: undefined,
  category_id: undefined,
  asset_id: undefined,
  payment_method: undefined,
  date_from: undefined,
  date_to: undefined,
};

export const useTransactionStore = create<TransactionStore>((set) => ({
  filters: initialFilters,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () => set({ filters: initialFilters }),
  setSearch: (search) =>
    set((state) => ({
      filters: { ...state.filters, search },
    })),
  setCategory: (categoryId) =>
    set((state) => ({
      filters: { ...state.filters, category_id: categoryId },
    })),
  setAsset: (assetId) =>
    set((state) => ({
      filters: { ...state.filters, asset_id: assetId },
    })),
  setType: (type) =>
    set((state) => ({
      filters: { ...state.filters, type },
    })),
}));
