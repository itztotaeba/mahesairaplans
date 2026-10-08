import { BudgetItem, SavingsEntry, WeddingSettings } from './types';

export function calculateRemainingMonths(weddingDate: string): number {
  if (!weddingDate || weddingDate.trim() === '') return 0;
  const wedding = new Date(weddingDate).getTime();
  if (isNaN(wedding)) return 0;
  const today = new Date().getTime();
  const diffMs = wedding - today;
  if (diffMs <= 0) return 0;
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30)));
}

export function calculateTotalBudget(budgetItems: BudgetItem[]): number {
  return budgetItems.reduce((total, item) => total + item.estimatedCost, 0);
}

export function calculateTotalActual(budgetItems: BudgetItem[]): number {
  return budgetItems.reduce((total, item) => total + item.actualCost, 0);
}

export function calculateTotalSavings(savings: SavingsEntry[]): number {
  return savings.reduce((total, entry) => total + entry.amount, 0);
}

export function calculateFundingGap(totalBudget: number, totalSavings: number): number {
  return Math.max(0, totalBudget - totalSavings);
}

export function calculateMonthlyTarget(fundingGap: number, remainingMonths: number): number {
  if (isNaN(fundingGap) || isNaN(remainingMonths)) return 0;
  if (remainingMonths <= 0) return fundingGap > 0 ? fundingGap : 0;
  const target = Math.ceil(fundingGap / remainingMonths);
  return isNaN(target) || !isFinite(target) ? 0 : target;
}

export function calculateProgressPercentage(totalSavings: number, totalBudget: number): number {
  if (isNaN(totalSavings) || isNaN(totalBudget)) return 0;
  if (totalBudget === 0) return 0;
  const percentage = (totalSavings / totalBudget) * 100;
  return isNaN(percentage) || !isFinite(percentage) ? 0 : Math.min(100, Math.round(percentage * 100) / 100);
}

export function calculateItemStatus(estimatedCost: number, actualCost: number): 'Belum' | 'DP' | 'Lunas' {
  if (actualCost >= estimatedCost && estimatedCost > 0) return 'Lunas';
  if (actualCost > 0 && actualCost < estimatedCost) return 'DP';
  return 'Belum';
}

export function formatCurrency(amount: number, currency: string = 'IDR'): string {
  if (amount === undefined || amount === null || isNaN(amount) || !isFinite(amount)) amount = 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0,
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
  if (months === 0) return `${days} hari lagi`;
  if (remainingDays === 0) return `${months} bulan lagi`;
  return `${months} bulan ${remainingDays} hari lagi`;
}

export function getDefaultSettings(): WeddingSettings {
  return { weddingDate: '', currency: 'IDR' };
}

export function calculateEmergencyBuffer(totalBudget: number, percentage: number = 15) {
  if (isNaN(totalBudget) || totalBudget < 0) return { bufferAmount: 0, percentage, totalWithBuffer: 0 };
  const bufferAmount = totalBudget * (percentage / 100);
  return { bufferAmount, percentage, totalWithBuffer: totalBudget + bufferAmount };
}
