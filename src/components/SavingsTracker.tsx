import { useState } from 'react';
import { useWeddingStore } from '../store';
import { formatCurrency, calculateTotalSavings } from '../helpers';
import { Plus, Trash2, PiggyBank } from 'lucide-react';
import { useToastStore } from '../toastStore';

export default function SavingsTracker() {
  const { settings, savings, addSavings, deleteSavings } = useWeddingStore();
  const { addToast } = useToastStore();
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseInt(amount) <= 0) { addToast('Nominal harus diisi', 'error'); return; }
    addSavings({ date, amount: parseInt(amount), source, note });
    addToast('Tabungan ditambahkan', 'success');
    setAmount(''); setSource(''); setNote(''); setShowForm(false);
  };

  const totalSavings = calculateTotalSavings(savings);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h2 className="font-heading text-2xl font-bold text-gray-800">Tracker Tabungan</h2><p className="text-sm text-gray-500 mt-1">Lacak progress menabung</p></div>
        {!showForm && <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-medium"><Plus size={16} />Tambah</button>}
      </div>

      <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white">
        <p className="text-sm opacity-80">Total Tabungan</p>
        <p className="text-3xl font-bold mt-1">{formatCurrency(totalSavings, settings.currency)}</p>
        <p className="text-sm opacity-80 mt-2">{savings.length} kali menabung</p>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-[#E8E0D4] space-y-4">
          <h3 className="font-heading text-lg font-semibold">Catat Tabungan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-4 py-2.5 border border-[#E8E0D4] rounded-xl outline-none" />
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Nominal" className="px-4 py-2.5 border border-[#E8E0D4] rounded-xl outline-none" />
            <input type="text" value={source} onChange={(e) => setSource(e.target.value)} placeholder="Sumber (gaji, bonus, dll)" className="px-4 py-2.5 border border-[#E8E0D4] rounded-xl outline-none" />
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Catatan" className="px-4 py-2.5 border border-[#E8E0D4] rounded-xl outline-none" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium">Batal</button>
            <button type="submit" className="flex-1 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium">Simpan</button>
          </div>
        </form>
      )}

      {savings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#E8E0D4]">
          <PiggyBank size={28} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Belum ada tabungan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...savings].reverse().map((entry) => (
            <div key={entry.id} className="bg-white rounded-xl p-4 border border-[#E8E0D4] flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">{formatCurrency(entry.amount, settings.currency)}</p>
                <p className="text-xs text-gray-500">{entry.source || 'Tabungan'} • {new Date(entry.date).toLocaleDateString('id-ID')}</p>
                {entry.note && <p className="text-xs text-gray-400 mt-1">{entry.note}</p>}
              </div>
              <button onClick={() => deleteSavings(entry.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
