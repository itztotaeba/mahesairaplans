import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useSyncStore } from '../syncStore';
import { useToastStore } from '../toastStore';

export function useRealtimeSync(weddingId: string | null, enabled: boolean = true) {
  const { syncFromCloud } = useSyncStore();
  const { addToast } = useToastStore();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!weddingId || !enabled || !supabase) return;
    const channel = supabase.channel(`wedding-room-${weddingId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'wedding_data', filter: `id=eq.${weddingId}` },
        async () => {
          try {
            const success = await syncFromCloud(false);
            if (success) addToast('Data diperbarui oleh pasangan Anda', 'info');
          } catch {}
        }
      ).subscribe();
    channelRef.current = channel;
    return () => { if (channelRef.current && supabase) { supabase.removeChannel(channelRef.current); channelRef.current = null; } };
  }, [weddingId, enabled, syncFromCloud, addToast]);

  return { isConnected: channelRef.current !== null };
}
