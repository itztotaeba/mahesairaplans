import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateItemStatus, generateId, getDefaultSettings } from './helpers';
import { getAuditMetadata } from './helpers/auditTrail';
import { AppState } from './types';
import { defaultTasks } from './data/defaultTasks';

export type {
  WeddingSettings, BudgetItem, SavingsEntry, Guest, Vendor, VendorType,
  VendorCategory, ContractStatus, CustomChecklistItem, Task, TaskCategory, TaskAssignee, AppState
} from './types';

const initialState = {
  settings: getDefaultSettings(),
  budgetItems: [],
  savings: [],
  guests: [],
  vendors: [],
  tasks: defaultTasks.map(task => ({ ...task, id: generateId(), isCompleted: false })),
};

export const useWeddingStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,
      updateSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      addBudgetItem: (item) => set((state) => {
        const audit = getAuditMetadata();
        return { budgetItems: [...state.budgetItems, { ...item, id: generateId(), status: calculateItemStatus(item.estimatedCost, item.actualCost), ...audit }] };
      }),
      updateBudgetItem: (id, updates) => set((state) => {
        const audit = getAuditMetadata();
        return { budgetItems: state.budgetItems.map((item) => { if (item.id !== id) return item; const updated = { ...item, ...updates, ...audit }; updated.status = calculateItemStatus(updated.estimatedCost, updated.actualCost); return updated; }) };
      }),
      deleteBudgetItem: (id) => set((state) => ({ budgetItems: state.budgetItems.filter((item) => item.id !== id) })),
      addSavings: (entry) => set((state) => { const audit = getAuditMetadata(); return { savings: [...state.savings, { ...entry, id: generateId(), ...audit }] }; }),
      deleteSavings: (id) => set((state) => ({ savings: state.savings.filter((e) => e.id !== id) })),
      addGuest: (guest) => set((state) => { const audit = getAuditMetadata(); return { guests: [...state.guests, { ...guest, id: generateId(), ...audit }] }; }),
      updateGuest: (id, updates) => set((state) => { const audit = getAuditMetadata(); return { guests: state.guests.map((g) => g.id === id ? { ...g, ...updates, ...audit } : g) }; }),
      deleteGuest: (id) => set((state) => ({ guests: state.guests.filter((g) => g.id !== id) })),
      addVendor: (vendor) => set((state) => {
        const audit = getAuditMetadata();
        return { vendors: [...state.vendors, { ...vendor, id: generateId(), remainingBalance: vendor.dealPrice - vendor.dpAmount, createdAt: new Date().toISOString(), ...audit }] };
      }),
      updateVendor: (id, updates) => set((state) => {
        const audit = getAuditMetadata();
        return { vendors: state.vendors.map((v) => { if (v.id !== id) return v; const updated = { ...v, ...updates, ...audit }; updated.remainingBalance = updated.dealPrice - updated.dpAmount; return updated; }) };
      }),
      deleteVendor: (id) => set((state) => ({ vendors: state.vendors.filter((v) => v.id !== id) })),
      addTask: (task) => set((state) => { const audit = getAuditMetadata(); return { tasks: [...state.tasks, { ...task, id: generateId(), isCompleted: false, ...audit }] }; }),
      toggleTask: (id) => set((state) => { const audit = getAuditMetadata(); return { tasks: state.tasks.map((t) => { if (t.id !== id) return t; return { ...t, isCompleted: !t.isCompleted, completedAt: !t.isCompleted ? new Date().toISOString() : undefined, ...audit }; }) }; }),
      deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
      resetData: () => set({ ...initialState }),
      importData: (data) => {
        try {
          set({
            settings: data.settings || { weddingDate: '', currency: 'IDR' },
            budgetItems: Array.isArray(data.budgetItems) ? data.budgetItems : [],
            savings: Array.isArray(data.savings) ? data.savings : [],
            guests: Array.isArray(data.guests) ? data.guests : [],
            vendors: Array.isArray(data.vendors) ? data.vendors : [],
            tasks: Array.isArray(data.tasks) ? data.tasks : [],
          });
        } catch { set({ ...initialState }); }
      },
    }),
    {
      name: 'weddingplan-storage',
      partialize: (state) => ({ settings: state.settings, budgetItems: state.budgetItems, savings: state.savings, guests: state.guests, vendors: state.vendors, tasks: state.tasks }),
      onRehydrateStorage: () => (state, error) => {
        if (error) { try { localStorage.removeItem('weddingplan-storage'); } catch {} }
      },
    }
  )
);
