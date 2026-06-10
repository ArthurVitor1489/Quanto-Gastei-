import React, { createContext, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { getProfile } from '@/features/auth/services/authService';
import { QueryProvider } from './QueryProvider';
import { User, Session, Profile } from '@/types/auth';

interface AppContextType {
  initialized: boolean;
}

const AppContext = createContext<AppContextType>({ initialized: false });

export const useApp = () => useContext(AppContext);

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const { setAuth, clearAuth, setInitialized, initialized, user, session, profile } = useAuthStore();

  useEffect(() => {
    // 1. Check current session on startup
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (currentSession) {
          const userObj: User = {
            id: currentSession.user.id,
            email: currentSession.user.email ?? '',
            display_name: currentSession.user.user_metadata?.display_name ?? null,
            avatar_url: currentSession.user.user_metadata?.avatar_url ?? null,
            default_currency: currentSession.user.user_metadata?.default_currency ?? 'BRL',
            created_at: currentSession.user.created_at,
            updated_at: currentSession.user.updated_at ?? currentSession.user.created_at,
          };

          const dbProfile = await getProfile(userObj.id);
          const mappedProfile: Profile = dbProfile ?? {
            id: userObj.id,
            email: userObj.email,
            display_name: userObj.display_name,
            avatar_url: userObj.avatar_url,
            default_currency: userObj.default_currency,
            created_at: userObj.created_at,
            updated_at: userObj.updated_at,
          };

          const mappedSession: Session = {
            access_token: currentSession.access_token,
            refresh_token: currentSession.refresh_token ?? '',
            expires_at: currentSession.expires_at ?? 0,
            user: userObj,
          };

          setAuth(userObj, mappedSession, mappedProfile);
        } else {
          clearAuth();
        }
      } catch (err) {
        console.error('Error initializing authentication:', err);
        clearAuth();
      } finally {
        setInitialized(true);
      }
    };

    initializeAuth();

    // 2. Set up auth state change listener (Synchronous to avoid deadlocks in React Native SDK)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (newSession) {
        const userObj: User = {
          id: newSession.user.id,
          email: newSession.user.email ?? '',
          display_name: newSession.user.user_metadata?.display_name ?? null,
          avatar_url: newSession.user.user_metadata?.avatar_url ?? null,
          default_currency: newSession.user.user_metadata?.default_currency ?? 'BRL',
          created_at: newSession.user.created_at,
          updated_at: newSession.user.updated_at ?? newSession.user.created_at,
        };

        const mappedProfile: Profile = {
          id: userObj.id,
          email: userObj.email,
          display_name: userObj.display_name,
          avatar_url: userObj.avatar_url,
          default_currency: userObj.default_currency,
          created_at: userObj.created_at,
          updated_at: userObj.updated_at,
        };

        const mappedSession: Session = {
          access_token: newSession.access_token,
          refresh_token: newSession.refresh_token ?? '',
          expires_at: newSession.expires_at ?? 0,
          user: userObj,
        };

        setAuth(userObj, mappedSession, mappedProfile);
      } else {
        clearAuth();
      }
      setInitialized(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setAuth, clearAuth, setInitialized]);

  // 3. Sync database profile in the background (avoiding SDK deadlocks)
  useEffect(() => {
    if (user && session) {
      let isMounted = true;
      const syncProfile = async () => {
        try {
          const dbProfile = await getProfile(user.id);
          if (dbProfile && isMounted) {
            // Only update if database profile differs from local metadata profile
            if (
              dbProfile.display_name !== profile?.display_name ||
              dbProfile.avatar_url !== profile?.avatar_url ||
              dbProfile.default_currency !== profile?.default_currency
            ) {
              setAuth(user, session, dbProfile);
            }
          }
        } catch (err) {
          console.error('Error syncing profile in background:', err);
        }
      };
      syncProfile();
      return () => {
        isMounted = false;
      };
    }
  }, [user?.id, session?.access_token, profile, setAuth]);

  return (
    <QueryProvider>
      <AppContext.Provider value={{ initialized }}>
        {children}
      </AppContext.Provider>
    </QueryProvider>
  );
}
