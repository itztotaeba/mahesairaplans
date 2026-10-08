import { useState } from 'react';
import { useWeddingStore } from '../store';
import { formatCurrency } from '../helpers';
import { Plus, Trash2, Receipt } from 'lucide-react';
import { useToastStore } from '../toastStore';

export default function BudgetManager() {
  const { settings, budgetItems, addBudgetItem, deleteBudgetItem } = useWeddingStore();
  const { addToast } = useToastStore();
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('');
  const [itemName, setItemName] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [actualCost, setActualCost] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !itemName || !estimatedCost) { addToast('Semua field wajib diisi', 'error'); return; }
    addBudgetItem({ category, itemName, estimatedCost: parseInt(estimatedCost), actualCost: parseInt(actualCost) || 0 });
    addToast('Item anggaran ditambahkan', 'success');
    setCategory(''); setItemName(''); setEstimatedCost(''); setActualCost(''); setShowForm(false);
  };

  const totalBudget = budgetItems.reduce((s, i) => s + i.estimatedCost, 0);
  const totalActual = budgetItems.reduce((s, i) => s + i.actualCost, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h2 className="font-heading text-2xl font-bold text-gray-800">Manajemen Anggaran</h2><p className="text-sm text-gray-500 mt-1">Kelola anggaran pernikahan</p></div>
        {!showForm && <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#87A878] to-[#6B8A5E] text-white rounded-xl text-sm font-medium"><Plus size={16} />Tambah</button>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-[#E8E0D4]"><p className="text-xs text-gray-500 uppercase">Total Anggaran</p><p className="text-xl font-bold text-gray-800">{formatCurrency(totalBudget, settings.currency)}</p></div>
        <div className="bg-white rounded-xl p-5 border border-[#E8E0D4]"><p className="text-xs text-gray-500 uppercase">Total Realisasi</p><p className="text-xl font-bold text-gray-800">{formatCurrency(totalActual, settings.currency)}</p></div>
        <div className="bg-white rounded-xl p-5 border border-[#E8E0D4]"><p className="text-xs text-gray-500 uppercase">Sisa</p><p className={`text-xl font-bold ${totalBudget - totalActual >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(totalBudget - totalActual, settings.currency)}</p></div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-[#E8E0D4] space-y-4">
          <h3 className="font-heading text-lg font-semibold text-gray-800">Tambah Item Anggaran</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Kategori" className="px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 outline-none" />
            <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Nama item" className="px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 outline-none" />
            <input type="number" value={estimatedCost} onChange={(e) => setEstimatedCost(e.target.value)} placeholder="Estimasi biaya" className="px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 outline-none" />
            <input type="number" value={actualCost} onChange={(e) => setActualCost(e.target.value)} placeholder="Biaya aktual" className="px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 outline-none" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium">Batal</button>
            <button type="submit" className="flex-1 px-5 py-2.5 bg-gradient-to-r from-[#87A878] to-[#6B8A5E] text-white rounded-xl font-medium">Simpan</button>
          </div>
        </form>
      )}

      {budgetItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#E8E0D4]">
          <Receipt size={28} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Belum ada item anggaran</p>
        </div>
      ) : (
        <div className="space-y-3">
          {budgetItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-4 border border-[#E8E0D4] flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800">{item.itemName}</h4>
                <p className="text-xs text-gray-500">{item.category} • <span className={`font-medium ${item.status === 'Lunas' ? 'text-emerald-600' : item.status === 'DP' ? 'text-amber-600' : 'text-red-600'}`}>{item.status}</span></p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right"><p className="text-sm font-semibold">{formatCurrency(item.estimatedCost, settings.currency)}</p><p className="text-xs text-gray-500">{formatCurrency(item.actualCost, settings.currency)}</p></div>
                <button onClick={() => deleteBudgetItem(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
