interface Props { isOpen: boolean; onConfirm: () => void; onCancel: () => void; }

export default function ExitConfirmModal({ isOpen, onConfirm, onCancel }: Props) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Keluar Aplikasi?</h3>
        <p className="text-sm text-gray-500 mb-6">Apakah Anda yakin ingin keluar?</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">Batal</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600">Keluar</button>
        </div>
      </div>
    </div>
  );
}
