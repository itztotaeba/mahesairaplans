import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Heart, Maximize2 } from 'lucide-react';

interface VendorPhotoCarouselProps {
  photos: string[];
  vendorName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function VendorPhotoCarousel({ photos, vendorName, isOpen, onClose }: VendorPhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    if (isOpen) setCurrentIndex(0);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') {
        if (isFullscreen) setIsFullscreen(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, isFullscreen]);

  if (!isOpen || photos.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
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
      if (diff > 0) handleNext();
      else handlePrev();
    }
  };

  const toggleLike = (index: number) => {
    setLiked(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // Instagram-style carousel view
  const carouselView = (
    <div className={`${isFullscreen ? 'fixed inset-0 z-[100] bg-black' : 'relative'}`}>
      {/* Header - Instagram style */}
      <div className={`${isFullscreen ? 'absolute top-0 left-0 right-0 z-10' : ''} flex items-center justify-between px-4 py-3 ${isFullscreen ? 'bg-gradient-to-b from-black/60 to-transparent' : 'bg-white border-b border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#87A878] to-[#2F6A43] flex items-center justify-center">
            <span className="text-white text-xs font-bold">{vendorName.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className={`text-sm font-semibold ${isFullscreen ? 'text-white' : 'text-gray-800'}`}>{vendorName}</p>
            <p className={`text-xs ${isFullscreen ? 'text-white/70' : 'text-gray-500'}`}>Foto {currentIndex + 1} dari {photos.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isFullscreen && (
            <button onClick={() => setIsFullscreen(true)} className={`p-2 rounded-lg ${isFullscreen ? 'text-white' : 'hover:bg-gray-100'}`}>
              <Maximize2 size={18} className={isFullscreen ? 'text-white' : 'text-gray-600'} />
            </button>
          )}
          <button onClick={() => { setIsFullscreen(false); onClose(); }} className={`p-2 rounded-lg ${isFullscreen ? 'text-white hover:bg-white/10' : 'hover:bg-gray-100'}`}>
            <X size={20} className={isFullscreen ? 'text-white' : 'text-gray-600'} />
          </button>
        </div>
      </div>

      {/* Main Image Area */}
      <div
        className={`${isFullscreen ? 'h-screen' : 'aspect-square max-h-[500px]'} relative overflow-hidden bg-gray-900 flex items-center justify-center`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={photos[currentIndex]}
          alt={`${vendorName} - Foto ${currentIndex + 1}`}
          className="w-full h-full object-contain"
          draggable={false}
        />

        {/* Navigation Arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
            >
              <ChevronLeft size={20} className="text-gray-800" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
            >
              <ChevronRight size={20} className="text-gray-800" />
            </button>
          </>
        )}

        {/* Instagram-style dots indicator */}
        {photos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {photos.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-[#2F6A43] scale-110' : 'bg-white/50'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Action Bar - Instagram style */}
      {!isFullscreen && (
        <div className="bg-white border-t border-gray-100 px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => toggleLike(currentIndex)}
              className="transition-transform active:scale-125"
            >
              <Heart
                size={24}
                className={`transition-colors ${liked[currentIndex] ? 'text-red-500 fill-red-500' : 'text-gray-700 hover:text-gray-900'}`}
              />
            </button>
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-800">{vendorName}</span>
                {' '}Contoh foto vendor
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Thumbnail Strip */}
      {!isFullscreen && photos.length > 1 && (
        <div className="bg-white border-t border-gray-100 px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {photos.map((photo, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  idx === currentIndex ? 'border-[#2F6A43] scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={photo} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return carouselView;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl">
        {carouselView}
      </div>
    </div>
  );
}
