import { Task } from '../types';

export const defaultTasks: Omit<Task, 'id' | 'isCompleted' | 'completedAt'>[] = [
  { title: 'Tentukan tanggal pernikahan', category: 'Administrasi', monthsBefore: 12, isDefault: true, assignee: 'Bersama' },
  { title: 'Buat anggaran awal', category: 'Administrasi', monthsBefore: 12, isDefault: true, assignee: 'Bersama' },
  { title: 'Booking venue/gedung', category: 'Vendor', monthsBefore: 12, isDefault: true, assignee: 'Bersama' },
  { title: 'Tentukan konsep pernikahan', category: 'Dekorasi', monthsBefore: 12, isDefault: true, assignee: 'Bersama' },
  { title: 'Booking WO atau paket All-in', category: 'Vendor', monthsBefore: 9, isDefault: true, assignee: 'Bersama' },
  { title: 'Booking MUA', category: 'Pakaian', monthsBefore: 9, isDefault: true, assignee: 'Wanita' },
  { title: 'Booking fotografer & videografer', category: 'Vendor', monthsBefore: 9, isDefault: true, assignee: 'Bersama' },
  { title: 'Buat daftar tamu awal', category: 'Administrasi', monthsBefore: 9, isDefault: true, assignee: 'Bersama' },
  { title: 'Pilih gaun pengantin', category: 'Pakaian', monthsBefore: 6, isDefault: true, assignee: 'Wanita' },
  { title: 'Pilih jas pengantin', category: 'Pakaian', monthsBefore: 6, isDefault: true, assignee: 'Pria' },
  { title: 'Booking dekorasi & bunga', category: 'Dekorasi', monthsBefore: 6, isDefault: true, assignee: 'Bersama' },
  { title: 'Booking entertainment', category: 'Vendor', monthsBefore: 6, isDefault: true, assignee: 'Bersama' },
  { title: 'Desain & cetak undangan', category: 'Undangan', monthsBefore: 3, isDefault: true, assignee: 'Bersama' },
  { title: 'Pilih cincin pernikahan', category: 'Administrasi', monthsBefore: 3, isDefault: true, assignee: 'Pria' },
  { title: 'Booking katering', category: 'Vendor', monthsBefore: 3, isDefault: true, assignee: 'Bersama' },
  { title: 'Sebar undangan', category: 'Undangan', monthsBefore: 1, isDefault: true, assignee: 'Bersama' },
  { title: 'Meeting teknis dengan vendor', category: 'Vendor', monthsBefore: 1, isDefault: true, assignee: 'Bersama' },
  { title: 'Konfirmasi kehadiran tamu', category: 'Undangan', monthsBefore: 0, isDefault: true, assignee: 'Bersama' },
  { title: 'Gladi bersih', category: 'Lainnya', monthsBefore: 0, isDefault: true, assignee: 'Bersama' },
];
