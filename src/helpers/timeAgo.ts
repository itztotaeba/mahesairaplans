export function formatAuditInfo(updatedBy?: string, updatedAt?: string): string {
  if (!updatedBy && !updatedAt) return '';
  
  const parts: string[] = [];
  
  if (updatedBy) {
    parts.push(`oleh ${updatedBy}`);
  }
  
  if (updatedAt) {
    const date = new Date(updatedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    let timeAgo: string;
    if (diffMins < 1) {
      timeAgo = 'baru saja';
    } else if (diffMins < 60) {
      timeAgo = `${diffMins} menit lalu`;
    } else if (diffHours < 24) {
      timeAgo = `${diffHours} jam lalu`;
    } else if (diffDays < 7) {
      timeAgo = `${diffDays} hari lalu`;
    } else {
      timeAgo = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    
    parts.push(timeAgo);
  }
  
  return parts.join(' • ');
}
