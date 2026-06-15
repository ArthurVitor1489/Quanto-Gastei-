import { Platform } from 'react-native';

/**
 * Stubbed Supabase client for local-first SQLite/localStorage architecture.
 * Prevents unnecessary network requests and "Failed to fetch" errors.
 */
export const supabase = {
  auth: {
    getSession: async () => {
      return { data: { session: null }, error: null };
    },
    onAuthStateChange: () => {
      return {
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      };
    },
  },
} as any;
