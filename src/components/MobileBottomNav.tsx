import { useState } from 'react';
import { Home, Receipt, Users, Building2, MoreHorizontal, PiggyBank, CalendarDays, Settings, X } from 'lucide-react';

interface Props { activeTab: string; onTabChange: (tab: string) => void; }

const mainMenus = [
  { id: 'dashboard', name: 'Dashboard', icon: Home },
  { id: 'budget', name: 'Anggaran', icon: Receipt },
  { id: 'guests', name: 'Tamu', icon: Users },
  { id: 'vendors', name: 'Vendor', icon: Building2 },
];

const moreMenus = [
  { id: 'savings', name: 'Tabungan', icon: PiggyBank },
  { id: 'timeline', name: 'Timeline', icon: CalendarDays },
  { id: 'settings', name: 'Pengaturan', icon: Settings },
];

export default function MobileBottomNav({ activeTab, onTabChange }: Props) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#D6E5DC] shadow-lg md:hidden z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {mainMenus.map((menu) => {
            const isActive = activeTab === menu.id;
            const Icon = menu.icon;
            return (
              <button key={menu.id} onClick={() => onTabChange(menu.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${isActive ? 'text-[#2F6A43] bg-[#2F6A43]/10' : 'text-gray-500'}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{menu.name}</span>
              </button>
            );
          })}
          <button onClick={() => setIsMoreOpen(true)} className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-gray-500">
            <MoreHorizontal size={22} />
            <span className="text-[10px] font-medium">Lainnya</span>
          </button>
        </div>
      </nav>
      {isMoreOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMoreOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl animate-slide-up">
            <div className="p-4">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-800 mb-4">Menu Lainnya</h3>
              <div className="space-y-2">
                {moreMenus.map((menu) => {
                  const Icon = menu.icon;
                  return (
                    <button key={menu.id} onClick={() => { onTabChange(menu.id); setIsMoreOpen(false); }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-[#F3EFE6] text-gray-700 text-left">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#2F6A43]/10">
                        <Icon size={20} className="text-[#2F6A43]" />
                      </div>
                      <span className="font-medium">{menu.name}</span>
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setIsMoreOpen(false)} className="w-full mt-4 py-3 text-gray-500 font-medium hover:bg-[#F3EFE6] rounded-xl flex items-center justify-center gap-2">
                <X size={18} /><span>Tutup</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
