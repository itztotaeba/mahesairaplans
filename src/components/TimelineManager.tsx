import { useState } from 'react';
import { useWeddingStore } from '../store';
import { Plus, Trash2, ListTodo, CheckSquare, Square } from 'lucide-react';
import { useToastStore } from '../toastStore';

export default function TimelineManager() {
  const { tasks, toggleTask, deleteTask, addTask } = useWeddingStore();
  const { addToast } = useToastStore();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Administrasi' | 'Vendor' | 'Pakaian' | 'Dekorasi' | 'Undangan' | 'Lainnya'>('Administrasi');
  const [monthsBefore, setMonthsBefore] = useState('3');
  const [assignee, setAssignee] = useState<'Pria' | 'Wanita' | 'Bersama'>('Bersama');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { addToast('Judul tugas wajib diisi', 'error'); return; }
    addTask({ title: title.trim(), category, monthsBefore: parseInt(monthsBefore) || 0, isDefault: false, assignee });
    addToast('Tugas ditambahkan', 'success');
    setTitle(''); setShowForm(false);
  };

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h2 className="font-heading text-2xl font-bold text-gray-800">Timeline & Tugas</h2><p className="text-sm text-gray-500 mt-1">Kelola checklist pernikahan</p></div>
        {!showForm && <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl text-sm font-medium"><Plus size={16} />Tambah</button>}
      </div>

      <div className="bg-white rounded-xl p-5 border border-[#E8E0D4]">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-600">Progress</span>
          <span className="text-sm font-bold text-[#2F6A43]">{completedCount}/{tasks.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#87A878] to-[#A8C49A] transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-[#E8E0D4] space-y-4">
          <h3 className="font-heading text-lg font-semibold">Tambah Tugas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul tugas" className="px-4 py-2.5 border border-[#E8E0D4] rounded-xl outline-none" required />
            <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="px-4 py-2.5 border border-[#E8E0D4] rounded-xl outline-none">
              <option value="Administrasi">Administrasi</option><option value="Vendor">Vendor</option><option value="Pakaian">Pakaian</option><option value="Dekorasi">Dekorasi</option><option value="Undangan">Undangan</option><option value="Lainnya">Lainnya</option>
            </select>
            <input type="number" value={monthsBefore} onChange={(e) => setMonthsBefore(e.target.value)} placeholder="Bulan sebelum" className="px-4 py-2.5 border border-[#E8E0D4] rounded-xl outline-none" />
            <select value={assignee} onChange={(e) => setAssignee(e.target.value as any)} className="px-4 py-2.5 border border-[#E8E0D4] rounded-xl outline-none">
              <option value="Bersama">Bersama</option><option value="Pria">Pria</option><option value="Wanita">Wanita</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium">Batal</button>
            <button type="submit" className="flex-1 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-medium">Simpan</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className={`bg-white rounded-xl p-4 border transition-all ${task.isCompleted ? 'border-emerald-200 bg-emerald-50/50' : 'border-[#E8E0D4]'}`}>
            <div className="flex items-start gap-3">
              <button onClick={() => toggleTask(task.id)} className="flex-shrink-0 mt-0.5">
                {task.isCompleted ? <CheckSquare size={20} className="text-emerald-600" /> : <Square size={20} className="text-gray-400" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{task.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">{task.category}</span>
                  <span className="text-xs px-2 py-0.5 bg-purple-100 rounded-full text-purple-700">{task.assignee}</span>
                  <span className="text-xs text-gray-400">H-{task.monthsBefore} bulan</span>
                </div>
              </div>
              {!task.isDefault && (
                <button onClick={() => deleteTask(task.id)} className="p-1 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
