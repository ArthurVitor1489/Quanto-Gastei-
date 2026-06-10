import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/auth';
import { Database } from '@/types/supabase';

/**
 * Signs up a new user with email, password, and full name.
 * The display name is stored in raw_user_meta_data.
 */
export const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: fullName,
        full_name: fullName,
      },
    },
  });
  if (error) throw error;
  return data;
};

/**
 * Signs in an existing user with email and password.
 */
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

/**
 * Signs out the currently authenticated user.
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Sends a password reset email to the user.
 */
export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
  return data;
};

/**
 * Fetches the user profile from the `profiles` table.
 */
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  const profileData = data as any;
  return {
    id: profileData.id,
    email: '', // Not stored in profiles table
    display_name: profileData.full_name || null,
    avatar_url: profileData.avatar_url,
    default_currency: profileData.preferred_currency || 'BRL',
    created_at: profileData.created_at || '',
    updated_at: profileData.updated_at || '',
  } as unknown as Profile;
};

/**
 * Updates an existing user profile in the `profiles` table.
 */
export const updateProfile = async (
  userId: string,
  updates: Partial<Profile>
): Promise<Profile> => {
  const dbUpdates: any = {};
  if (updates.display_name !== undefined) {
    dbUpdates.full_name = updates.display_name;
  }
  if (updates.avatar_url !== undefined) {
    dbUpdates.avatar_url = updates.avatar_url;
  }
  if (updates.default_currency !== undefined) {
    dbUpdates.preferred_currency = updates.default_currency;
  }

  const { data, error } = await (supabase
    .from('profiles') as any)
    .update(dbUpdates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  const profileData = data as any;
  return {
    id: profileData.id,
    email: '',
    display_name: profileData.full_name || null,
    avatar_url: profileData.avatar_url,
    default_currency: profileData.preferred_currency || 'BRL',
    created_at: profileData.created_at || '',
    updated_at: profileData.updated_at || '',
  } as unknown as Profile;
};
