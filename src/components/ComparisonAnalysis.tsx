import { useWeddingStore } from '../store';
import { formatCurrency } from '../helpers';
import { X, TrendingUp } from 'lucide-react';

interface Props { isVisible: boolean; onClose: () => void; }

export default function ComparisonAnalysis({ isVisible, onClose }: Props) {
  const { settings, vendors } = useWeddingStore();

  if (!isVisible) return null;

  const allInVendors = vendors.filter(v => v.type === 'All-in');
  const satuanVendors = vendors.filter(v => v.type === 'Satuan');
  const totalAllIn = allInVendors.reduce((s, v) => s + v.dealPrice, 0);
  const totalSatuan = satuanVendors.reduce((s, v) => s + v.dealPrice, 0);
  const totalAll = totalAllIn + totalSatuan;

  return (
    <div className="bg-white rounded-2xl p-6 border border-purple-200 shadow-sm animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><TrendingUp size={20} className="text-purple-500" /><h3 className="font-heading text-lg font-semibold">Analisis Perbandingan</h3></div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <p className="text-xs text-purple-600 uppercase font-medium">All-in Package</p>
          <p className="text-xl font-bold text-purple-800 mt-1">{formatCurrency(totalAllIn, settings.currency)}</p>
          <p className="text-xs text-purple-500 mt-1">{allInVendors.length} vendor</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-xs text-blue-600 uppercase font-medium">Satuan</p>
          <p className="text-xl font-bold text-blue-800 mt-1">{formatCurrency(totalSatuan, settings.currency)}</p>
          <p className="text-xs text-blue-500 mt-1">{satuanVendors.length} vendor</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
          <p className="text-xs text-emerald-600 uppercase font-medium">Total Keseluruhan</p>
          <p className="text-xl font-bold text-emerald-800 mt-1">{formatCurrency(totalAll, settings.currency)}</p>
          <p className="text-xs text-emerald-500 mt-1">{vendors.length} vendor total</p>
        </div>
      </div>
    </div>
  );
}
