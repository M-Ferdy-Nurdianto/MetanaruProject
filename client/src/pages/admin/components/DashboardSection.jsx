import React from 'react';
import { CreditCard, ShoppingBag, Send, Clock, Image, Pencil, RefreshCcw, Trash2 } from 'lucide-react';
import METANARUSelect from './METANARUSelect';
import LoadingSpinner from './LoadingSpinner';
import { eventOptionBadge } from '../utils';

const DashboardSection = ({
  filter,
  setFilter,
  events,
  orders,
  otsOrders,
  onlineOrders,
  setOTSForm,
  otsForm,
  membersList,
  isMemberInLineup,
  toggleMember,
  decrementMember,
  resetSelection,
  createOTSOrder,
  isSavingOTS,
  updateStatus,
  setEditingOTS,
  setShowEditOTSModal,
  deleteOrder,
  deletingId,
  setSelectedOrder,
  setShowProofOnly,
  setActiveTab,
  filterList,
  otsLineup
}) => (
  <div className="space-y-8">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 sm:gap-6 mb-6 sm:mb-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="flex items-center gap-4 w-full md:w-auto">
        <METANARUSelect 
          value={filter.event}
          onChange={val => {
            setFilter(prev => ({...prev, event: val}));
            if (val !== 'all') {
              setOTSForm(prev => ({ ...prev, event_id: val }));
            }
          }}
          placeholder="Select Event"
          className="w-full sm:min-w-[200px]"
          options={[
            { value: 'all', label: 'All Events' },
            ...events.map((ev) => {
              const { badge, badgeKind } = eventOptionBadge(ev);
              return { value: ev.id, label: ev.name, badge, badgeKind };
            })
          ]}
        />
      </div>
    </div>

    {/* Scrapped Paper Stats Grid */}
    {/* Stats Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { 
          label: 'Total Penjualan', 
          val: `Rp ${orders.filter(o => filter.event === 'all' || o.event_id == filter.event).reduce((acc, o) => acc + o.total_price, 0) / 1000}k`, 
          icon: CreditCard
        },
        { 
          label: 'Total Pesanan', 
          val: orders.filter(o => filter.event === 'all' || o.event_id == filter.event).length, 
          icon: ShoppingBag
        },
        { 
          label: 'Pesanan OTS', 
          val: otsOrders.filter(o => filter.event === 'all' || o.event_id == filter.event).length, 
          icon: Send
        },
        { 
          label: 'Pending PO', 
          val: onlineOrders.filter(o => (filter.event === 'all' || o.event_id == filter.event) && o.status === 'pending').length, 
          icon: Clock
        }
      ].map((stat, i) => (
        <div key={i} className="bg-[#121214] border border-white/10 p-4 sm:p-6 rounded-xl hover:border-[#FF0033]/30 hover:bg-white/[0.02] transition-all group">
          <div className="flex items-center gap-4 mb-2">
            <div className={`p-2 rounded-lg ${i === 0 ? 'bg-[#FF0033]/20 text-[#FF0033]' : i === 1 ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-white/60'} group-hover:scale-110 transition-transform`}>
              <stat.icon size={20} />
            </div>
            <span className="text-xs uppercase text-white/40 font-semibold">{stat.label}</span>
          </div>
          <h3 className="text-2xl font-black italic tracking-tight">{stat.val}</h3>
        </div>
      ))}
    </div>

    {/* OTS Section */}
    <section className="bg-[#121214] border border-white/10 rounded-xl p-5 sm:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Quick Input */}
        <div className="w-full lg:w-[400px] space-y-6">
          <div>
            <h3 className="text-lg font-bold uppercase tracking-tight">Input Pesanan Booth</h3>
            <p className="text-xs text-white/30">Input data pesanan langsung di lokasi (OTS).</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase text-white/40 font-semibold tracking-wider">Informasi Pelanggan</label>
              <div className="flex flex-col gap-2">
                <METANARUSelect 
                  value={otsForm.event_id}
                  onChange={val => {
                    setOTSForm(prev => {
                      // Find the new event's lineup to filter current selections
                      const newEvent = events.find(e => String(e.id) === String(val));
                      if (!newEvent) return { ...prev, event_id: val };

                      const avail = Array.isArray(newEvent.available_members) ? newEvent.available_members : [];
                      const lineup = Array.isArray(newEvent.lineup) ? newEvent.lineup : [];
                      const fullLineup = [...new Set([...avail, ...lineup])].map(n => n?.toUpperCase());

                      const newSelected = { ...prev.selectedMembers };
                      Object.keys(newSelected).forEach(nick => {
                        const upNick = nick.toUpperCase();
                        const inNew = fullLineup.some(ln => ln === upNick || ln.startsWith(upNick) || upNick.startsWith(ln));
                        if (!inNew) delete newSelected[nick];
                      });

                      return { ...prev, event_id: val, selectedMembers: newSelected };
                    });
                    setFilter(prev => ({...prev, event: val}));
                  }}
                  placeholder="Pilih Event Booth"
                  className="w-full"
                  options={events.map(ev => {
                    const { badge, badgeKind } = eventOptionBadge(ev);
                    return { value: ev.id, label: ev.name, badge, badgeKind };
                  })}
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <input 
                    placeholder="Nama Panggilan" 
                    value={otsForm.nickname}
                    onChange={e => setOTSForm(prev => ({...prev, nickname: e.target.value}))}
                    className="flex-1 bg-[#0A0A0B] border border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-white/50"
                  />
                  <input 
                    placeholder="Kontak (Opsional)" 
                    value={otsForm.contact}
                    onChange={e => setOTSForm(prev => ({...prev, contact: e.target.value}))}
                    className="w-full sm:w-1/3 bg-[#0A0A0B] border border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-white/50"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-xs uppercase text-white/40 font-semibold tracking-wider">Pilih Member</label>
                {Object.keys(otsForm.selectedMembers).length > 0 && (
                  <button onClick={resetSelection} className="text-xs text-white/60 hover:text-white underline">Reset</button>
                )}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {membersList.map(m => {
                  const label = m.nickname || m.name || 'NOT SIGNAL';
                  const inLineup = isMemberInLineup(label);
                  const qty = otsForm.selectedMembers[label] || 0;
                  return (
                    <div key={m.id} className="relative">
                      <button
                        type="button"
                        disabled={!inLineup}
                        onClick={() => toggleMember(label)}
                        className={`w-full py-3.5 rounded-xl text-[13px] font-black uppercase transition-all relative border-b-4 ${
                          qty > 0 
                            ? "bg-white text-black border-white/20 shadow-xl scale-95" 
                            : inLineup
                              ? "bg-[#0A0A0B] border-white/5 text-white/40 hover:bg-white/5 hover:text-white"
                              : "bg-white/5 border-transparent text-white/10 cursor-not-allowed opacity-20"
                        }`}
                      >
                        {label}
                        {qty > 0 && (
                          <div className="absolute -top-2 -right-1 w-5 h-5 rounded-full bg-[#FF0033] text-white flex items-center justify-center text-[10px] font-black shadow-lg border border-black/20">
                            {qty}
                          </div>
                        )}
                      </button>
                      {qty > 0 && (
                        <button
                          type="button"
                          onClick={(e) => decrementMember(e, label)}
                          className="absolute -bottom-1 -left-1 w-5 h-5 bg-black text-white border border-white/30 text-[12px] rounded-full flex items-center justify-center font-bold hover:bg-red-500 hover:border-red-500 transition-all z-10 shadow-lg active:scale-95"
                          title="Kurangi / Hapus"
                        >
                          -
                        </button>
                      )}
                    </div>
                  );
                })}
                {otsLineup.includes('GROUP') && (
                  <div className="col-span-4 relative">
                    <button
                      type="button"
                      onClick={() => toggleMember('GROUP')}
                      className={`w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all relative ${
                        otsForm.selectedMembers['GROUP']
                          ? 'bg-purple-600 text-white border-2 border-purple-400'
                          : 'bg-[#0A0A0B] border border-white/10 text-white/60 hover:bg-white/5'
                      }`}
                    >
                      {otsForm.selectedMembers['GROUP'] && (
                        <div className="absolute -top-2 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] font-black shadow-lg">
                          {otsForm.selectedMembers['GROUP']}
                        </div>
                      )}
                      GROUP
                    </button>
                    {otsForm.selectedMembers['GROUP'] > 0 && (
                      <button
                        type="button"
                        onClick={(e) => decrementMember(e, 'GROUP')}
                        className="absolute -bottom-1 -left-1 w-5 h-5 bg-black text-white border border-white/30 text-[12px] rounded-full flex items-center justify-center font-bold hover:bg-red-500 hover:border-red-500 transition-all z-10 shadow-lg active:scale-95"
                        title="Kurangi / Hapus"
                      >
                        -
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase text-white/40 font-semibold">Payment Method</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setOTSForm(prev => ({...prev, payment_method: 'qr'}))}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-colors ${otsForm.payment_method === 'qr' ? 'bg-white text-black border-white' : 'bg-transparent border-white/20 text-white/40 hover:text-white hover:border-white/40'}`}
                >
                  QR
                </button>
                <button 
                  onClick={() => setOTSForm(prev => ({...prev, payment_method: 'cash'}))}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-colors ${otsForm.payment_method === 'cash' ? 'bg-white text-black border-white' : 'bg-transparent border-white/20 text-white/40 hover:text-white hover:border-white/40'}`}
                >
                  CASH
                </button>
              </div>
            </div>

            {Object.keys(otsForm.selectedMembers).length > 0 && (
              <div className="bg-[#0A0A0B] border border-white/10 rounded-lg p-3">
                <p className="text-xs font-semibold text-white/40 mb-2 uppercase">Order Summary</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(otsForm.selectedMembers).map(([name, qty]) => (
                    <div key={name} className="bg-white/10 px-2 py-1 rounded text-xs flex items-center gap-2">
                      <span>{name}</span>
                      <span className="font-bold text-white/60">x{qty}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={createOTSOrder}
              disabled={isSavingOTS}
              className={`w-full py-3 bg-gradient-to-r from-[#FF0033] to-purple-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#FF0033]/20 flex items-center justify-center gap-2 ${isSavingOTS ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]'}`}
            >
              {isSavingOTS ? <LoadingSpinner size={16} /> : null}
              {isSavingOTS ? 'Menyimpan...' : 'Simpan Pesanan'}
            </button>
          </div>
        </div>

        {/* Right: OTS Table */}
      <div className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">Penjualan Booth Terbaru</h3>
          <div className="bg-[#0A0A0B] border border-white/10 rounded px-2 py-1 text-xs font-bold">
            {otsOrders.length}
          </div>
        </div>

        <div className="bg-[#0A0A0B] rounded-xl border border-white/10 max-h-[500px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="sticky top-0 z-20 bg-[#0A0A0B] shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
              <tr className="bg-white/5 border-b border-white/5">
                <th className="p-3 text-xs font-bold uppercase text-white/40">Nama</th>
                <th className="p-3 text-xs font-bold uppercase text-white/40">Item</th>
                <th className="p-3 text-xs font-bold uppercase text-white/40">Kontak</th>
                <th className="p-3 text-xs font-bold uppercase text-white/40">Bayar</th>
                <th className="p-3 text-xs font-bold uppercase text-white/40">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filterList(otsOrders).map((order) => (
                <tr key={order.id} className="group hover:bg-white/5 transition-colors">
                  <td className="p-3 text-xs font-semibold text-white/80">{order.nickname}</td>
                  <td className="p-3 text-[10px] text-[#FF0033] font-bold uppercase tracking-tight">
                    {order.items && order.items.length > 0 
                      ? order.items.map(it => `${it.member_id} x${it.qty}`).join(', ') 
                      : order.member_id || '-'}
                  </td>
                  <td className="p-3 text-xs text-white/40">{order.contact || '-'}</td>
                  <td className="p-3">
                    <span className="px-1.5 py-0.5 rounded border border-white/10 text-[10px] font-bold uppercase text-white/60">
                      {order.payment_method || 'CASH'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <METANARUSelect 
                        value={order.status}
                        onChange={val => updateStatus(order.id, val)}
                        className="text-xs min-w-[7rem]"
                        options={[
                          { value: 'paid', label: 'Sudah bayar' },
                          { value: 'verified', label: 'Selesai' }
                        ]}
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingOTS({...order});
                            setShowEditOTSModal(true);
                          }}
                          className="p-1.5 bg-white/5 rounded-lg text-white/40 hover:bg-[#FF0033]/20 hover:text-[#FF0033] transition-all"
                          title="Edit Order"
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          onClick={() => deleteOrder(order.id)}
                          disabled={deletingId === order.id}
                          className="p-1.5 bg-white/5 rounded-lg text-white/40 hover:bg-red-500/10 hover:text-red-500 transition-all"
                          title="Hapus Order"
                        >
                          {deletingId === order.id ? <RefreshCcw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filterList(otsOrders).length === 0 && (
            <div className="py-8 text-center">
              <p className="text-xs text-white/20 uppercase tracking-wider">No Sales.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </section>

    {/* Recent Online Orders (PO) Section */}
    <section className="bg-[#121214] border border-white/10 rounded-xl p-6 lg:p-8 relative overflow-hidden group hover:border-[#FF0033]/30 transition-all">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-black italic tracking-tight">Pesanan <span className="text-[#FF0033]">Online Terbaru</span></h3>
          <p className="text-xs text-white/40 uppercase tracking-widest">Pre-Order & Penjualan Online</p>
        </div>
        <button 
          onClick={() => setActiveTab('orders')}
          className="px-4 py-2 rounded-lg bg-white/5 text-xs font-bold uppercase tracking-wider hover:bg-white/10 hover:text-white transition-colors"
        >
          Lihat Semua
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              <th className="p-4 text-xs font-bold uppercase text-white/40">ID</th>
              <th className="p-4 text-xs font-bold uppercase text-white/40">Pelanggan</th>
              <th className="p-4 text-xs font-bold uppercase text-white/40">Item</th>
              <th className="p-4 text-xs font-bold uppercase text-white/40">Catatan PO</th>
              <th className="p-4 text-xs font-bold uppercase text-white/40">Total</th>
              <th className="p-4 text-xs font-bold uppercase text-white/40">Bukti</th>
              <th className="p-4 text-xs font-bold uppercase text-white/40">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filterList(onlineOrders).slice(0, 5).map((order) => (
              <tr key={order.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="p-4 text-[10px] font-mono text-white/40">{order.public_code || `#${order.id}`}</td>
                <td className="p-4 text-sm font-bold text-white/90">{order.nickname}</td>
                <td className="p-4 text-xs text-white/60">
                  {order.items && order.items.length > 0 
                    ? order.items.map(it => `${it.member_id} x${it.qty}`).join(', ')
                    : `${order.qty}x ${order.cheki_type}`}
                </td>
                <td className="p-4 text-xs text-white/60 italic">
                  {order.note || '-'}
                </td>
                <td className="p-4 text-xs font-bold text-[#FF0033]">Rp {order.total_price.toLocaleString()}</td>
                <td className="p-4">
                  {order.payment_proof_url ? (
                    <button 
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowProofOnly(true);
                      }}
                      className="flex items-center gap-2 text-green-500 hover:text-green-400 text-[10px] font-bold uppercase tracking-wider transition-colors"
                    >
                      <Image size={14} /> Lihat
                    </button>
                  ) : (
                    <div className="text-white/20 text-[10px] font-bold uppercase tracking-wider">-</div>
                  )}
                </td>
                <td className="p-4">
                  <METANARUSelect 
                    value={order.status}
                    onChange={val => updateStatus(order.id, val)}
                    className="min-w-[10rem]"
                    options={[
                      { value: 'pending', label: 'Belum dicek' },
                      { value: 'paid', label: 'Sudah bayar' },
                      { value: 'verified', label: 'Selesai' }
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filterList(onlineOrders).length === 0 && (
          <div className="py-12 text-center border-t border-white/5">
            <p className="text-xs text-white/20 uppercase tracking-widest font-bold">Tidak ada pesanan online.</p>
          </div>
        )}
      </div>
    </section>
  </div>
);

export default DashboardSection;
