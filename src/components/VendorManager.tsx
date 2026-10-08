import { useState, useRef } from 'react';
import { useWeddingStore } from '../store';
import { Vendor, VendorPhoto } from '../types';
import { formatCurrency } from '../helpers';
import { Plus, Pencil, Trash2, Building2, Calendar, X, Upload, ChevronLeft, ChevronRight, Heart, Maximize2 } from 'lucide-react';

const VENDOR_CATEGORIES: Vendor['category'][] = ['WO', 'Katering', 'Venue', 'MUA', 'Fotografi', 'Dekorasi', 'Entertainment', 'Busana', 'MC', 'Undangan & Souvenir', 'Lainnya'];
const CONTRACT_STATUSES: Vendor['contractStatus'][] = ['Belum Kontrak', 'Sudah DP', 'Lunas'];

export default function VendorManager() {
  const { settings, vendors, addVendor, updateVendor, deleteVendor } = useWeddingStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingVendor, setViewingVendor] = useState<Vendor | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [likedPhotos, setLikedPhotos] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<Vendor['type']>('Satuan');
  const [category, setCategory] = useState<Vendor['category']>('Katering');
  const [contactWA, setContactWA] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [dealPrice, setDealPrice] = useState('');
  const [dpAmount, setDpAmount] = useState('');
  const [dueDateDP, setDueDateDP] = useState('');
  const [dueDateFinal, setDueDateFinal] = useState('');
  const [contractStatus, setContractStatus] = useState<Vendor['contractStatus']>('Belum Kontrak');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState('');
  const [review, setReview] = useState('');
  const [photos, setPhotos] = useState<VendorPhoto[]>([]);

  const resetForm = () => {
    setName(''); setType('Satuan'); setCategory('Katering'); setContactWA('');
    setEmail(''); setAddress(''); setDealPrice(''); setDpAmount('');
    setDueDateDP(''); setDueDateFinal(''); setContractStatus('Belum Kontrak');
    setNotes(''); setRating(''); setReview(''); setPhotos([]);
    setEditingId(null); setShowForm(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 5 - photos.length;
    if (remainingSlots <= 0) {
      alert('Maksimal 5 foto yang dapat diupload');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    const newPhotos: VendorPhoto[] = [];

    filesToProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 2 * 1024 * 1024) {
        alert(`File ${file.name} terlalu besar. Maksimal 2MB per foto.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        newPhotos.push({
          id: Math.random().toString(36).substr(2, 9),
          url: reader.result as string,
          createdAt: new Date().toISOString(),
        });
        if (newPhotos.length === filesToProcess.length) {
          setPhotos((prev) => [...prev, ...newPhotos].slice(0, 5));
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contactWA.trim() || !dealPrice) {
      alert('Nama vendor, kontak WhatsApp, dan harga deal wajib diisi');
      return;
    }

    const vendorData = {
      name: name.trim(),
      type,
      category: type === 'All-in' ? 'WO' as const : category,
      contactWA: contactWA.trim(),
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      dealPrice: parseInt(dealPrice),
      dpAmount: parseInt(dpAmount) || 0,
      dueDateDP: dueDateDP || undefined,
      dueDateFinal: dueDateFinal || undefined,
      contractStatus,
      notes: notes.trim() || undefined,
      rating: rating ? parseInt(rating) : undefined,
      review: review.trim() || undefined,
      photos: photos.length > 0 ? photos : undefined,
    };

    if (editingId) {
      updateVendor(editingId, vendorData);
    } else {
      addVendor(vendorData);
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
    setPhotos(vendor.photos || []);
    setEditingId(vendor.id); setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string, vendorName: string) => {
    if (window.confirm(`Hapus vendor "${vendorName}"?`)) {
      deleteVendor(id);
    }
  };

  const handleViewDetail = (vendor: Vendor) => {
    setViewingVendor(vendor);
    setCurrentPhotoIndex(0);
  };

  const nextPhoto = () => {
    const vendorPhotos = viewingVendor?.photos;
    if (vendorPhotos && vendorPhotos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev + 1) % vendorPhotos.length);
    }
  };

  const prevPhoto = () => {
    const vendorPhotos = viewingVendor?.photos;
    if (vendorPhotos && vendorPhotos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev - 1 + vendorPhotos.length) % vendorPhotos.length);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextPhoto();
      else prevPhoto();
    }
  };

  const toggleLike = (photoId: string) => {
    setLikedPhotos((prev) => ({ ...prev, [photoId]: !prev[photoId] }));
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'Lunas': return 'bg-green-100 text-green-700 border-green-200';
      case 'Sudah DP': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Manajemen Vendor</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola vendor pernikahan Anda</p>
        </div>
        {!showForm && (
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium">
            <Plus size={16} />Tambah Vendor
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><Building2 size={20} className="text-purple-500" /></div>
            <div><p className="text-xs text-gray-500 uppercase tracking-wider">Total All-in</p><p className="text-xl font-bold text-gray-800">{formatCurrency(vendors.filter((v: Vendor) => v.type === 'All-in').reduce((sum: number, v: Vendor) => sum + v.dealPrice, 0), settings.currency)}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Building2 size={20} className="text-blue-500" /></div>
            <div><p className="text-xs text-gray-500 uppercase tracking-wider">Total Satuan</p><p className="text-xl font-bold text-gray-800">{formatCurrency(vendors.filter((v: Vendor) => v.type === 'Satuan').reduce((sum: number, v: Vendor) => sum + v.dealPrice, 0), settings.currency)}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><span className="text-lg">📊</span></div>
            <div><p className="text-xs text-gray-500 uppercase tracking-wider">Total Vendor</p><p className="text-xl font-bold text-gray-800">{vendors.length}</p></div>
          </div>
        </div>
      </div>

      {/* Vendor Detail Modal - Instagram Style */}
      {viewingVendor && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${isFullscreen ? 'bg-black' : 'bg-black/50 backdrop-blur-sm'} p-0 sm:p-4`}>
          <div className={`${isFullscreen ? 'w-full h-full' : 'w-full max-w-2xl max-h-[90vh]'} bg-white sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col`}>
            {/* Header - Instagram Style */}
            <div className={`${isFullscreen ? 'absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent' : 'border-b border-gray-200'} px-4 py-3 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{viewingVendor.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className={`text-sm font-semibold ${isFullscreen ? 'text-white' : 'text-gray-800'}`}>{viewingVendor.name}</p>
                  {viewingVendor.photos && viewingVendor.photos.length > 0 && (
                    <p className={`text-xs ${isFullscreen ? 'text-white/70' : 'text-gray-500'}`}>Foto {currentPhotoIndex + 1} dari {viewingVendor.photos.length}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isFullscreen && (
                  <button onClick={() => setIsFullscreen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <Maximize2 size={18} className="text-gray-600" />
                  </button>
                )}
                <button onClick={() => { setViewingVendor(null); setIsFullscreen(false); }}
                  className={`p-2 rounded-lg ${isFullscreen ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                  <X size={20} className={isFullscreen ? 'text-white' : 'text-gray-500'} />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Photo Carousel - Instagram Style */}
              {viewingVendor.photos && viewingVendor.photos.length > 0 && (
                <div className="relative">
                  <div className={`relative ${isFullscreen ? 'h-[calc(100vh-120px)]' : 'aspect-square max-h-[500px]'} bg-gray-900 flex items-center justify-center`}
                    onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                    <img src={viewingVendor.photos[currentPhotoIndex].url}
                      alt={`Photo ${currentPhotoIndex + 1}`}
                      className="w-full h-full object-contain" draggable={false} />

                    {/* Navigation Arrows */}
                    {viewingVendor.photos.length > 1 && (
                      <>
                        <button onClick={prevPhoto}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all">
                          <ChevronLeft size={20} className="text-gray-800" />
                        </button>
                        <button onClick={nextPhoto}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all">
                          <ChevronRight size={20} className="text-gray-800" />
                        </button>
                      </>
                    )}

                    {/* Instagram-style dots indicator */}
                    {viewingVendor.photos.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {viewingVendor.photos.map((_, idx) => (
                          <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === currentPhotoIndex ? 'bg-white scale-110' : 'bg-white/50'}`} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Bar - Instagram style */}
                  <div className="bg-white border-t border-gray-100 px-4 py-3">
                    <div className="flex items-center gap-4">
                      <button onClick={() => toggleLike(viewingVendor.photos![currentPhotoIndex].id)}
                        className="transition-transform active:scale-125">
                        <Heart size={24}
                          className={`transition-colors ${likedPhotos[viewingVendor.photos![currentPhotoIndex].id] ? 'text-red-500 fill-red-500' : 'text-gray-700 hover:text-gray-900'}`} />
                      </button>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold text-gray-800">{viewingVendor.name}</span>
                          {' '}Contoh foto vendor
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail Strip */}
                  {viewingVendor.photos.length > 1 && (
                    <div className="bg-white border-t border-gray-100 px-4 py-3">
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {viewingVendor.photos.map((photo, idx) => (
                          <button key={photo.id} onClick={() => setCurrentPhotoIndex(idx)}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${idx === currentPhotoIndex ? 'border-pink-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                            <img src={photo.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Vendor Info */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium border ${viewingVendor.type === 'All-in' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                    {viewingVendor.type}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">{viewingVendor.category}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium border ${statusBadge(viewingVendor.contractStatus)}`}>{viewingVendor.contractStatus}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-gray-500 uppercase tracking-wider">Harga Deal</p><p className="text-lg font-bold text-gray-800">{formatCurrency(viewingVendor.dealPrice, settings.currency)}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase tracking-wider">DP</p><p className="text-lg font-bold text-gray-800">{formatCurrency(viewingVendor.dpAmount, settings.currency)}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase tracking-wider">Sisa</p><p className="text-lg font-bold text-pink-600">{formatCurrency(viewingVendor.remainingBalance, settings.currency)}</p></div>
                  {viewingVendor.rating && (
                    <div><p className="text-xs text-gray-500 uppercase tracking-wider">Rating</p><p className="text-lg font-bold text-gray-800">{'⭐'.repeat(viewingVendor.rating)}</p></div>
                  )}
                </div>

                {viewingVendor.contactWA && (<div><p className="text-xs text-gray-500 uppercase tracking-wider">WhatsApp</p><p className="text-sm text-gray-800">{viewingVendor.contactWA}</p></div>)}
                {viewingVendor.email && (<div><p className="text-xs text-gray-500 uppercase tracking-wider">Email</p><p className="text-sm text-gray-800">{viewingVendor.email}</p></div>)}
                {viewingVendor.address && (<div><p className="text-xs text-gray-500 uppercase tracking-wider">Alamat</p><p className="text-sm text-gray-800">{viewingVendor.address}</p></div>)}
                {viewingVendor.dueDateFinal && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={16} /><span>Jatuh tempo: {new Date(viewingVendor.dueDateFinal).toLocaleDateString('id-ID')}</span>
                  </div>
                )}
                {viewingVendor.notes && (
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <p className="text-sm font-medium text-yellow-800 mb-1">📝 Catatan:</p>
                    <p className="text-sm text-yellow-700">{viewingVendor.notes}</p>
                  </div>
                )}
                {viewingVendor.review && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-sm font-medium text-gray-800 mb-1">💬 Review:</p>
                    <p className="text-sm text-gray-600 italic">"{viewingVendor.review}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vendor List */}
      {vendors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 font-medium">Belum ada vendor</p>
          <p className="text-sm text-gray-400 mt-1">Mulai tambahkan vendor untuk pernikahan Anda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map((vendor) => {
            const progress = vendor.dealPrice > 0 ? (vendor.dpAmount / vendor.dealPrice) * 100 : 0;
            return (
              <div key={vendor.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                {/* Photo Preview */}
                {vendor.photos && vendor.photos.length > 0 && (
                  <div className="relative h-40 bg-gray-100 cursor-pointer" onClick={() => handleViewDetail(vendor)}>
                    <img src={vendor.photos[0].url} alt={vendor.name} className="w-full h-full object-cover" />
                    {vendor.photos.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span>📷 {vendor.photos.length}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{vendor.name}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${vendor.type === 'All-in' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>{vendor.type}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">{vendor.category}</span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${statusBadge(vendor.contractStatus)}`}>{vendor.contractStatus}</span>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Progress Pembayaran</span><span>{progress.toFixed(0)}%</span></div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Harga Deal:</span><span className="font-semibold text-gray-800">{formatCurrency(vendor.dealPrice, settings.currency)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">DP:</span><span className="font-medium text-gray-700">{formatCurrency(vendor.dpAmount, settings.currency)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Sisa:</span><span className="font-medium text-pink-600">{formatCurrency(vendor.remainingBalance, settings.currency)}</span></div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button onClick={() => handleViewDetail(vendor)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium">
                      Detail
                    </button>
                    <button onClick={() => handleEdit(vendor)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                      <Pencil size={12} />Edit
                    </button>
                    <button onClick={() => handleDelete(vendor.id, vendor.name)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium">
                      <Trash2 size={12} />Hapus
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800">{editingId ? '✏️ Edit Vendor' : '✨ Tambah Vendor Baru'}</h3>
            <button type="button" onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} className="text-gray-500" /></button>
          </div>

          {/* Photo Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📸 Foto Vendor <span className="text-xs text-gray-400">(maksimal 5 foto, contoh hasil kerja/vendor)</span>
            </label>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="grid grid-cols-5 gap-2 mb-3">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative aspect-square group">
                    <img src={photo.url} alt="Vendor" className="w-full h-full object-cover rounded-lg border-2 border-gray-200" />
                    <button type="button" onClick={() => handleRemovePhoto(photo.id)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {photos.length < 5 && (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-pink-500 hover:bg-pink-50 transition-all">
                    <Upload size={20} className="text-gray-400" />
                    <span className="text-xs text-gray-500">Upload</span>
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
              <p className="text-xs text-gray-500">
                {photos.length}/5 foto terupload • Format: JPG, PNG • Maks 2MB per foto
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Nama Vendor *</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama vendor..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label><select value={category} onChange={(e) => setCategory(e.target.value as Vendor['category'])} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none">{VENDOR_CATEGORIES.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Tipe Vendor</label><div className="flex gap-2">{(['All-in', 'Satuan'] as const).map((t) => (<button key={t} type="button" onClick={() => setType(t)} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${type === t ? t === 'All-in' ? 'bg-purple-100 text-purple-700 border-purple-300' : 'bg-blue-100 text-blue-700 border-blue-300' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>{t}</button>))}</div></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp *</label><input type="tel" value={contactWA} onChange={(e) => setContactWA(e.target.value)} placeholder="08xxxxxxxxxx" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@vendor.com" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none" /></div>
            <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label><textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Alamat vendor..." rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none resize-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Harga Deal *</label><input type="number" value={dealPrice} onChange={(e) => setDealPrice(e.target.value)} placeholder="0" min="0" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">DP</label><input type="number" value={dpAmount} onChange={(e) => setDpAmount(e.target.value)} placeholder="0" min="0" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Jatuh Tempo DP</label><input type="date" value={dueDateDP} onChange={(e) => setDueDateDP(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Jatuh Tempo Pelunasan</label><input type="date" value={dueDateFinal} onChange={(e) => setDueDateFinal(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none" /></div>
            <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Status Kontrak</label><div className="flex gap-2 flex-wrap">{CONTRACT_STATUSES.map((status) => (<button key={status} type="button" onClick={() => setContractStatus(status)} className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${contractStatus === status ? statusBadge(status) + ' border-current' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>{status}</button>))}</div></div>
            <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Catatan</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan tambahan..." rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none resize-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Rating (1-5)</label><input type="number" value={rating} onChange={(e) => setRating(e.target.value)} placeholder="1-5" min="1" max="5" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Review</label><input type="text" value={review} onChange={(e) => setReview(e.target.value)} placeholder="Review singkat..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none" /></div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={resetForm} className="flex-1 px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium">Batal</button>
            <button type="submit" className="flex-1 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium">{editingId ? 'Update' : 'Simpan'}</button>
          </div>
        </form>
      )}
    </div>
  );
}
