import { useState, useRef } from 'react';
import { useWeddingStore, Vendor, VendorType, VendorCategory, ContractStatus, CustomChecklistItem } from '../store';
import { formatCurrency } from '../helpers';
import { formatAuditInfo } from '../helpers/timeAgo';
import { getChecklistForCategory, getDefaultChecklistValues, countCheckedItems, migrateChecklistFormat, ChecklistValue } from '../helpers/vendorChecklist';
import { useToastStore } from '../toastStore';
import ComparisonAnalysis from './ComparisonAnalysis';
import VendorPhotoCarousel from './VendorPhotoCarousel';
import {
  Plus, Pencil, Trash2, Building2, Calendar, DollarSign, Star, X,
  CheckSquare, Square, ListChecks, Camera, Image as ImageIcon, TrendingUp, Eye
} from 'lucide-react';

const VENDOR_CATEGORIES: VendorCategory[] = ['WO', 'Katering', 'Venue', 'MUA', 'Fotografi', 'Dekorasi', 'Entertainment', 'Busana', 'MC', 'Undangan & Souvenir', 'Lainnya'];
const CONTRACT_STATUSES: ContractStatus[] = ['Belum Kontrak', 'Sudah DP', 'Lunas'];
const MAX_PHOTOS = 5;

export default function VendorManager() {
  const { settings, vendors, addVendor, updateVendor, deleteVendor } = useWeddingStore();
  const { addToast } = useToastStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showForm, setShowForm] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'Semua' | VendorType>('Semua');

  // Detail view state
  const [showDetail, setShowDetail] = useState(false);
  const [detailVendor, setDetailVendor] = useState<Vendor | null>(null);
  const [showCarousel, setShowCarousel] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<VendorType>('Satuan');
  const [category, setCategory] = useState<VendorCategory>('Katering');
  const [contactWA, setContactWA] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [dealPrice, setDealPrice] = useState('');
  const [dpAmount, setDpAmount] = useState('');
  const [dueDateDP, setDueDateDP] = useState('');
  const [dueDateFinal, setDueDateFinal] = useState('');
  const [contractStatus, setContractStatus] = useState<ContractStatus>('Belum Kontrak');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState('');
  const [review, setReview] = useState('');
  const [checklist, setChecklist] = useState<Record<string, ChecklistValue>>({});
  const [customChecklist, setCustomChecklist] = useState<CustomChecklistItem[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);

  const resetForm = () => {
    setName(''); setType('Satuan'); setCategory('Katering'); setContactWA('');
    setEmail(''); setAddress(''); setDealPrice(''); setDpAmount('');
    setDueDateDP(''); setDueDateFinal(''); setContractStatus('Belum Kontrak');
    setNotes(''); setRating(''); setReview(''); setChecklist({});
    setCustomChecklist([]); setPhotos([]); setEditingId(null); setShowForm(false);
  };

  // Photo upload handler - converts to base64
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = MAX_PHOTOS - photos.length;
    if (remainingSlots <= 0) {
      addToast(`Maksimal ${MAX_PHOTOS} foto`, 'warning');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        addToast('Hanya file gambar yang diperbolehkan', 'error');
        return;
      }

      // Validate file size (max 2MB per photo)
      if (file.size > 2 * 1024 * 1024) {
        addToast('Ukuran foto maksimal 2MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setPhotos(prev => {
          if (prev.length >= MAX_PHOTOS) {
            addToast(`Maksimal ${MAX_PHOTOS} foto`, 'warning');
            return prev;
          }
          return [...prev, base64];
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { addToast('Nama vendor wajib diisi', 'error'); return; }
    if (!contactWA.trim()) { addToast('Kontak WhatsApp wajib diisi', 'error'); return; }
    if (!dealPrice || parseInt(dealPrice) <= 0) { addToast('Harga deal wajib diisi', 'error'); return; }

    const vendorData = {
      name: name.trim(), type, category: type === 'All-in' ? 'WO' : category,
      contactWA: contactWA.trim(), email: email.trim() || undefined,
      address: address.trim() || undefined, dealPrice: parseInt(dealPrice),
      dpAmount: parseInt(dpAmount) || 0, dueDateDP: dueDateDP || undefined,
      dueDateFinal: dueDateFinal || undefined, contractStatus,
      notes: notes.trim() || undefined, rating: rating ? parseInt(rating) : undefined,
      review: review.trim() || undefined,
      checklist: Object.keys(checklist).length > 0 ? checklist : undefined,
      customChecklist: customChecklist.length > 0 ? customChecklist : undefined,
      photos: photos.length > 0 ? photos : undefined,
    };

    if (editingId) {
      updateVendor(editingId, vendorData);
      addToast('Vendor berhasil diupdate', 'success');
    } else {
      addVendor(vendorData);
      addToast('Vendor berhasil ditambahkan', 'success');
    }
    resetForm();
  };

  const handleEdit = (vendor: Vendor) => {
    setName(vendor.name); setType(vendor.type); setCategory(vendor.category);
    setContactWA(vendor.contactWA); setEmail(vendor.email || ''); setAddress(vendor.address || '');
    setDealPrice(vendor.dealPrice.toString()); setDpAmount(vendor.dpAmount.toString());
    setDueDateDP(vendor.dueDateDP || ''); setDueDateFinal(vendor.dueDateFinal || '');
    setContractStatus(vendor.contractStatus); setNotes(vendor.notes || '');
    setRating(vendor.rating?.toString() || ''); setReview(vendor.review || '');
    setChecklist(migrateChecklistFormat(vendor.checklist, vendor.category));
    setCustomChecklist(vendor.customChecklist || []);
    setPhotos(vendor.photos || []);
    setEditingId(vendor.id); setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string, vendorName: string) => {
    if (window.confirm(`Hapus vendor "${vendorName}"?`)) {
      deleteVendor(id);
      addToast('Vendor berhasil dihapus', 'success');
    }
  };

  const handleViewDetail = (vendor: Vendor) => {
    setDetailVendor(vendor);
    setShowDetail(true);
  };

  const handleToggleChecklist = (itemId: string) => {
    setChecklist(prev => ({ ...prev, [itemId]: { checked: !prev[itemId]?.checked, notes: prev[itemId]?.notes || '' } }));
  };

  const handleChangeChecklistNote = (itemId: string, notes: string) => {
    setChecklist(prev => ({ ...prev, [itemId]: { checked: prev[itemId]?.checked || false, notes } }));
  };

  const handleCategoryChange = (newCategory: VendorCategory) => {
    setCategory(newCategory);
    setChecklist(getDefaultChecklistValues(newCategory));
  };

  const filteredVendors = filterType === 'Semua' ? vendors : vendors.filter(v => v.type === filterType);
  const totalAllIn = vendors.filter(v => v.type === 'All-in').reduce((sum, v) => sum + v.dealPrice, 0);
  const totalSatuan = vendors.filter(v => v.type === 'Satuan').reduce((sum, v) => sum + v.dealPrice, 0);

  const statusBadge = (status: ContractStatus) => {
    switch (status) {
      case 'Lunas': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Sudah DP': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  const typeBadge = (type: VendorType) => {
    return type === 'All-in' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gray-800">Manajemen Vendor</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola vendor pernikahan Anda</p>
        </div>
        <div className="flex gap-2">
          {!showComparison && (
            <button onClick={() => setShowComparison(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl text-sm font-medium">
              <TrendingUp size={16} />Analisis
            </button>
          )}
          {!showForm && (
            <button onClick={() => { resetForm(); setChecklist(getDefaultChecklistValues('Katering')); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#B76E79] to-[#9A5560] text-white rounded-xl text-sm font-medium">
              <Plus size={16} />Tambah Vendor
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-[#E8E0D4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><Building2 size={20} className="text-purple-500" /></div>
            <div><p className="text-xs text-gray-500 uppercase">Total All-in</p><p className="text-xl font-bold text-gray-800">{formatCurrency(totalAllIn, settings.currency)}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#E8E0D4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Building2 size={20} className="text-blue-500" /></div>
            <div><p className="text-xs text-gray-500 uppercase">Total Satuan</p><p className="text-xl font-bold text-gray-800">{formatCurrency(totalSatuan, settings.currency)}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#E8E0D4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#87A878]/10 rounded-xl flex items-center justify-center"><span className="text-lg">📊</span></div>
            <div><p className="text-xs text-gray-500 uppercase">Total Vendor</p><p className="text-xl font-bold text-gray-800">{vendors.length}</p></div>
          </div>
        </div>
      </div>

      <ComparisonAnalysis isVisible={showComparison} onClose={() => setShowComparison(false)} />

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['Semua', 'All-in', 'Satuan'] as const).map((t) => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${filterType === t ? 'border-[#87A878] bg-[#87A878]/10 text-[#6B8A5E]' : 'border-[#E8E0D4] bg-white text-gray-600'}`}>
            {t}{t !== 'Semua' && <span className="ml-2 text-xs">({vendors.filter(v => v.type === t).length})</span>}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-[#E8E0D4] shadow-sm space-y-5 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-heading text-lg font-semibold text-gray-800">{editingId ? '✏️ Edit Vendor' : '✨ Tambah Vendor Baru'}</h3>
            <button type="button" onClick={resetForm} className="p-2 hover:bg-[#F5F0E8] rounded-lg"><X size={20} className="text-gray-500" /></button>
          </div>

          {/* === PHOTO UPLOAD SECTION === */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Camera size={16} className="text-[#B76E79]" />
              Foto Vendor <span className="text-xs text-gray-400">(maksimal {MAX_PHOTOS} foto)</span>
            </label>
            <div className="bg-[#FDFBF7] rounded-xl p-4 border border-[#E8E0D4]">
              {/* Photo Grid Preview */}
              <div className="grid grid-cols-5 gap-2 mb-3">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-[#E8E0D4] group">
                    <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-center text-[10px] py-0.5">
                      Foto {index + 1}
                    </div>
                  </div>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-[#87A878]/50 flex flex-col items-center justify-center hover:border-[#87A878] hover:bg-[#87A878]/5 transition-all"
                  >
                    <Plus size={20} className="text-[#87A878]" />
                    <span className="text-[10px] text-[#87A878] mt-1">Tambah</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <p className="text-xs text-gray-500">
                📸 Upload contoh foto vendor (hasil kerja, portofolio, dll). Format: JPG, PNG. Maks 2MB per foto.
                {photos.length > 0 && <span className="ml-2 text-[#87A878] font-medium">{photos.length}/{MAX_PHOTOS} foto</span>}
              </p>
            </div>
          </div>

          {/* Nama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Vendor <span className="text-red-500">*</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama vendor..."
              className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]" required />
          </div>

          {/* Tipe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipe Vendor</label>
            <div className="flex gap-2">
              {(['All-in', 'Satuan'] as const).map((t) => (
                <button key={t} type="button" onClick={() => { setType(t); if (t === 'All-in') setCategory('WO'); }}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${type === t ? typeBadge(t) + ' border-current' : 'border-[#E8E0D4] bg-white text-gray-500'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
            <select value={category} onChange={(e) => handleCategoryChange(e.target.value as VendorCategory)} disabled={type === 'All-in'}
              className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7] disabled:bg-gray-100">
              {VENDOR_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {/* Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700"><ListChecks size={16} className="inline mr-2" />Checklist Detail</label>
              <span className="text-xs text-gray-500">{countCheckedItems(checklist)} dari {getChecklistForCategory(category).length} item</span>
            </div>
            <div className="bg-[#FDFBF7] rounded-xl p-4 border border-[#E8E0D4] space-y-2 max-h-60 overflow-y-auto">
              {getChecklistForCategory(category).map((item) => {
                const isChecked = checklist[item.id]?.checked || false;
                return (
                  <div key={item.id} className="flex items-start gap-3 p-2 hover:bg-white rounded-lg">
                    <button type="button" onClick={() => handleToggleChecklist(item.id)} className="flex-shrink-0 mt-0.5">
                      {isChecked ? <CheckSquare size={20} className="text-[#87A878]" /> : <Square size={20} className="text-gray-400" />}
                    </button>
                    <div className="flex-1">
                      <p className={`text-sm ${isChecked ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>{item.question}</p>
                      <input type="text" value={checklist[item.id]?.notes || ''} onChange={(e) => handleChangeChecklistNote(item.id, e.target.value)}
                        placeholder="Catatan..." className="w-full mt-1 text-xs px-3 py-1.5 border-l-2 border-gray-300 rounded-r-lg bg-gray-50 outline-none focus:border-[#87A878]" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kontak */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp <span className="text-red-500">*</span></label>
              <input type="tel" value={contactWA} onChange={(e) => setContactWA(e.target.value)} placeholder="08xxxxxxxxxx"
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl outline-none bg-[#FDFBF7]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@vendor.com"
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl outline-none bg-[#FDFBF7]" />
            </div>
          </div>

          {/* Alamat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Alamat vendor..." rows={2}
              className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl outline-none bg-[#FDFBF7] resize-none" />
          </div>

          {/* Harga */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Harga Deal <span className="text-red-500">*</span></label>
              <input type="number" value={dealPrice} onChange={(e) => setDealPrice(e.target.value)} placeholder="0" min="0"
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl outline-none bg-[#FDFBF7]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">DP</label>
              <input type="number" value={dpAmount} onChange={(e) => setDpAmount(e.target.value)} placeholder="0" min="0"
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl outline-none bg-[#FDFBF7]" />
            </div>
          </div>

          {/* Jatuh Tempo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Jatuh Tempo DP</label>
              <input type="date" value={dueDateDP} onChange={(e) => setDueDateDP(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl outline-none bg-[#FDFBF7]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Jatuh Tempo Pelunasan</label>
              <input type="date" value={dueDateFinal} onChange={(e) => setDueDateFinal(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl outline-none bg-[#FDFBF7]" />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status Kontrak</label>
            <div className="flex gap-2 flex-wrap">
              {CONTRACT_STATUSES.map((status) => (
                <button key={status} type="button" onClick={() => setContractStatus(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${contractStatus === status ? statusBadge(status) + ' border-current' : 'border-[#E8E0D4] bg-white text-gray-500'}`}>
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan tambahan..." rows={2}
              className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl outline-none bg-[#FDFBF7] resize-none" />
          </div>

          {/* Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Rating (1-5)</label>
              <input type="number" value={rating} onChange={(e) => setRating(e.target.value)} placeholder="1-5" min="1" max="5"
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl outline-none bg-[#FDFBF7]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Review</label>
              <input type="text" value={review} onChange={(e) => setReview(e.target.value)} placeholder="Review singkat..."
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl outline-none bg-[#FDFBF7]" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={resetForm} className="flex-1 px-5 py-2.5 bg-[#F5F0E8] text-gray-600 rounded-xl font-medium">Batal</button>
            <button type="submit" className="flex-1 px-5 py-2.5 bg-gradient-to-r from-[#87A878] to-[#6B8A5E] text-white rounded-xl font-medium">{editingId ? 'Update' : 'Simpan'}</button>
          </div>
        </form>
      )}

      {/* === VENDOR DETAIL MODAL === */}
      {showDetail && detailVendor && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDetail(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
              <h3 className="font-heading text-lg font-bold text-gray-800">{detailVendor.name}</h3>
              <button onClick={() => setShowDetail(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-500" /></button>
            </div>

            <div className="p-5 space-y-5">
              {/* Photo Carousel - Instagram Style */}
              {detailVendor.photos && detailVendor.photos.length > 0 && (
                <div>
                  <div className="relative rounded-xl overflow-hidden bg-gray-100 cursor-pointer group" onClick={() => setShowCarousel(true)}>
                    <img src={detailVendor.photos[0]} alt={detailVendor.name} className="w-full aspect-square object-cover" />
                    {detailVendor.photos.length > 1 && (
                      <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <ImageIcon size={12} />
                        <span>{detailVendor.photos.length}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                      <Eye size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  {/* Mini thumbnail strip */}
                  {detailVendor.photos.length > 1 && (
                    <div className="flex gap-1.5 mt-2">
                      {detailVendor.photos.map((photo, idx) => (
                        <div key={idx} className={`w-12 h-12 rounded-lg overflow-hidden border-2 ${idx === 0 ? 'border-[#2F6A43]' : 'border-transparent'}`}>
                          <img src={photo} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Info */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${typeBadge(detailVendor.type)}`}>{detailVendor.type}</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">{detailVendor.category}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${statusBadge(detailVendor.contractStatus)}`}>{detailVendor.contractStatus}</span>
              </div>

              {/* Financial Info */}
              <div className="bg-[#FDFBF7] rounded-xl p-4 border border-[#E8E0D4] space-y-3">
                <div className="flex justify-between"><span className="text-sm text-gray-500">Harga Deal:</span><span className="font-bold text-gray-800">{formatCurrency(detailVendor.dealPrice, settings.currency)}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">DP:</span><span className="font-medium text-gray-700">{formatCurrency(detailVendor.dpAmount, settings.currency)}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">Sisa:</span><span className="font-medium text-[#B76E79]">{formatCurrency(detailVendor.remainingBalance, settings.currency)}</span></div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#87A878] to-[#A8C49A]" style={{ width: `${detailVendor.dealPrice > 0 ? (detailVendor.dpAmount / detailVendor.dealPrice) * 100 : 0}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">{detailVendor.dealPrice > 0 ? ((detailVendor.dpAmount / detailVendor.dealPrice) * 100).toFixed(0) : 0}% terbayar</p>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm"><span className="text-gray-500">📱 WhatsApp:</span><span className="font-medium">{detailVendor.contactWA}</span></div>
                {detailVendor.email && <div className="flex items-center gap-2 text-sm"><span className="text-gray-500">📧 Email:</span><span className="font-medium">{detailVendor.email}</span></div>}
                {detailVendor.address && <div className="flex items-center gap-2 text-sm"><span className="text-gray-500">📍 Alamat:</span><span className="font-medium">{detailVendor.address}</span></div>}
                {detailVendor.dueDateDP && <div className="flex items-center gap-2 text-sm"><span className="text-gray-500"><Calendar size={14} className="inline" /> Jatuh Tempo DP:</span><span className="font-medium">{new Date(detailVendor.dueDateDP).toLocaleDateString('id-ID')}</span></div>}
                {detailVendor.dueDateFinal && <div className="flex items-center gap-2 text-sm"><span className="text-gray-500"><Calendar size={14} className="inline" /> Jatuh Tempo Pelunasan:</span><span className="font-medium">{new Date(detailVendor.dueDateFinal).toLocaleDateString('id-ID')}</span></div>}
              </div>

              {/* Rating */}
              {detailVendor.rating && (
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={18} className={star <= detailVendor.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                  ))}
                  {detailVendor.review && <span className="text-sm text-gray-600 ml-2">"{detailVendor.review}"</span>}
                </div>
              )}

              {/* Notes */}
              {detailVendor.notes && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <p className="text-sm font-medium text-amber-800 mb-1">📝 Catatan:</p>
                  <p className="text-sm text-amber-700">{detailVendor.notes}</p>
                </div>
              )}

              {/* Checklist Summary */}
              {detailVendor.checklist && countCheckedItems(detailVendor.checklist) > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><ListChecks size={16} className="text-[#87A878]" />Checklist ({countCheckedItems(detailVendor.checklist)} item)</h4>
                  <div className="space-y-1">
                    {getChecklistForCategory(detailVendor.category)
                      .filter(item => detailVendor.checklist?.[item.id]?.checked)
                      .map(item => (
                        <div key={item.id} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckSquare size={14} className="text-[#87A878] flex-shrink-0" />
                          <span>{item.question}</span>
                          {detailVendor.checklist?.[item.id]?.notes && (
                            <span className="text-xs text-gray-400 italic">• {detailVendor.checklist[item.id].notes}</span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Audit Info */}
              <p className="text-xs text-gray-500 text-right">{formatAuditInfo(detailVendor.updatedBy, detailVendor.updatedAt)}</p>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowDetail(false); handleEdit(detailVendor); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100">
                  <Pencil size={16} />Edit
                </button>
                <button onClick={() => { setShowDetail(false); handleDelete(detailVendor.id, detailVendor.name); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100">
                  <Trash2 size={16} />Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Carousel Modal */}
      {detailVendor && detailVendor.photos && (
        <VendorPhotoCarousel
          photos={detailVendor.photos}
          vendorName={detailVendor.name}
          isOpen={showCarousel}
          onClose={() => setShowCarousel(false)}
        />
      )}

      {/* Vendor Cards */}
      {filteredVendors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#E8E0D4]">
          <div className="w-16 h-16 bg-[#F5F0E8] rounded-2xl flex items-center justify-center mx-auto mb-4"><Building2 size={28} className="text-gray-400" /></div>
          <p className="text-gray-500 font-medium">Belum ada vendor</p>
          <p className="text-sm text-gray-400 mt-1">Mulai tambahkan vendor untuk pernikahan Anda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendors.map((vendor) => {
            const progress = vendor.dealPrice > 0 ? (vendor.dpAmount / vendor.dealPrice) * 100 : 0;
            return (
              <div key={vendor.id} className="bg-white rounded-xl border border-[#E8E0D4] overflow-hidden hover:shadow-md transition-shadow">
                {/* Photo Preview */}
                {vendor.photos && vendor.photos.length > 0 && (
                  <div className="relative h-40 bg-gray-100 cursor-pointer" onClick={() => handleViewDetail(vendor)}>
                    <img src={vendor.photos[0]} alt={vendor.name} className="w-full h-full object-cover" />
                    {vendor.photos.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ImageIcon size={10} /><span>{vendor.photos.length}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                )}

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{vendor.name}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${typeBadge(vendor.type)}`}>{vendor.type}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">{vendor.category}</span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${statusBadge(vendor.contractStatus)}`}>{vendor.contractStatus}</span>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Progress</span><span>{progress.toFixed(0)}%</span></div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#87A878] to-[#A8C49A] transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Harga:</span><span className="font-semibold">{formatCurrency(vendor.dealPrice, settings.currency)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">DP:</span><span className="font-medium">{formatCurrency(vendor.dpAmount, settings.currency)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Sisa:</span><span className="font-medium text-[#B76E79]">{formatCurrency(vendor.remainingBalance, settings.currency)}</span></div>
                  </div>

                  {/* Audit */}
                  <p className="text-xs text-gray-500 text-right mt-3">{formatAuditInfo(vendor.updatedBy, vendor.updatedAt)}</p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button onClick={() => handleViewDetail(vendor)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-[#2F6A43]/10 text-[#2F6A43] rounded-lg hover:bg-[#2F6A43]/20 font-medium">
                      <Eye size={12} />Detail
                    </button>
                    <button onClick={() => handleEdit(vendor)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium">
                      <Pencil size={12} />Edit
                    </button>
                    <button onClick={() => handleDelete(vendor.id, vendor.name)}
                      className="flex items-center justify-center gap-1 px-3 py-2 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
