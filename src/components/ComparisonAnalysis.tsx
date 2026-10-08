import { useWeddingStore } from '../store';
import { formatCurrency } from '../helpers';
import { TrendingUp, X } from 'lucide-react';

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

export default function ComparisonAnalysis({ isVisible, onClose }: Props) {
  const { settings, vendors } = useWeddingStore();

  if (!isVisible) return null;

  const totalAllIn = vendors.filter((v: any) => v.type === 'All-in').reduce((sum: number, v: any) => sum + v.dealPrice, 0);
  const totalSatuan = vendors.filter((v: any) => v.type === 'Satuan').reduce((sum: number, v: any) => sum + v.dealPrice, 0);
  const difference = Math.abs(totalAllIn - totalSatuan);
  const isAllInCheaper = totalAllIn < totalSatuan;

  return (
    <div className="bg-white rounded-2xl p-6 border border-purple-200 shadow-sm space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-semibold text-gray-800 flex items-center gap-2">
          <TrendingUp size={20} className="text-purple-500" />
          Analisis Perbandingan
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <p className="text-xs text-purple-600 uppercase font-medium">Total All-in</p>
          <p className="text-xl font-bold text-purple-800 mt-1">{formatCurrency(totalAllIn, settings.currency)}</p>
          <p className="text-xs text-purple-500 mt-1">{vendors.filter((v: any) => v.type === 'All-in').length} vendor</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-xs text-blue-600 uppercase font-medium">Total Satuan</p>
          <p className="text-xl font-bold text-blue-800 mt-1">{formatCurrency(totalSatuan, settings.currency)}</p>
          <p className="text-xs text-blue-500 mt-1">{vendors.filter((v: any) => v.type === 'Satuan').length} vendor</p>
        </div>
      </div>

      {totalAllIn > 0 && totalSatuan > 0 && (
        <div className={`rounded-xl p-4 border-2 ${isAllInCheaper ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200'}`}>
          <p className="text-sm font-medium text-gray-700 mb-1">
            {isAllInCheaper ? '🎉 All-in Lebih Hemat!' : '🎉 Satuan Lebih Hemat!'}
          </p>
          <p className="text-2xl font-bold text-gray-800">Selisih: {formatCurrency(difference, settings.currency)}</p>
        </div>
      )}

      {totalAllIn === 0 && totalSatuan === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          Belum ada data vendor. Silakan tambahkan vendor terlebih dahulu.
        </p>
      )}
    </div>
  );
}
