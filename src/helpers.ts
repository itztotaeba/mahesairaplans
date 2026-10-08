export const formatCurrency = (amount: number, currency: string = 'IDR'): string => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const calculateRemainingMonths = (weddingDate: string): number => {
  if (!weddingDate) return 0;
  const today = new Date();
  const wedding = new Date(weddingDate);
  const diffTime = wedding.getTime() - today.getTime();
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  return diffMonths > 0 ? diffMonths : 0;
};

export const calculateTotalBudget = (budgetItems: any[]): number => budgetItems.reduce((total: number, item: any) => total + item.estimatedCost, 0);
export const calculateTotalActual = (budgetItems: any[]): number => budgetItems.reduce((total: number, item: any) => total + item.actualCost, 0);
export const calculateTotalSavings = (savings: any[]): number => savings.reduce((total: number, entry: any) => total + entry.amount, 0);
export const calculateFundingGap = (totalBudget: number, totalSavings: number): number => Math.max(0, totalBudget - totalSavings);
export const calculateMonthlyTarget = (fundingGap: number, remainingMonths: number): number => remainingMonths <= 0 ? fundingGap : Math.ceil(fundingGap / remainingMonths);
export const calculateProgressPercentage = (totalSavings: number, totalBudget: number): number => totalBudget === 0 ? 0 : Math.min(100, Math.round((totalSavings / totalBudget) * 100));
