import React from 'react';
import { X, Image } from 'lucide-react';
import METANARUSelect from './METANARUSelect';

const OrderDetailsModal = ({
  selectedOrder,
  setSelectedOrder,
  showProofOnly,
  setShowProofOnly,
  statusUpdatingId,
  updateStatus
}) => {
  if (!selectedOrder) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-4">
      <div
        onClick={() => setSelectedOrder(null)}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
      />
      <div className="relative bg-[#121214] border border-white/10 rounded-xl w-full max-w-[92vw] sm:max-w-md shadow-2xl flex flex-col max-h-[90vh] z-10">
        <div className="p-3 sm:p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div>
            <h3 className="text-sm sm:text-base font-bold">{showProofOnly ? 'Bukti Pembayaran' : 'Detail Pesanan'}</h3>
            <p className="text-xs text-white/40 uppercase">{selectedOrder.public_code || `#${selectedOrder.id}`} • {selectedOrder.nickname}</p>
          </div>
          <button onClick={() => setSelectedOrder(null)} className="p-1.5 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <X size={14} />
          </button>
        </div>
        
        <div className="overflow-y-auto p-3 sm:p-4 space-y-4 custom-scrollbar">
          {showProofOnly ? (
            <div className="rounded-lg overflow-hidden border border-white/10 bg-black relative aspect-[3/4]">
              {selectedOrder.payment_proof_url ? (
                <img
                  src={selectedOrder.payment_proof_url}
                  alt="Proof"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/20 text-xs font-bold uppercase tracking-widest text-center px-4">
                  Belum ada bukti pembayaran.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                  <p className="text-xs text-white/40 mb-1">Total</p>
                  <p className="text-lg font-bold text-white">Rp {selectedOrder.total_price?.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                  <p className="text-xs text-white/40 mb-1">Tanggal</p>
                  <p className="text-sm font-bold">{selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString('id-ID') : '-'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase text-white/40 ml-1">Item Pesanan</p>
                {selectedOrder.items && Array.isArray(selectedOrder.items) && selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-xs font-semibold">{item.member_id}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/40">x{item.qty}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-white/40 ml-1">Catatan</label>
                <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-xs text-white/60 italic">
                  "{selectedOrder.note || 'Tidak ada catatan.'}"
                </div>
              </div>
              
              <div className="pt-2">
                {selectedOrder.payment_proof_url && (
                  <button
                    onClick={() => setShowProofOnly(true)}
                    className="w-full py-2 bg-white/5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Image size={14} /> Lihat Bukti
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="flex gap-2">
            <button
              disabled={statusUpdatingId === selectedOrder.id}
              onClick={() => {
                updateStatus(selectedOrder.id, 'paid');
                setSelectedOrder(null);
              }}
              className={`flex-1 py-2 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${statusUpdatingId === selectedOrder.id ? 'bg-green-800 opacity-50 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'}`}
            >
              {statusUpdatingId === selectedOrder.id ? 'Memproses...' : 'Ubah: DIBAYAR'}
            </button>
            <button
              disabled={statusUpdatingId === selectedOrder.id}
              onClick={() => {
                updateStatus(selectedOrder.id, 'verified');
                setSelectedOrder(null);
              }}
              className={`flex-1 py-2 text-black rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${statusUpdatingId === selectedOrder.id ? 'bg-gray-400 opacity-50 cursor-not-allowed' : 'bg-white hover:bg-gray-200'}`}
            >
              {statusUpdatingId === selectedOrder.id ? 'Memproses...' : 'Ubah: SELESAI'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
