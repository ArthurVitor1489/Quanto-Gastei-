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

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  profile: null,
  initialized: false,
  setAuth: (user, session, profile) =>
    set({
      user,
      session,
      profile,
      initialized: true,
    }),
  clearAuth: () =>
    set({
      user: null,
      session: null,
      profile: null,
    }),
  setInitialized: (initialized) =>
    set({
      initialized,
    }),
}));
