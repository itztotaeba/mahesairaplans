import { useState } from 'react';
import { useWeddingStore } from '../store';
import { useToastStore } from '../toastStore';
import { Settings as SettingsIcon, Calendar, DollarSign } from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings, resetData } = useWeddingStore();
  const { addToast } = useToastStore();
  const [weddingDate, setWeddingDate] = useState(settings.weddingDate);

  const handleSave = () => {
    updateSettings({ weddingDate });
    addToast('Pengaturan disimpan', 'success');
  };

  const handleReset = () => {
    if (window.confirm('Yakin ingin reset semua data? Tindakan ini tidak bisa dibatalkan.')) {
      resetData();
      addToast('Semua data berhasil direset', 'success');
    }
  };

  return (
    <div className="space-y-6">
      <div><h2 className="font-heading text-2xl font-bold text-gray-800">Pengaturan</h2><p className="text-sm text-gray-500 mt-1">Konfigurasi aplikasi</p></div>

      <div className="bg-white rounded-2xl p-6 border border-[#E8E0D4] space-y-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#2F6A43]/10 rounded-xl flex items-center justify-center"><SettingsIcon size={20} className="text-[#2F6A43]" /></div>
          <h3 className="font-heading text-lg font-semibold text-gray-800">Pengaturan Umum</h3>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2"><Calendar size={16} />Tanggal Pernikahan</label>
          <input type="date" value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)} className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl outline-none focus:ring-2 focus:ring-[#87A878]/30" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2"><DollarSign size={16} />Mata Uang</label>
          <select value={settings.currency} onChange={(e) => updateSettings({ currency: e.target.value })} className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl outline-none">
            <option value="IDR">IDR - Rupiah</option><option value="USD">USD - Dollar</option>
          </select>
        </div>
        <button onClick={handleSave} className="w-full px-5 py-2.5 bg-gradient-to-r from-[#2F6A43] to-[#1E4A2E] text-white rounded-xl font-medium">Simpan Pengaturan</button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-red-200">
        <h3 className="font-heading text-lg font-semibold text-red-700 mb-2">⚠️ Zona Berbahaya</h3>
        <p className="text-sm text-gray-500 mb-4">Reset semua data ke kondisi awal. Tindakan ini tidak bisa dibatalkan.</p>
        <button onClick={handleReset} className="px-5 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600">Reset Semua Data</button>
      </div>
    </div>
  );
}
