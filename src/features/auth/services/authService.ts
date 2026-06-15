import { getDB } from '@/lib/sqlite';
import { Profile } from '@/types/auth';
import { mockUser, mockSession } from '@/store/authStore';

/**
 * Signs up a new user (mocked for offline-local architecture).
 */
export const signUp = async (email: string, password: string, fullName: string) => {
  const db = getDB();
  const userId = 'local-user';

  // Seed user profile locally if not exists
  const existing = await getProfile(userId);
  if (!existing) {
    await db.runAsync(
      "INSERT INTO profiles (id, display_name, avatar_url, default_currency) VALUES (?, ?, NULL, 'BRL')",
      [userId, fullName]
    );
  } else {
    await db.runAsync(
      "UPDATE profiles SET display_name = ? WHERE id = ?",
      [fullName, userId]
    );
  }

  const updatedProfile = await getProfile(userId);

  return {
    user: {
      ...mockUser,
      display_name: fullName,
    },
    session: mockSession,
    profile: updatedProfile,
  };
};

/**
 * Signs in an existing user (mocked for offline-local architecture).
 */
export const signIn = async (email: string, password: string) => {
  const userId = 'local-user';
  const profile = await getProfile(userId);
  
  return {
    user: profile ? {
      ...mockUser,
      display_name: profile.display_name,
      default_currency: profile.default_currency,
    } : mockUser,
    session: mockSession,
    profile: profile || mockProfile,
  };
};

// Fallback profile if something fails
const mockProfile: Profile = {
  id: 'local-user',
  email: 'local-user@quantogastei.local',
  display_name: 'Usuário Local',
  avatar_url: null,
  default_currency: 'BRL',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

/**
 * Signs out the user (does nothing since we are locally persistent).
 */
export const signOut = async () => {
  return Promise.resolve();
};

/**
 * Sends a password reset email (mocked).
 */
export const resetPassword = async (email: string) => {
  return { success: true };
};

/**
 * Fetches the user profile from the local SQLite `profiles` table.
 */
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const db = getDB();
  try {
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM profiles WHERE id = ?',
      [userId]
    );

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      email: 'local-user@quantogastei.local',
      display_name: row.display_name || null,
      avatar_url: row.avatar_url || null,
      default_currency: row.default_currency || 'BRL',
      created_at: row.created_at || '',
      updated_at: row.updated_at || '',
    } as Profile;
  } catch (error) {
    console.error('Error in SQLite getProfile:', error);
    throw error;
  }
};

/**
 * Updates an existing user profile in the local SQLite `profiles` table.
 */
export const updateProfile = async (
  userId: string,
  updates: Partial<Profile>
): Promise<Profile> => {
  const db = getDB();
  try {
    const existing = await getProfile(userId);
    const display_name = updates.display_name !== undefined ? updates.display_name : (existing?.display_name ?? null);
    const avatar_url = updates.avatar_url !== undefined ? updates.avatar_url : (existing?.avatar_url ?? null);
    const default_currency = updates.default_currency !== undefined ? updates.default_currency : (existing?.default_currency ?? 'BRL');

    await db.runAsync(
      "UPDATE profiles SET display_name = ?, avatar_url = ?, default_currency = ?, updated_at = datetime('now') WHERE id = ?",
      [display_name, avatar_url, default_currency, userId]
    );

    const updated = await getProfile(userId);
    if (!updated) {
      throw new Error('Failed to load updated profile');
    }
    return updated;
  } catch (error) {
    console.error('Error in SQLite updateProfile:', error);
    throw error;
  }
};

