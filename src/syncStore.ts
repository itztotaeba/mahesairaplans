import { create } from 'zustand';
import { supabase } from './lib/supabase';
import { useAuthStore } from './authStore';
import { useWeddingStore } from './store';
import { useToastStore } from './toastStore';
import { useCollaborationStore } from './collaborationStore';

type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

interface SyncState {
  status: SyncStatus;
  lastSync: Date | null;
  lastSyncTimestamp: string | null;
  isAutoSyncEnabled: boolean;
  isSyncing: boolean;
  syncToCloud: (showToast?: boolean) => Promise<boolean>;
  syncFromCloud: (showToast?: boolean) => Promise<boolean>;
  setStatus: (status: SyncStatus) => void;
  setAutoSyncEnabled: (enabled: boolean) => void;
  setIsSyncing: (syncing: boolean) => void;
  setLastSyncTimestamp: (timestamp: string | null) => void;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  status: 'synced',
  lastSync: null,
  lastSyncTimestamp: null,
  isAutoSyncEnabled: true,
  isSyncing: false,
  syncToCloud: async (showToast = false) => {
    const { user } = useAuthStore.getState();
    const { currentWeddingId } = useCollaborationStore.getState();
    if (!user || !currentWeddingId || !supabase) return false;
    try {
      set({ status: 'syncing', isSyncing: true });
      const { settings, budgetItems, savings, guests, vendors, tasks } = useWeddingStore.getState();
      const now = new Date().toISOString();
      const { error } = await supabase.from('wedding_data').upsert({
        id: currentWeddingId, user_id: user.id, settings, budget_items: budgetItems,
        savings, guests, vendors, tasks, updated_at: now,
      }, { onConflict: 'id' });
      if (error) throw error;
      set({ status: 'synced', lastSync: new Date(), lastSyncTimestamp: now, isSyncing: false });
      if (showToast) useToastStore.getState().addToast('Data berhasil disinkronkan', 'success');
      return true;
    } catch {
      set({ status: 'error', isSyncing: false });
      return false;
    }
  },
  syncFromCloud: async (showToast = false) => {
    const { user } = useAuthStore.getState();
    const { currentWeddingId } = useCollaborationStore.getState();
    if (!user || !currentWeddingId || !supabase) return false;
    try {
      set({ status: 'syncing', isSyncing: true });
      const { data, error } = await supabase.from('wedding_data').select('*').eq('id', currentWeddingId).single();
      if (error) { set({ status: 'synced', isSyncing: false }); return false; }
      if (data) {
        const { importData } = useWeddingStore.getState();
        importData({
          settings: data.settings || { weddingDate: '', currency: 'IDR' },
          budgetItems: Array.isArray(data.budget_items) ? data.budget_items : [],
          savings: Array.isArray(data.savings) ? data.savings : [],
          guests: Array.isArray(data.guests) ? data.guests : [],
          vendors: Array.isArray(data.vendors) ? data.vendors : [],
          tasks: Array.isArray(data.tasks) ? data.tasks : [],
        });
        set({ status: 'synced', lastSync: new Date(), lastSyncTimestamp: data.updated_at, isSyncing: false });
        if (showToast) useToastStore.getState().addToast('Data berhasil dimuat dari cloud', 'success');
        return true;
      }
      set({ isSyncing: false });
      return false;
    } catch {
      set({ status: 'error', isSyncing: false });
      return false;
    }
  },
  setStatus: (status) => set({ status }),
  setAutoSyncEnabled: (enabled) => set({ isAutoSyncEnabled: enabled }),
  setIsSyncing: (syncing) => set({ isSyncing: syncing }),
  setLastSyncTimestamp: (timestamp) => set({ lastSyncTimestamp: timestamp }),
}));
