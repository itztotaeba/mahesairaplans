import { useWeddingStore } from '../store';
import { calculateTotalBudget, calculateTotalSavings, calculateFundingGap, calculateMonthlyTarget, calculateProgressPercentage, calculateRemainingMonths, formatCurrency, formatRemainingTime, calculateTotalActual } from '../helpers';
import { Calendar, TrendingUp, Wallet, Target, Users, Clock } from 'lucide-react';

export default function Dashboard() {
  const { settings, budgetItems, savings, guests, vendors, tasks } = useWeddingStore();
  const safeSettings = settings || { weddingDate: '', currency: 'IDR' };
  const totalBudget = calculateTotalBudget(budgetItems);
  const totalActual = calculateTotalActual(budgetItems);
  const totalSavings = calculateTotalSavings(savings);
  const fundingGap = calculateFundingGap(totalBudget, totalSavings);
  const remainingMonths = calculateRemainingMonths(safeSettings.weddingDate);
  const monthlyTarget = calculateMonthlyTarget(fundingGap, remainingMonths);
  const progress = calculateProgressPercentage(totalSavings, totalBudget);
  const totalGuests = guests.reduce((sum, g) => sum + (g.pax || 0), 0);
  const completedTasks = tasks.filter(t => t.isCompleted).length;

  const formattedDate = safeSettings.weddingDate
    ? new Date(safeSettings.weddingDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-8 border border-[#D6E5DC] text-center">
        <h2 className="font-heading text-2xl font-bold text-gray-800">💒 Rangkuman Wedding Plan</h2>
        <p className="text-sm text-gray-500 mt-2">Pantau progress perencanaan pernikahan Anda</p>
      </div>

      {safeSettings.weddingDate && (
        <div className="bg-gradient-to-br from-[#D4A843] via-[#E0BC6A] to-[#2F6A43] rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Clock size={24} /><h3 className="font-heading text-xl font-bold">Countdown</h3></div>
            <p className="text-2xl font-bold">{formatRemainingTime(safeSettings.weddingDate)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-sm opacity-90 mb-1">Tanggal Pernikahan:</p>
            <p className="text-lg font-semibold">{formattedDate}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-[#D6E5DC]">
          <div className="flex items-start justify-between">
            <div><p className="text-xs text-gray-500 uppercase tracking-wider">Total Anggaran</p><p className="text-xl font-bold text-gray-800 mt-1">{formatCurrency(totalBudget, safeSettings.currency)}</p></div>
            <div className="w-10 h-10 bg-[#2F6A43]/10 rounded-xl flex items-center justify-center"><Wallet size={20} className="text-[#2F6A43]" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#E8E0D4]">
          <div className="flex items-start justify-between">
            <div><p className="text-xs text-gray-500 uppercase tracking-wider">Total Realisasi</p><p className="text-xl font-bold text-gray-800 mt-1">{formatCurrency(totalActual, safeSettings.currency)}</p></div>
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"><TrendingUp size={20} className="text-orange-500" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#E8E0D4]">
          <div className="flex items-start justify-between">
            <div><p className="text-xs text-gray-500 uppercase tracking-wider">Total Tabungan</p><p className="text-xl font-bold text-gray-800 mt-1">{formatCurrency(totalSavings, safeSettings.currency)}</p></div>
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><Target size={20} className="text-emerald-500" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#D6E5DC]">
          <div className="flex items-start justify-between">
            <div><p className="text-xs text-gray-500 uppercase tracking-wider">Kekurangan Dana</p><p className={`text-xl font-bold mt-1 ${fundingGap > 0 ? 'text-[#D4A843]' : 'text-emerald-600'}`}>{formatCurrency(fundingGap, safeSettings.currency)}</p></div>
            <div className="w-10 h-10 bg-[#D4A843]/10 rounded-xl flex items-center justify-center"><span className="text-lg">{fundingGap > 0 ? '⚠️' : '✅'}</span></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#D6E5DC]">
          <div className="flex items-start justify-between">
            <div><p className="text-xs text-gray-500 uppercase tracking-wider">Target/Bulan</p><p className="text-xl font-bold text-gray-800 mt-1">{monthlyTarget > 0 ? formatCurrency(monthlyTarget, safeSettings.currency) : <span className="text-sm font-normal text-gray-400">-</span>}</p></div>
            <div className="w-10 h-10 bg-[#D4A843]/10 rounded-xl flex items-center justify-center"><Calendar size={20} className="text-[#D4A843]" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#E8E0D4]">
          <div className="flex items-start justify-between">
            <div><p className="text-xs text-gray-500 uppercase tracking-wider">Total Tamu</p><p className="text-xl font-bold text-gray-800 mt-1">{totalGuests} <span className="text-sm font-normal text-gray-500">pax</span></p></div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Users size={20} className="text-blue-500" /></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-[#D6E5DC]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-semibold text-gray-800">Progress Tabungan</h3>
          <span className="text-2xl font-bold text-[#2F6A43]">{progress}%</span>
        </div>
        <div className="w-full bg-[#F3EFE6] rounded-full h-4 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-[#2F6A43] to-[#4A9B65] transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#2F6A43]" /><span className="text-gray-600">Terkumpul: {formatCurrency(totalSavings, safeSettings.currency)}</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#F3EFE6] border border-gray-200" /><span className="text-gray-600">Sisa: {formatCurrency(fundingGap, safeSettings.currency)}</span></div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-[#E8E0D4]">
        <h3 className="font-heading text-lg font-semibold text-gray-800 mb-4">Ringkasan Tugas</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-2"><span className="text-gray-600">Selesai</span><span className="font-bold">{completedTasks}/{tasks.length}</span></div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#87A878] to-[#A8C49A] transition-all" style={{ width: `${tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0}%` }} />
            </div>
          </div>
          <div className="text-center"><p className="text-3xl font-bold text-[#2F6A43]">{vendors.length}</p><p className="text-xs text-gray-500">Vendor</p></div>
        </div>
      </div>
    </div>
  );
}
