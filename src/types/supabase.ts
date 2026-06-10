/**
 * Quanto Gastei? - Supabase Database Types
 * Generated-style types for the Supabase public schema.
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          default_currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          default_currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          default_currency?: string;
          updated_at?: string;
        };
      };
      assets: {
        Row: {
          id: string;
          code: string;
          name: string;
          symbol: string;
          asset_type: 'fiat' | 'crypto';
          decimals: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          symbol: string;
          asset_type: 'fiat' | 'crypto';
          decimals?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          code?: string;
          name?: string;
          symbol?: string;
          asset_type?: 'fiat' | 'crypto';
          decimals?: number;
          is_active?: boolean;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          parent_id: string | null;
          name: string;
          icon: string;
          color: string;
          is_default: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          parent_id?: string | null;
          name: string;
          icon: string;
          color: string;
          is_default?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          parent_id?: string | null;
          name?: string;
          icon?: string;
          color?: string;
          is_default?: boolean;
          sort_order?: number;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          asset_id: string;
          category_id: string | null;
          type: 'income' | 'expense' | 'transfer' | 'investment_buy' | 'investment_sell';
          amount: number;
          description: string;
          payment_method: 'pix' | 'credit' | 'debit' | 'cash' | null;
          date: string;
          notes: string | null;
          is_recurring: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          asset_id: string;
          category_id?: string | null;
          type: 'income' | 'expense' | 'transfer' | 'investment_buy' | 'investment_sell';
          amount: number;
          description: string;
          payment_method?: 'pix' | 'credit' | 'debit' | 'cash' | null;
          date: string;
          notes?: string | null;
          is_recurring?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          asset_id?: string;
          category_id?: string | null;
          type?: 'income' | 'expense' | 'transfer' | 'investment_buy' | 'investment_sell';
          amount?: number;
          description?: string;
          payment_method?: 'pix' | 'credit' | 'debit' | 'cash' | null;
          date?: string;
          notes?: string | null;
          is_recurring?: boolean;
          updated_at?: string;
        };
      };
    };
  };
}

/** Helper type to extract Row type from a table name */
export type TableRow<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

/** Helper type to extract Insert type from a table name */
export type TableInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

/** Helper type to extract Update type from a table name */
export type TableUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
