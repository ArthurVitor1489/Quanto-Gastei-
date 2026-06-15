import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore, mockUser, mockSession, mockProfile } from '@/store/authStore';
import { getProfile } from '@/features/auth/services/authService';
import { QueryProvider } from './QueryProvider';
import { initializeDatabase } from '@/lib/sqlite';
import { User, Session } from '@/types/auth';

interface AppContextType {
  initialized: boolean;
}

const AppContext = createContext<AppContextType>({ initialized: false });

export const useApp = () => useContext(AppContext);

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const { setAuth, setInitialized, initialized } = useAuthStore();
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        // 1. Initialize SQLite Database (creates tables & seeds default data)
        await initializeDatabase();
        setDbReady(true);

        // 2. Fetch the profile from local SQLite database
        const userId = 'local-user';
        const dbProfile = await getProfile(userId);

        if (dbProfile) {
          const mappedUser: User = {
            ...mockUser,
            display_name: dbProfile.display_name,
            default_currency: dbProfile.default_currency,
          };

          const mappedSession: Session = {
            ...mockSession,
            user: mappedUser,
          };

          setAuth(mappedUser, mappedSession, dbProfile);
        } else {
          // Fallback if profile didn't seed for some reason
          setAuth(mockUser, mockSession, mockProfile);
        }
      } catch (err) {
        console.error('Error initializing application database/auth:', err);
        // Fallback to defaults to keep the app working
        setAuth(mockUser, mockSession, mockProfile);
      } finally {
        setInitialized(true);
      }
    };

    initApp();
  }, [setAuth, setInitialized]);

  return (
    <QueryProvider>
      <AppContext.Provider value={{ initialized: initialized && dbReady }}>
        {children}
      </AppContext.Provider>
    </QueryProvider>
  );
}

