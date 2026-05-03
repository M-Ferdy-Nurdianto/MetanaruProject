import React from 'react';
import { X, Save } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const OrderEditModal = ({
  showEditOTSModal,
  setShowEditOTSModal,
  editingOTS,
  setEditingOTS,
  handleEditOTSSubmit,
  isUpdatingOTS,
  membersList,
  eventLineup = []
}) => {
  if (!showEditOTSModal || !editingOTS) return null;

  // Safety check for eventLineup
  const safeLineup = Array.isArray(eventLineup) ? eventLineup : [];

  const isMemberInLineup = (nickname) => {
    if (safeLineup.length === 0) return true; // If no lineup defined, allow all
    const nick = (nickname || '').toUpperCase();
    return safeLineup.some(ln => {
      const upLn = (ln || '').toUpperCase();
      return upLn === nick || upLn.startsWith(nick) || nick.startsWith(upLn);
    });
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-4">
      <div 
        onClick={() => {
          setShowEditOTSModal(false);
          setEditingOTS(null);
        }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <div className="relative bg-[#121214] border border-white/10 rounded-xl w-full max-w-[92vw] sm:max-w-md shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div>
            <h3 className="text-lg font-bold text-white">Edit Pesanan Booth</h3>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-[#FF0033] font-bold uppercase tracking-widest">
                {editingOTS.public_code || `#${editingOTS.id}`}
              </p>
              {safeLineup.length > 0 && (
                <>
                  <span className="text-[10px] text-white/20">•</span>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                    Lineup Active
                  </p>
                </>
              )}
            </div>
          </div>
          <button 
            onClick={() => { setShowEditOTSModal(false); setEditingOTS(null); }} 
            className="p-1.5 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-white/60"
          >
            <X size={14} />
          </button>
        </div>
        
        <form onSubmit={handleEditOTSSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-white/40 ml-1 tracking-wider">Informasi Pelanggan</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                placeholder="Nama Panggilan" 
                value={editingOTS.nickname || ''}
                onChange={e => setEditingOTS(prev => ({...prev, nickname: e.target.value}))}
                className="flex-1 bg-[#0A0A0B] border border-white/20 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#FF0033]/50 transition-all"
                required
              />
              <input 
                placeholder="Kontak" 
                value={editingOTS.contact || ''}
                onChange={e => setEditingOTS(prev => ({...prev, contact: e.target.value}))}
                className="w-full sm:w-1/3 bg-[#0A0A0B] border border-white/20 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#FF0033]/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-white/40 ml-1 tracking-wider">Item Pesanan</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 bg-[#0A0A0B] p-2 rounded-lg border border-white/10">
              {membersList.map(m => {
                const item = editingOTS.items?.find(it => it.member_id === m.nickname);
                const qty = item?.qty || 0;
                // Resilient logic: if already in items OR in lineup, it's enabled
                const inLineup = isMemberInLineup(m.nickname) || qty > 0;
                
                return (
                  <div key={m.id} className="relative">
                    <button
                      type="button"
                      disabled={!inLineup}
                      onClick={() => {
                        const newItems = [...(editingOTS.items || [])];
                        const idx = newItems.findIndex(it => it.member_id === m.nickname);
                        if (idx >= 0) {
                          newItems[idx].qty += 1;
                        } else {
                          newItems.push({ member_id: m.nickname, qty: 1, cheki_type: 'solo' });
                        }
                        setEditingOTS(prev => ({ ...prev, items: newItems }));
                      }}
                      className={`w-full py-2 rounded-md text-[10px] font-bold uppercase transition-all relative ${
                        qty > 0 
                          ? 'bg-white text-black border-2 border-[#FF0033] shadow-[0_0_15px_rgba(255,51,153,0.3)]' 
                          : inLineup
                            ? 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/20'
                            : 'bg-white/5 text-white/10 cursor-not-allowed opacity-30'
                      }`}
                    >
                      {m.nickname}
                      {qty > 0 && (
                        <span className="absolute -top-2 -right-1 w-4 h-4 bg-[#FF0033] text-white text-[8px] rounded-full flex items-center justify-center font-black shadow-lg">
                          {qty}
                        </span>
                      )}
                    </button>
                    {qty > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newItems = [...(editingOTS.items || [])];
                          const idx = newItems.findIndex(it => it.member_id === m.nickname);
                          if (idx >= 0) {
                            if (newItems[idx].qty > 1) {
                              newItems[idx].qty -= 1;
                            } else {
                              newItems.splice(idx, 1);
                            }
                            setEditingOTS(prev => ({ ...prev, items: newItems }));
                          }
                        }}
                        className="absolute -bottom-1 -left-1 w-5 h-5 bg-black text-white border border-white/30 text-[12px] rounded-full flex items-center justify-center font-bold hover:bg-red-500 hover:border-red-500 transition-all z-20 shadow-lg active:scale-95"
                      >
                        -
                      </button>
                    )}
                  </div>
                );
              })}
              
              <div className="col-span-4 relative mt-1">
                {(() => {
                  const groupItem = editingOTS.items?.find(it => it.member_id === 'GROUP');
                  const groupQty = groupItem?.qty || 0;
                  const isGroupInLineup = isMemberInLineup('GROUP') || groupQty > 0;
                  
                  return (
                    <>
                      <button
                        type="button"
                        disabled={!isGroupInLineup}
                        onClick={() => {
                          const newItems = [...(editingOTS.items || [])];
                          const idx = newItems.findIndex(it => it.member_id === 'GROUP');
                          if (idx >= 0) {
                            newItems[idx].qty += 1;
                          } else {
                            newItems.push({ member_id: 'GROUP', qty: 1, cheki_type: 'group' });
                          }
                          setEditingOTS(prev => ({ ...prev, items: newItems }));
                        }}
                        className={`w-full py-2 rounded-md text-[10px] font-bold uppercase transition-all relative ${
                          groupQty > 0 
                            ? 'bg-purple-600 text-white border-2 border-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.3)]' 
                            : isGroupInLineup
                              ? 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/20'
                              : 'bg-white/5 text-white/10 cursor-not-allowed opacity-30'
                        }`}
                      >
                        GROUP
                        {groupQty > 0 && (
                          <span className="absolute -top-2 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center font-black shadow-lg">
                            {groupQty}
                          </span>
                        )}
                      </button>
                      {groupQty > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newItems = [...(editingOTS.items || [])];
                            const idx = newItems.findIndex(it => it.member_id === 'GROUP');
                            if (idx >= 0) {
                              if (newItems[idx].qty > 1) {
                                newItems[idx].qty -= 1;
                              } else {
                                newItems.splice(idx, 1);
                              }
                              setEditingOTS(prev => ({ ...prev, items: newItems }));
                            }
                          }}
                          className="absolute -bottom-1 -left-1 w-5 h-5 bg-black text-white border border-white/30 text-[12px] rounded-full flex items-center justify-center font-bold hover:bg-red-500 hover:border-red-500 transition-all z-20 shadow-lg active:scale-95"
                        >
                          -
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-white/40 ml-1 tracking-wider">Metode Pembayaran</label>
            <div className="flex gap-2">
              {['cash', 'qr'].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setEditingOTS(prev => ({...prev, payment_method: m}))}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all ${
                    editingOTS.payment_method === m 
                      ? 'bg-white text-black border-white' 
                      : 'bg-transparent border-white/10 text-white/30 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>



          <div className="pt-4 border-t border-white/5">
            <button
              type="submit"
              disabled={isUpdatingOTS}
              className={`w-full py-3 rounded-lg text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                isUpdatingOTS 
                  ? 'bg-white/10 text-white/30 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#FF0033] to-purple-600 text-white hover:opacity-90 shadow-lg shadow-[#FF0033]/20'
              }`}
            >
              {isUpdatingOTS ? <LoadingSpinner size={16} /> : <Save size={16} />} 
              {isUpdatingOTS ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderEditModal;
