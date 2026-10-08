import { useEffect } from 'react';
import { useAuthStore } from '../authStore';
import { useCollaborationStore } from '../collaborationStore';

export default function SupabaseSyncProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const initializeWeddingSession = useCollaborationStore((s) => s.initializeWeddingSession);

  useEffect(() => {
    if (user) {
      initializeWeddingSession();
    }
  }, [user, initializeWeddingSession]);

  return <>{children}</>;
}
