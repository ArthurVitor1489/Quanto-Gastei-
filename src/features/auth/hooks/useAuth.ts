import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import * as authService from '../services/authService';
import {
  LoginSchemaInput,
  SignUpSchemaInput,
  ResetPasswordSchemaInput,
} from '../schemas/authSchemas';
import { User, Session, Profile } from '@/types/auth';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

export const useAuth = () => {
  const queryClient = useQueryClient();
  
  // Zustand store select selectors
  const user = useAuthStore((state) => state.user);
  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);
  const initialized = useAuthStore((state) => state.initialized);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setInitialized = useAuthStore((state) => state.setInitialized);

  /**
   * Helper function to map Supabase User and Profile to our local models.
   */
  const handleAuthSync = async (
    sbUser: any,
    sbSession: any,
    sbProfile?: Profile | null
  ) => {
    if (!sbUser || !sbSession) {
      clearAuth();
      return;
    }

    const fetchedProfile = sbProfile || (await authService.getProfile(sbUser.id));

    const mappedUser: User = {
      id: sbUser.id,
      email: sbUser.email ?? '',
      display_name:
        fetchedProfile?.display_name ||
        sbUser.user_metadata?.display_name ||
        sbUser.user_metadata?.full_name ||
        null,
      avatar_url:
        fetchedProfile?.avatar_url || sbUser.user_metadata?.avatar_url || null,
      default_currency: fetchedProfile?.default_currency || 'BRL',
      created_at: fetchedProfile?.created_at || sbUser.created_at,
      updated_at:
        fetchedProfile?.updated_at || sbUser.updated_at || sbUser.created_at,
    };

    const mappedSession: Session = {
      access_token: sbSession.access_token,
      refresh_token: sbSession.refresh_token ?? '',
      expires_at: sbSession.expires_at ?? 0,
      user: mappedUser,
    };

    const mappedProfile: Profile = fetchedProfile || {
      id: mappedUser.id,
      email: mappedUser.email,
      display_name: mappedUser.display_name,
      avatar_url: mappedUser.avatar_url,
      default_currency: mappedUser.default_currency,
      created_at: mappedUser.created_at,
      updated_at: mappedUser.updated_at,
    };

    setAuth(mappedUser, mappedSession, mappedProfile);
  };

  /**
   * Mutation for signing in.
   */
  const loginMutation = useMutation({
    mutationFn: async (data: LoginSchemaInput) => {
      const response = await authService.signIn(data.email, data.password);
      if (!response.session || !response.user) {
        throw new Error('Falha ao obter sessão do usuário.');
      }
      const profile = await authService.getProfile(response.user.id);
      return {
        session: response.session,
        user: response.user,
        profile,
      };
    },
    onSuccess: async (data) => {
      await handleAuthSync(data.user, data.session, data.profile);
      queryClient.invalidateQueries();
    },
  });

  /**
   * Mutation for signing up.
   */
  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpSchemaInput) => {
      const response = await authService.signUp(
        data.email,
        data.password,
        data.fullName
      );
      return response;
    },
    onSuccess: async (data) => {
      if (data.session && data.user) {
        await handleAuthSync(data.user, data.session);
      }
      queryClient.invalidateQueries();
    },
  });

  /**
   * Mutation for signing out.
   */
  const signOutMutation = useMutation({
    mutationFn: async () => {
      await authService.signOut();
    },
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
    },
  });

  /**
   * Mutation for requesting a password reset email.
   */
  /**
   * Mutation for requesting a password reset email.
   */
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordSchemaInput) => {
      return await authService.resetPassword(data.email);
    },
  });

  /**
   * Mutation for updating the user profile.
   */
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      return await authService.updateProfile(user.id, updates);
    },
    onSuccess: (updatedProfile) => {
      if (user && session) {
        setAuth(user, session, updatedProfile);
      }
      queryClient.invalidateQueries();
    },
  });

  /**
   * Synchronize the authentication state on session recovery or event change.
   */
  const initializeAuth = async () => {
    try {
      const {
        data: { session: sbSession },
      } = await supabase.auth.getSession();

      if (sbSession && sbSession.user) {
        await handleAuthSync(sbSession.user, sbSession);
      } else {
        clearAuth();
      }
    } catch (err) {
      console.error('Error recovery session:', err);
      clearAuth();
    } finally {
      setInitialized(true);
    }
  };

  return {
    // Session State
    user,
    session,
    profile,
    initialized,
    isAuthenticated: !!user,

    // Mutation Operations
    loginMutation,
    signUpMutation,
    signOutMutation,
    resetPasswordMutation,
    updateProfileMutation,

    // Manual Init trigger
    initializeAuth,
  };
};
