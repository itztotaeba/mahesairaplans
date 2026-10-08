import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './lib/supabase';
import { useAuthStore } from './authStore';
import { useToastStore } from './toastStore';

interface CollaborationState {
  currentWeddingId: string | null;
  userRole: 'owner' | 'member' | null;
  members: any[];
  isLoading: boolean;
  initializeWedding: () => Promise<void>;
  initializeWeddingSession: () => Promise<void>;
  createWedding: () => Promise<{ success: boolean; error?: string }>;
  inviteMember: (email: string) => Promise<{ success: boolean; error?: string }>;
  removeMember: (userId: string) => Promise<{ success: boolean; error?: string }>;
  fetchMembers: () => Promise<void>;
  fetchUserProfile: () => Promise<{ avatar_url?: string } | null>;
  setCurrentWeddingId: (id: string | null) => void;
  setUserRole: (role: 'owner' | 'member' | null) => void;
  resetData: () => void;
}

export const useCollaborationStore = create<CollaborationState>()(
  persist(
    (set, get) => ({
      currentWeddingId: null,
      userRole: null,
      members: [],
      isLoading: false,
      initializeWedding: async () => {
        const { user } = useAuthStore.getState();
        if (!user || !supabase) return;
        try {
          set({ isLoading: true });
          const { data: existingMembership } = await supabase
            .from('wedding_members').select('*, profiles(email, full_name)')
            .eq('user_id', user.id).maybeSingle();
          if (existingMembership) {
            set({ currentWeddingId: existingMembership.wedding_id, userRole: existingMembership.role, isLoading: false });
            await get().fetchMembers();
            return;
          }
          const { data: newWeddingId } = await supabase.rpc('create_initial_wedding');
          if (newWeddingId) {
            set({ currentWeddingId: newWeddingId, userRole: 'owner', isLoading: false });
            await get().fetchMembers();
          }
        } catch {
          set({ isLoading: false, currentWeddingId: null, userRole: null });
        }
      },
      initializeWeddingSession: async () => {
        const { user } = useAuthStore.getState();
        if (!user || !supabase) return;
        try {
          set({ isLoading: true });
          const { data: existingMembership } = await supabase
            .from('wedding_members').select('wedding_id, role')
            .eq('user_id', user.id).maybeSingle();
          if (existingMembership) {
            set({ currentWeddingId: existingMembership.wedding_id, userRole: existingMembership.role as any, isLoading: false });
          } else {
            set({ currentWeddingId: null, userRole: null, isLoading: false });
          }
        } catch {
          set({ isLoading: false, currentWeddingId: null, userRole: null });
        }
      },
      createWedding: async () => {
        const { user } = useAuthStore.getState();
        if (!user || !supabase) return { success: false, error: 'Tidak terautentikasi' };
        try {
          set({ isLoading: true });
          const { data: newWeddingId } = await supabase.rpc('create_initial_wedding');
          if (newWeddingId) {
            set({ currentWeddingId: newWeddingId, userRole: 'owner', isLoading: false });
            await get().fetchMembers();
            return { success: true };
          }
          set({ isLoading: false });
          return { success: false, error: 'Gagal membuat wedding' };
        } catch (error: any) {
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },
      inviteMember: async (email: string) => {
        const { currentWeddingId, userRole } = get();
        const { user } = useAuthStore.getState();
        if (!user || !supabase || !currentWeddingId) return { success: false, error: 'Tidak ada wedding aktif' };
        if (userRole !== 'owner') return { success: false, error: 'Hanya owner yang bisa mengundang' };
        try {
          const { data: profile } = await supabase.from('profiles').select('id, email').eq('email', email).single();
          if (!profile) return { success: false, error: 'Email belum terdaftar' };
          await supabase.from('wedding_members').insert({ wedding_id: currentWeddingId, user_id: profile.id, role: 'member' });
          await get().fetchMembers();
          useToastStore.getState().addToast(`${email} berhasil diundang!`, 'success');
          return { success: true };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },
      removeMember: async (userId: string) => {
        const { currentWeddingId, userRole } = get();
        const { user } = useAuthStore.getState();
        if (!user || !supabase || !currentWeddingId) return { success: false, error: 'Tidak ada wedding aktif' };
        if (userRole !== 'owner') return { success: false, error: 'Hanya owner' };
        try {
          await supabase.from('wedding_members').delete().eq('wedding_id', currentWeddingId).eq('user_id', userId);
          await get().fetchMembers();
          return { success: true };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },
      fetchMembers: async () => {
        const { currentWeddingId } = get();
        if (!currentWeddingId || !supabase) return;
        try {
          const { data } = await supabase.from('wedding_members')
            .select('*, profiles(email, full_name, avatar_url)')
            .eq('wedding_id', currentWeddingId).order('joined_at', { ascending: true });
          set({ members: data || [] });
        } catch {}
      },
      fetchUserProfile: async () => {
        const { user } = useAuthStore.getState();
        if (!user || !supabase) return null;
        try {
          const { data } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).single();
          return data;
        } catch { return null; }
      },
      setCurrentWeddingId: (id) => set({ currentWeddingId: id }),
      setUserRole: (role) => set({ userRole: role }),
      resetData: () => set({ currentWeddingId: null, userRole: null, members: [] }),
    }),
    { name: 'weddingplan-collaboration', partialize: (state) => ({ currentWeddingId: state.currentWeddingId, userRole: state.userRole }) }
  )
);
