/**
 * helpers.ts
 * 
 * File ini berisi SEMUA logika perhitungan/formula terkunci.
 * Tidak boleh ada kalkulasi bisnis di dalam komponen UI.
 * User hanya mengontrol input data, sistem mengontrol perhitungan.
 */

import { BudgetItem, SavingsEntry, WeddingSettings } from './types';

// ============================================
// 1. SISA WAKTU (BULAN)
// ============================================
export function calculateRemainingMonths(weddingDate: string): number {
  if (!weddingDate || weddingDate.trim() === '') return 0;
  const wedding = new Date(weddingDate).getTime();
  if (isNaN(wedding)) return 0;
  const today = new Date().getTime();
  const diffMs = wedding - today;
  if (diffMs <= 0) return 0;
  const monthsRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30));
  if (isNaN(monthsRemaining)) return 0;
  return Math.max(0, monthsRemaining);
}

// ============================================
// 2. TOTAL ANGGARAN
// ============================================
export function calculateTotalBudget(budgetItems: BudgetItem[]): number {
  return budgetItems.reduce((total, item) => total + item.estimatedCost, 0);
}

// ============================================
// 3. TOTAL REALISASI
// ============================================
export function calculateTotalActual(budgetItems: BudgetItem[]): number {
  return budgetItems.reduce((total, item) => total + item.actualCost, 0);
}

// ============================================
// 4. TOTAL TABUNGAN
// ============================================
export function calculateTotalSavings(savings: SavingsEntry[]): number {
  return savings.reduce((total, entry) => total + entry.amount, 0);
}

// ============================================
// 5. KEKURANGAN DANA
// ============================================
export function calculateFundingGap(totalBudget: number, totalSavings: number): number {
  const gap = totalBudget - totalSavings;
  return Math.max(0, gap);
}

// ============================================
// 6. TARGET TABUNGAN BULANAN
// ============================================
export function calculateMonthlyTarget(fundingGap: number, remainingMonths: number): number {
  if (isNaN(fundingGap) || isNaN(remainingMonths)) return 0;
  if (remainingMonths <= 0) return fundingGap > 0 ? fundingGap : 0;
  const target = Math.ceil(fundingGap / remainingMonths);
  if (isNaN(target) || !isFinite(target)) return 0;
  return target;
}

// ============================================
// 7. PROGRESS PERSENTASE
// ============================================
export function calculateProgressPercentage(totalSavings: number, totalBudget: number): number {
  if (isNaN(totalSavings) || isNaN(totalBudget)) return 0;
  if (totalBudget === 0) return 0;
  const percentage = (totalSavings / totalBudget) * 100;
  if (isNaN(percentage) || !isFinite(percentage)) return 0;
  return Math.min(100, Math.round(percentage * 100) / 100);
}

// ============================================
// 8. AUTO-STATUS ITEM
// ============================================
export function calculateItemStatus(estimatedCost: number, actualCost: number): 'Belum' | 'DP' | 'Lunas' {
  if (actualCost >= estimatedCost && estimatedCost > 0) return 'Lunas';
  if (actualCost > 0 && actualCost < estimatedCost) return 'DP';
  return 'Belum';
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
export function formatCurrency(amount: number, currency: string = 'IDR'): string {
  if (amount === undefined || amount === null || isNaN(amount) || !isFinite(amount)) amount = 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatRemainingTime(weddingDate: string): string {
  if (!weddingDate || weddingDate.trim() === '') return '';
  const wedding = new Date(weddingDate).getTime();
  if (isNaN(wedding)) return '';
  const today = new Date().getTime();
  const diffMs = wedding - today;
  if (diffMs <= 0) return 'Hari H telah lewat';
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);
  const remainingDays = days % 30;
  if (isNaN(days) || isNaN(months) || isNaN(remainingDays)) return '';
  if (months === 0) return `${days} hari lagi`;
  if (remainingDays === 0) return `${months} bulan lagi`;
  return `${months} bulan ${remainingDays} hari lagi`;
}

export function getDefaultSettings(): WeddingSettings {
  return { weddingDate: '', currency: 'IDR' };
}

// ============================================
// EMERGENCY BUFFER FUNCTIONS
// ============================================
export function calculateEmergencyBuffer(
  totalBudget: number, 
  percentage: number = 15
): {
  bufferAmount: number;
  percentage: number;
  totalWithBuffer: number;
} {
  if (isNaN(totalBudget) || totalBudget < 0) {
    return { bufferAmount: 0, percentage, totalWithBuffer: 0 };
  }
  const bufferAmount = totalBudget * (percentage / 100);
  return { bufferAmount, percentage, totalWithBuffer: totalBudget + bufferAmount };
}

export function checkEmergencyBufferStatus(
  totalBudget: number, 
  totalActual: number, 
  bufferPercentage: number = 15
): {
  bufferAmount: number;
  totalWithBuffer: number;
  remainingSafe: number;
  remainingBuffer: number;
  isBufferTouched: boolean;
  bufferUsagePercentage: number;
} {
  if (isNaN(totalBudget) || isNaN(totalActual)) {
    return {
      bufferAmount: 0, totalWithBuffer: 0, remainingSafe: 0,
      remainingBuffer: 0, isBufferTouched: false, bufferUsagePercentage: 0
    };
  }
  const { bufferAmount, totalWithBuffer } = calculateEmergencyBuffer(totalBudget, bufferPercentage);
  const remainingSafe = totalBudget - totalActual;
  const remainingBuffer = totalWithBuffer - totalActual;
  const isBufferTouched = totalActual > totalBudget;
  let bufferUsagePercentage = 0;
  if (isBufferTouched && bufferAmount > 0) {
    bufferUsagePercentage = ((totalActual - totalBudget) / bufferAmount) * 100;
  }
  return {
    bufferAmount, totalWithBuffer,
    remainingSafe: Math.max(0, remainingSafe),
    remainingBuffer: Math.max(0, remainingBuffer),
    isBufferTouched,
    bufferUsagePercentage: Math.min(100, bufferUsagePercentage)
  };
}
