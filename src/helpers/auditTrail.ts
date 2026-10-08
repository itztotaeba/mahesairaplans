import { useAuthStore } from '../authStore';

export function getAuditMetadata(): { updatedBy: string; updatedAt: string } {
  const user = useAuthStore.getState().user;
  let username = 'Sistem';
  if (user?.email) {
    username = user.email.split('@')[0];
  }
  return { updatedBy: username, updatedAt: new Date().toISOString() };
}
