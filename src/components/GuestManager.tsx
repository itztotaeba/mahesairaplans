import { useState } from 'react';
import { useWeddingStore } from '../store';
import { Plus, Trash2, Users } from 'lucide-react';
import { useToastStore } from '../toastStore';

export default function GuestManager() {
  const { guests, addGuest, updateGuest, deleteGuest } = useWeddingStore();
  const { addToast } = useToastStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Keluarga' | 'Teman' | 'Rekan Kerja' | 'Lainnya'>('Keluarga');
  const [pax, setPax] = useState('1');
  const [rsvpStatus, setRsvpStatus] = useState<'Belum Respon' | 'Hadir' | 'Tidak Hadir'>('Belum Respon');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { addToast('Nama tamu wajib diisi', 'error'); return; }
    addGuest({ name: name.trim(), category, pax: parseInt(pax) || 1, rsvpStatus });
    addToast('Tamu ditambahkan', 'success');
    setName(''); setPax('1'); setShowForm(false);
  };

  const totalPax = guests.reduce((s, g) => s + g.pax, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h2 className="font-heading text-2xl font-bold text-gray-800">Manajemen Tamu</h2><p className="text-sm text-gray-500 mt-1">Kelola daftar tamu undangan</p></div>
        {!showForm && <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-medium"><Plus size={16} />Tambah</button>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-[#E8E0D4]"><p className="text-xs text-gray-500">Total Tamu</p><p className="text-xl font-bold">{guests.length}</p></div>
        <div className="bg-white rounded-xl p-4 border border-[#E8E0D4]"><p className="text-xs text-gray-500">Total Pax</p><p className="text-xl font-bold">{totalPax}</p></div>
        <div className="bg-white rounded-xl p-4 border border-[#E8E0D4]"><p className="text-xs text-gray-500">Hadir</p><p className="text-xl font-bold text-emerald-600">{guests.filter(g => g.rsvpStatus === 'Hadir').length}</p></div>
        <div className="bg-white rounded-xl p-4 border border-[#E8E0D4]"><p className="text-xs text-gray-500">Belum Respon</p><p className="text-xl font-bold text-amber-600">{guests.filter(g => g.rsvpStatus === 'Belum Respon').length}</p></div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-[#E8E0D4] space-y-4">
          <h3 className="font-heading text-lg font-semibold">Tambah Tamu</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama tamu" className="px-4 py-2.5 border border-[#E8E0D4] rounded-xl outline-none" required />
            <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="px-4 py-2.5 border border-[#E8E0D4] rounded-xl outline-none">
              <option value="Keluarga">Keluarga</option><option value="Teman">Teman</option><option value="Rekan Kerja">Rekan Kerja</option><option value="Lainnya">Lainnya</option>
            </select>
            <input type="number" value={pax} onChange={(e) => setPax(e.target.value)} placeholder="Jumlah pax" min="1" className="px-4 py-2.5 border border-[#E8E0D4] rounded-xl outline-none" />
            <select value={rsvpStatus} onChange={(e) => setRsvpStatus(e.target.value as any)} className="px-4 py-2.5 border border-[#E8E0D4] rounded-xl outline-none">
              <option value="Belum Respon">Belum Respon</option><option value="Hadir">Hadir</option><option value="Tidak Hadir">Tidak Hadir</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium">Batal</button>
            <button type="submit" className="flex-1 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium">Simpan</button>
          </div>
        </form>
      )}

      {guests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#E8E0D4]">
          <Users size={28} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Belum ada tamu</p>
        </div>
      ) : (
        <div className="space-y-3">
          {guests.map((guest) => (
            <div key={guest.id} className="bg-white rounded-xl p-4 border border-[#E8E0D4] flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800">{guest.name}</h4>
                <p className="text-xs text-gray-500">{guest.category} • {guest.pax} pax • <span className={`font-medium ${guest.rsvpStatus === 'Hadir' ? 'text-emerald-600' : guest.rsvpStatus === 'Tidak Hadir' ? 'text-red-600' : 'text-amber-600'}`}>{guest.rsvpStatus}</span></p>
              </div>
              <div className="flex items-center gap-2">
                <select value={guest.rsvpStatus} onChange={(e) => updateGuest(guest.id, { rsvpStatus: e.target.value as any })} className="text-xs px-2 py-1 border rounded-lg outline-none">
                  <option value="Belum Respon">Belum Respon</option><option value="Hadir">Hadir</option><option value="Tidak Hadir">Tidak Hadir</option>
                </select>
                <button onClick={() => deleteGuest(guest.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
