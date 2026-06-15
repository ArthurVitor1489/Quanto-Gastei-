import { create } from 'zustand';
import { User, Session, Profile } from '@/types/auth';

interface AuthStoreState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  initialized: boolean;
}

interface AuthStoreActions {
  setAuth: (user: User | null, session: Session | null, profile: Profile | null) => void;
  clearAuth: () => void;
  setInitialized: (initialized: boolean) => void;
}

export type AuthStore = AuthStoreState & AuthStoreActions;

export const mockUser: User = {
  id: 'local-user',
  email: 'local-user@quantogastei.local',
  display_name: 'Usuário Local',
  avatar_url: null,
  default_currency: 'BRL',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockProfile: Profile = {
  id: 'local-user',
  email: 'local-user@quantogastei.local',
  display_name: 'Usuário Local',
  avatar_url: null,
  default_currency: 'BRL',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockSession: Session = {
  access_token: 'local-session-token',
  refresh_token: 'local-session-refresh-token',
  expires_at: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // 1 ano
  user: mockUser,
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: mockUser,
  session: mockSession,
  profile: mockProfile,
  initialized: true,
  setAuth: (user, session, profile) =>
    set({
      user,
      session,
      profile,
      initialized: true,
    }),
  clearAuth: () =>
    set({
      user: mockUser,
      session: mockSession,
      profile: mockProfile,
    }),
  setInitialized: (initialized) =>
    set({
      initialized,
    }),
}));
