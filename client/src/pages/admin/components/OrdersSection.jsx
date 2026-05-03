import React from 'react';
import { Search, X, Pencil, RefreshCcw, Trash2 } from 'lucide-react';
import METANARUSelect from './METANARUSelect';

const OrdersSection = ({
  filter,
  setFilter,
  events,
  allMergedOrders,
  onlineOrders,
  updateStatus,
  setEditingOTS,
  setShowEditOTSModal,
  deleteOrder,
  deletingId,
  filterList
}) => (
  <div className="space-y-6">
    <div className="flex flex-col md:flex-row items-stretch md:items-end justify-between mb-6 gap-4">
      <h2 className="text-2xl font-bold uppercase tracking-tight">Arsip Pesanan</h2>

      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch sm:items-center">
        <METANARUSelect 
          value={filter.event}
          onChange={val => setFilter(prev => ({...prev, event: val}))}
          placeholder="Semua Event"
          className="w-full sm:w-48"
          options={[
            { value: 'all', label: 'Semua Event' },
            ...events.map(ev => ({
              value: ev.id.toString(),
              label: ev.name
            }))
          ]}
        />
        <div className="bg-[#121214] border border-white/10 rounded-lg px-2 py-1 flex items-center justify-center gap-2">
          <span className="text-[10px] text-white/40 hidden sm:inline">Active:</span>
          <span className="text-[10px] font-bold bg-white text-black px-1.5 py-0.5 rounded">
            {onlineOrders.length}
          </span>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={14} />
          <input 
            placeholder="Cari pesanan..." 
            value={filter.search}
            onChange={e => setFilter(prev => ({...prev, search: e.target.value}))}
            className="w-full bg-[#121214] border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm outline-none focus:border-[#FF0033]/50 transition-colors"
          />
        </div>

        {(filter.status !== 'all' || filter.event !== 'all' || filter.search) && (
          <button 
            onClick={() => setFilter({ status: 'all', event: 'all', search: '' })}
            className="p-2 bg-white/5 rounded-lg text-white/40 hover:bg-red-500/20 hover:text-red-500 transition-colors"
            title="Clear Filters"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>

    {/* SECTION: OTS */}
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-lg font-bold uppercase tracking-tight text-white/80 border-b-2 border-purple-500/50 pb-1">On The Spot (OTS)</h3>
      <span className="text-xs font-bold bg-purple-600/20 text-purple-400 px-2 py-1 rounded">
        {filterList(allMergedOrders).filter(o => o.mode === 'ots').length} Pesanan
      </span>
    </div>
    <div className="bg-[#121214] border border-white/10 rounded-xl overflow-hidden mb-8">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-white/40 uppercase text-[9px] sm:text-[10px] font-bold tracking-widest">
              <th className="p-3 sm:p-4 w-20">ID</th>
              <th className="p-3 sm:p-4">Nama</th>
              <th className="p-3 sm:p-4">Item</th>
              <th className="p-3 sm:p-4">Total</th>
              <th className="p-3 sm:p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filterList(allMergedOrders).filter(order => order.mode === 'ots').map((order) => (
              <tr key={order.id} className="group hover:bg-white/5 transition-colors">
                <td className="p-3 sm:p-4 text-[9px] sm:text-[10px] font-mono text-white/30">{order.public_code || `#${order.id}`}</td>
                <td className="p-3 sm:p-4 text-[11px] sm:text-sm font-bold text-white/90">{order.nickname}</td>
                <td className="p-3 sm:p-4 text-[9px] sm:text-[10px] text-white/60 font-medium">
                  {order.items && order.items.length > 0 
                    ? order.items.map(it => `${it.member_id} x${it.qty}`).join(', ') 
                    : order.member_id || '-'}
                </td>
                <td className="p-3 sm:p-4 text-[9px] sm:text-[10px] font-black text-[#FF0033]">Rp {order.total_price.toLocaleString()}</td>
                <td className="p-3 sm:p-4">
                  <div className="flex items-center gap-2">
                    <METANARUSelect 
                      value={order.status}
                      onChange={val => updateStatus(order.id, val)}
                      className="min-w-[10rem]"
                        options={[
                          { value: 'pending', label: 'Belum dicek' },
                          { value: 'paid', label: 'Sudah bayar' },
                          { value: 'verified', label: 'Sudah Diambil' }
                        ]}
                    />
                    <button 
                      onClick={() => {
                        setEditingOTS({...order});
                        setShowEditOTSModal(true);
                      }}
                      className="p-2 bg-white/5 rounded-lg text-white/40 hover:bg-[#FF0033]/20 hover:text-[#FF0033] transition-all"
                      title="Edit Order"
                    >
                      <Pencil size={14} />
                    </button>
                    <button 
                      onClick={() => deleteOrder(order.id)}
                      disabled={deletingId === order.id}
                      className="p-2 bg-white/5 rounded-lg text-white/40 hover:bg-red-500/10 hover:text-red-500 transition-all"
                      title="Hapus Order"
                    >
                      {deletingId === order.id ? <RefreshCcw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filterList(allMergedOrders).filter(o => o.mode === 'ots').length === 0 && (
          <div className="py-12 text-center">
            <p className="text-xs text-white/20 uppercase tracking-widest font-black">Data OTS tidak ditemukan.</p>
          </div>
        )}
      </div>
    </div>

    {/* SECTION: PRE-ORDER */}
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-lg font-bold uppercase tracking-tight text-white/80 border-b-2 border-[#FF0033]/50 pb-1">Pre-Order (PO)</h3>
      <span className="text-xs font-bold bg-[#FF0033]/20 text-[#FF0033] px-2 py-1 rounded">
        {filterList(allMergedOrders).filter(o => o.mode !== 'ots').length} Pesanan
      </span>
    </div>
    <div className="bg-[#121214] border border-white/10 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-white/40 uppercase text-[9px] sm:text-[10px] font-bold tracking-widest">
              <th className="p-3 sm:p-4 w-20">ID</th>
              <th className="p-3 sm:p-4">Nama</th>
              <th className="p-3 sm:p-4 w-1/3">Item</th>
              <th className="p-3 sm:p-4">Catatan PO</th>
              <th className="p-3 sm:p-4">Total</th>
              <th className="p-3 sm:p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filterList(allMergedOrders).filter(order => order.mode !== 'ots').map((order) => (
              <tr key={order.id} className="group hover:bg-white/5 transition-colors">
                <td className="p-3 sm:p-4 text-[9px] sm:text-[10px] font-mono text-white/30">{order.public_code || `#${order.id}`}</td>
                <td className="p-3 sm:p-4 text-[11px] sm:text-sm font-bold text-white/90">{order.nickname}</td>
                <td className="p-3 sm:p-4 text-[9px] sm:text-[10px] text-white/60 font-medium">
                  {order.items && order.items.length > 0 
                    ? order.items.map(it => `${it.member_id} x${it.qty}`).join(', ') 
                    : order.member_id || '-'}
                </td>
                <td className="p-3 sm:p-4 text-[9px] sm:text-[10px] text-white/60 italic">
                  {order.note ? order.note : '-'}
                </td>
                <td className="p-3 sm:p-4 text-[9px] sm:text-[10px] font-black text-[#FF0033]">Rp {order.total_price.toLocaleString()}</td>
                <td className="p-3 sm:p-4">
                  <div className="flex items-center gap-2">
                    <METANARUSelect 
                      value={order.status}
                      onChange={val => updateStatus(order.id, val)}
                      className="min-w-[10rem]"
                        options={[
                          { value: 'pending', label: 'Belum dicek' },
                          { value: 'paid', label: 'Sudah bayar' },
                          { value: 'verified', label: 'Sudah Diambil' }
                        ]}
                    />
                    <button 
                      onClick={() => {
                        setEditingOTS({...order});
                        setShowEditOTSModal(true);
                      }}
                      className="p-2 bg-white/5 rounded-lg text-white/40 hover:bg-[#FF0033]/20 hover:text-[#FF0033] transition-all"
                      title="Edit Order"
                    >
                      <Pencil size={14} />
                    </button>
                    <button 
                      onClick={() => deleteOrder(order.id)}
                      disabled={deletingId === order.id}
                      className="p-2 bg-white/5 rounded-lg text-white/40 hover:bg-red-500/10 hover:text-red-500 transition-all"
                      title="Hapus Order"
                    >
                      {deletingId === order.id ? <RefreshCcw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filterList(allMergedOrders).filter(o => o.mode !== 'ots').length === 0 && (
          <div className="py-12 text-center">
            <p className="text-xs text-white/20 uppercase tracking-widest font-black">Data PO tidak ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default OrdersSection;
