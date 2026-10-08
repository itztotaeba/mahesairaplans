export const formatAuditInfo = (updatedBy?: string, updatedAt?: string): string => {
  if (!updatedBy && !updatedAt) return 'Belum pernah diubah';
  if (!updatedAt) return `✏️ ${updatedBy || 'Sistem'}`;
  
  const date = new Date(updatedAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  let timeAgo: string;
  if (diffMins < 1) timeAgo = 'Baru saja';
  else if (diffMins < 60) timeAgo = `${diffMins} menit lalu`;
  else if (diffHours < 24) timeAgo = `${diffHours} jam lalu`;
  else timeAgo = `${diffDays} hari lalu`;

  return `✏️ ${updatedBy || 'Sistem'} • ${timeAgo}`;
};
