import React from 'react';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

const AdminToasts = ({ toasts }) => {
  return (
    <div className="fixed bottom-8 right-8 z-[2000] flex flex-col gap-3 pointer-events-none items-end">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`toast-glass px-5 py-4 rounded-2xl border flex items-center gap-4 pointer-events-auto min-w-[280px] group ${
            t.isExiting ? 'animate-toast-out' : 'animate-toast-in'
          } ${
            t.type === 'error' 
              ? 'border-red-500/30 shadow-red-900/10' 
              : t.type === 'info' 
                ? 'border-blue-500/30 shadow-blue-900/10' 
                : 'border-[#FF0033]/30 shadow-[#FF0033]/10'
          }`}
        >
          <div className={`p-2 rounded-xl ${
            t.type === 'error' 
              ? 'bg-red-500/20 text-red-500' 
              : t.type === 'info' 
                ? 'bg-blue-500/20 text-blue-400' 
                : 'bg-[#FF0033]/20 text-[#FF0033]'
          }`}>
            {t.type === 'error' ? (
              <AlertCircle size={20} />
            ) : t.type === 'info' ? (
              <Clock size={20} />
            ) : (
              <CheckCircle2 size={20} />
            )}
          </div>
          
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-0.5">Notification</p>
            <p className="text-sm font-bold text-white/90">{t.message}</p>
          </div>
          
          <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent w-full opacity-50" />
        </div>
      ))}
    </div>
  );
};

export default AdminToasts;
