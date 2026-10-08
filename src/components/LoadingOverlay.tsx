import { useSyncStore } from '../syncStore';

export default function LoadingOverlay() {
  const { isSyncing } = useSyncStore();
  if (!isSyncing) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[90] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-[#D6E5DC] flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-[#2F6A43] border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-medium text-gray-600">Menyinkronkan...</span>
    </div>
  );
}
