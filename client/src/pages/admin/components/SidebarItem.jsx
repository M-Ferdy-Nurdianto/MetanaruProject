import React from 'react';

const SidebarItem = ({ id, icon: Icon, label, activeTab, setActiveTab, setMobileMenuOpen }) => (
  <button
    onClick={() => {
      setActiveTab(id);
      setMobileMenuOpen(false);
    }}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative group ${
      activeTab === id
        ? 'metal-item-active font-black'
        : 'metal-item'
    }`}
  >
    <div className={`absolute left-0 top-0 h-full w-1.5 transition-all ${activeTab === id ? 'bg-white' : 'bg-transparent group-hover:bg-[#FF0033]'}`} />
    <Icon size={18} className={activeTab === id ? 'animate-pulse' : ''} />
    <span className="text-[10px] uppercase font-black tracking-[0.2em]">{label}</span>
  </button>
);

export default SidebarItem;
