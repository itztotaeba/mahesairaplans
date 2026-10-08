import { VendorCategory } from '../types';

export interface ChecklistItem {
  id: string;
  question: string;
  description?: string;
}

export interface ChecklistValue {
  checked: boolean;
  notes: string;
}

export const vendorChecklists: Record<VendorCategory, ChecklistItem[]> = {
  'WO': [
    { id: 'full_day', question: 'Full day coverage?' },
    { id: 'vendor_coordination', question: 'Koordinasi semua vendor?' },
    { id: 'rundown', question: 'Termasuk pembuatan rundown?' },
    { id: 'briefing', question: 'Briefing H-1?' },
    { id: 'team_size', question: 'Jumlah tim WO?' },
  ],
  'Katering': [
    { id: 'appetizer', question: 'Termasuk appetizer?' },
    { id: 'main_course', question: 'Termasuk main course?' },
    { id: 'dessert', question: 'Termasuk dessert?' },
    { id: 'tasting', question: 'Free trial tasting?' },
    { id: 'portion_count', question: 'Jumlah porsi?' },
  ],
  'Venue': [
    { id: 'capacity', question: 'Kapasitas maksimal?' },
    { id: 'parking', question: 'Termasuk parking?' },
    { id: 'duration', question: 'Durasi sewa?' },
    { id: 'bridal_room', question: 'Bridal room?' },
  ],
  'MUA': [
    { id: 'bride_makeup', question: 'Makeup pengantin wanita?' },
    { id: 'touchup', question: 'Berapa kali touch-up?' },
    { id: 'hairdo', question: 'Termasuk hairdo?' },
    { id: 'trial_makeup', question: 'Trial makeup?' },
  ],
  'Fotografi': [
    { id: 'photographer_count', question: 'Jumlah fotografer?' },
    { id: 'duration', question: 'Durasi coverage?' },
    { id: 'prewedding', question: 'Termasuk pre-wedding?' },
    { id: 'album', question: 'Termasuk album?' },
    { id: 'drone', question: 'Termasuk drone?' },
  ],
  'Dekorasi': [
    { id: 'fresh_flowers', question: 'Bunga segar?' },
    { id: 'backdrop', question: 'Termasuk backdrop?' },
    { id: 'pelaminan', question: 'Dekorasi pelaminan?' },
    { id: 'lighting', question: 'Lighting dekorasi?' },
  ],
  'Entertainment': [
    { id: 'band', question: 'Live band?' },
    { id: 'dj', question: 'DJ?' },
    { id: 'duration', question: 'Durasi entertainment?' },
  ],
  'Busana': [
    { id: 'fitting_sessions', question: 'Jumlah sesi fitting?' },
    { id: 'full_accessories', question: 'Full aksesoris termasuk?' },
  ],
  'MC': [
    { id: 'speaking_style', question: 'Gaya bicara sesuai?' },
    { id: 'technical_meetings', question: 'Jumlah technical meeting?' },
  ],
  'Undangan & Souvenir': [
    { id: 'design_approved', question: 'Desain sudah di-approve?' },
    { id: 'print_quantity_confirmed', question: 'Jumlah cetak dikonfirmasi?' },
  ],
  'Lainnya': [
    { id: 'custom_1', question: 'Fitur khusus 1?' },
    { id: 'additional_services', question: 'Layanan tambahan?' },
  ],
};

export function getChecklistForCategory(category: VendorCategory): ChecklistItem[] {
  return vendorChecklists[category] || [];
}

export function getDefaultChecklistValues(category: VendorCategory): Record<string, ChecklistValue> {
  const items = getChecklistForCategory(category);
  const values: Record<string, ChecklistValue> = {};
  items.forEach(item => { values[item.id] = { checked: false, notes: '' }; });
  return values;
}

export function countCheckedItems(checklist: Record<string, ChecklistValue> | undefined): number {
  if (!checklist) return 0;
  return Object.values(checklist).filter(value => value.checked === true).length;
}

export function migrateChecklistFormat(
  oldChecklist: Record<string, boolean> | Record<string, ChecklistValue> | undefined,
  category: VendorCategory
): Record<string, ChecklistValue> {
  if (!oldChecklist) return getDefaultChecklistValues(category);
  const firstValue = Object.values(oldChecklist)[0];
  if (firstValue && typeof firstValue === 'object' && 'checked' in firstValue) {
    return oldChecklist as Record<string, ChecklistValue>;
  }
  const newChecklist: Record<string, ChecklistValue> = {};
  const defaultValues = getDefaultChecklistValues(category);
  Object.keys(defaultValues).forEach(key => {
    const oldValue = (oldChecklist as Record<string, boolean>)[key];
    newChecklist[key] = { checked: oldValue === true, notes: '' };
  });
  return newChecklist;
}
