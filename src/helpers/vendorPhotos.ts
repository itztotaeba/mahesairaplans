import { VendorPhoto } from '../types';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const JPEG_QUALITY = 0.8;

export async function processVendorPhotoFile(file: File): Promise<VendorPhoto> {
  // Validasi ukuran file
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Ukuran file terlalu besar. Maksimal 5MB.`);
  }

  // Validasi tipe file
  if (!file.type.startsWith('image/')) {
    throw new Error(`File harus berupa gambar.`);
  }

  // Kompres gambar
  const compressedDataUrl = await compressImage(file);

  // Buat VendorPhoto object
  const photo: VendorPhoto = {
    id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    url: compressedDataUrl,
    fileName: file.name,
    createdAt: new Date().toISOString(),
  };

  return photo;
}

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Hitung dimensi baru
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Tidak dapat membuat canvas context'));
          return;
        }

        // Draw image ke canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert ke data URL dengan kualitas JPEG
        const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Gagal memuat gambar'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsDataURL(file);
  });
}

export function deleteVendorPhotoFromStorage(photo: VendorPhoto): void {
  // Untuk saat ini, foto disimpan sebagai base64 di localStorage
  // Tidak perlu menghapus dari storage terpisah
  // Fungsi ini disediakan untuk kompatibilitas dengan kode yang memanggilnya
  console.log('Photo deleted from state:', photo.id);
}

export function validateVendorPhotoFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `Ukuran file terlalu besar. Maksimal 5MB.` };
  }

  if (!file.type.startsWith('image/')) {
    return { valid: false, error: `File harus berupa gambar.` };
  }

  return { valid: true };
}

export const MAX_VENDOR_PHOTOS = 5;
