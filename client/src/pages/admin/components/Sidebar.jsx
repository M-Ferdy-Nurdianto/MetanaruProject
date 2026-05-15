import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  FileSpreadsheet, 
  Settings, 
  History, 
  LogOut,
  Newspaper,
  Package
} from 'lucide-react';
import SidebarItem from './SidebarItem';

const Sidebar = ({ activeTab, setActiveTab, setMobileMenuOpen, handleLogout }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'orders', icon: ShoppingBag, label: 'Pesanan' },
    { id: 'merch', icon: Package, label: 'MERCHANDISE' },
    { id: 'cms', icon: Newspaper, label: 'OTSU POST' },
    { id: 'export', icon: FileSpreadsheet, label: 'Ekspor Data' },
    { id: 'settings', icon: Settings, label: 'EVENT' },
    { id: 'handbook', icon: History, label: 'Panduan Staff' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-56 metal-sidebar metal-edge h-screen fixed top-0 left-0 p-6 z-50">
      <div className="mb-8 space-y-2">
        <p className="metal-kicker">Metal Core</p>
        <h1 className="metal-title text-2xl leading-none">METANARU</h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/50">ADMIN</p>
        <div className="metal-divider mt-4" />
      </div>
      
      <div className="flex flex-col gap-1 flex-1">
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
      </div>

      <button 
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/40 hover:bg-white/5 hover:text-white transition-colors text-left border border-white/5 hover:border-white/20"
      >
        <LogOut size={18} />
        <span className="text-xs uppercase tracking-wider">Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;
