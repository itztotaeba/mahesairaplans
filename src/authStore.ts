import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: false,
      isInitialized: false,
      initialize: async () => {
        try {
          set({ isLoading: true });
          if (!supabase) {
            set({ isLoading: false, isInitialized: true });
            return;
          }
          const { data: { session } } = await supabase.auth.getSession();
          set({ session, user: session?.user || null, isLoading: false, isInitialized: true });
        } catch {
          set({ isLoading: false, isInitialized: true, user: null, session: null });
        }
      },
      signIn: async (email: string, password: string) => {
        if (!supabase) return { error: 'Supabase tidak dikonfigurasi' };
        set({ isLoading: true });
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        set({ isLoading: false });
        return { error: error?.message || null };
      },
      signUp: async (email: string, password: string) => {
        if (!supabase) return { error: 'Supabase tidak dikonfigurasi' };
        set({ isLoading: true });
        const { error } = await supabase.auth.signUp({ email, password });
        set({ isLoading: false });
        return { error: error?.message || null };
      },
      signOut: async () => {
        if (!supabase) { set({ user: null, session: null }); return; }
        await supabase.auth.signOut();
        set({ user: null, session: null });
      },
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
    }),
    { name: 'weddingplan-auth', partialize: (state) => ({ user: state.user, session: state.session }) }
  )
);
