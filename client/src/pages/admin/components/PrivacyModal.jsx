import React from 'react';
import { X } from 'lucide-react';

const PrivacyModal = ({ showPrivacyModal, setShowPrivacyModal }) => {
  if (!showPrivacyModal) return null;

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4">
      <div 
        onClick={() => setShowPrivacyModal(false)}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <div className="relative bg-[#121214] border border-white/10 rounded-xl w-full max-w-md shadow-2xl z-10 flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div>
            <h3 className="text-lg font-bold">Aturan Privasi Data</h3>
            <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">STRICTLY CONFIDENTIAL</p>
          </div>
          <button onClick={() => setShowPrivacyModal(false)} className="p-1.5 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto space-y-4 text-sm text-white/70 custom-scrollbar">
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-xs">1. Kerahasiaan Data Pelanggan</h4>
            <p className="text-xs leading-relaxed">Seluruh data pelanggan (nama panggilan, kontak, riwayat pesanan, bukti transfer) bersifat sangat rahasia. Dilarang keras menyebarkan atau mendokumentasikan data pelanggan tanpa izin.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-xs">2. Penggunaan Sistem</h4>
            <p className="text-xs leading-relaxed">Sistem ini hanya boleh diakses oleh staff resmi METANARU yang bertugas. Dilarang meminjamkan akun atau membiarkan layar Admin terbuka tanpa pengawasan.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-xs">3. Log Aktivitas</h4>
            <p className="text-xs leading-relaxed">Segala bentuk perubahan status (Belum dicek, Sudah bayar, Selesai) akan dicatat oleh sistem. Tindakan pemalsuan verifikasi akan ditelusuri.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-xs">4. Pasca Bertugas</h4>
            <p className="text-xs leading-relaxed">Pastikan Anda melakukan <b>Logout</b> dan menutup browser setelah selesai bertugas. Keamanan data pelanggan adalah tanggung jawab bersama.</p>
          </div>
        </div>
        <div className="p-4 border-t border-white/10 bg-white/5 text-center">
          <button onClick={() => setShowPrivacyModal(false)} className="w-full py-2 bg-red-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-500 transition-colors">
            SAYA MENGERTI
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyModal;
