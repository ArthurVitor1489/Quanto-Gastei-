import { create } from 'zustand';

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface UiStoreState {
  themeMode: 'light' | 'dark' | 'system';
  isTransactionModalOpen: boolean;
  transactionModalType: 'income' | 'expense' | null;
  selectedTransactionId: string | null;
  notifications: ToastNotification[];
}

interface UiStoreActions {
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  openTransactionModal: (type: 'income' | 'expense', transactionId?: string | null) => void;
  closeTransactionModal: () => void;
  addNotification: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void;
  removeNotification: (id: string) => void;
}

export type UiStore = UiStoreState & UiStoreActions;

export const useUiStore = create<UiStore>((set) => ({
  themeMode: 'dark', // default to dark theme as required by design
  isTransactionModalOpen: false,
  transactionModalType: null,
  selectedTransactionId: null,
  notifications: [],

  setThemeMode: (themeMode) => set({ themeMode }),
  
  openTransactionModal: (type, transactionId: string | null = null) =>
    set({
      isTransactionModalOpen: true,
      transactionModalType: type,
      selectedTransactionId: transactionId,
    }),
    
  closeTransactionModal: () =>
    set({
      isTransactionModalOpen: false,
      transactionModalType: null,
      selectedTransactionId: null,
    }),

  addNotification: (message, type = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      notifications: [...state.notifications, { id, message, type, duration }],
    }));
    
    // Auto-remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, duration);
    }
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
