import React from 'react';
import { 
  X,
  LayoutDashboard, 
  ShoppingBag, 
  Newspaper,
  FileSpreadsheet, 
  Settings, 
  FileText,
  LogOut,
  Package
} from 'lucide-react';
import SidebarItem from './SidebarItem';

const MobileSidebar = ({ 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  activeTab, 
  setActiveTab, 
  handleLogout 
}) => {
  if (!mobileMenuOpen) return null;

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'orders', icon: ShoppingBag, label: 'Pesanan' },
    { id: 'merch', icon: Package, label: 'MERCHANDISE' },
    { id: 'cms', icon: Newspaper, label: 'OTSU POST' },
    { id: 'export', icon: FileSpreadsheet, label: 'Ekspor Data' },
    { id: 'settings', icon: Settings, label: 'EVENT' },
    { id: 'handbook', icon: FileText, label: 'Panduan Staff' },
  ];

  return (
    <>
      <div 
        onClick={() => setMobileMenuOpen(false)}
        className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[250]"
      />
      <div
        className="lg:hidden fixed top-0 right-0 bottom-0 w-[85vw] sm:w-[320px] metal-sidebar metal-edge z-[300] p-5 sm:p-6 overflow-y-auto shadow-2xl"
      >
        <div className="flex justify-between items-center mb-10">
          <div className="space-y-1">
            <p className="metal-kicker">Metal Core</p>
            <span className="metal-title text-xl tracking-tight">
              METANARU
            </span>
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/50">ADMIN</p>
          </div>
          <button onClick={() => setMobileMenuOpen(false)}>
            <X size={24} className="text-white/40 hover:text-white" />
          </button>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              id={item.id}
              icon={item.icon}
              label={item.label}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              setMobileMenuOpen={setMobileMenuOpen}
            />
          ))}
          
          <div className="my-6 border-t border-white/5" />
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-white/30 hover:bg-white/[0.03] hover:text-white transition-all text-left group"
          >
            <div className="p-2 rounded-xl bg-white/5 group-hover:bg-white/10">
              <LogOut size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Logout</span>
          </button>
        </nav>
      </div>
    </>
  );
};

export default MobileSidebar;
