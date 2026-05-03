import React from 'react';
import { AlertCircle } from 'lucide-react';

const ConfirmModal = ({ confirmModal, setConfirmModal }) => {
  if (!confirmModal.show) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      <div 
        onClick={() => setConfirmModal(prev => ({...prev, show: false}))}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <div className="relative bg-[#121214] border border-white/10 rounded-xl p-6 w-full max-w-sm text-center shadow-2xl z-10">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-4">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-lg font-bold mb-2">{confirmModal.title}</h3>
        <p className="text-xs text-white/50 mb-6 leading-relaxed">{confirmModal.message}</p>
        <div className="flex gap-2">
          <button
            onClick={() => setConfirmModal(prev => ({...prev, show: false}))}
            className="flex-1 py-2 bg-white/5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={confirmModal.onConfirm}
            className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-500 transition-colors"
          >
            Konfirmasi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
