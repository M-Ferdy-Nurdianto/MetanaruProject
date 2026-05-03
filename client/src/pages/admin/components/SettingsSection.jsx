import React from 'react';
import { CreditCard, Settings, Download, FileText, RefreshCcw, Trash2 } from 'lucide-react';
import DatePicker from '../../../components/DatePicker';
import PriceInput from './PriceInput';
import LoadingSpinner from './LoadingSpinner';

const SettingsSection = ({
  formRef,
  eventForm,
  setEventForm,
  eventModal,
  setEventModal,
  membersList,
  globalSettings,
  setGlobalSettings,
  updateGlobalSettings,
  isSavingGlobalSettings,
  handleEventSubmit,
  isSavingEvent,
  events,
  handleExport,
  exportingId,
  exportType,
  openEventModal,
  deleteEvent,
  deletingId
}) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Event Form (Main Config) */}
      <div ref={formRef}>
        <div className="bg-[#121214] border border-white/10 rounded-xl overflow-hidden shadow-2xl relative h-full">
          <div className="p-6 border-b border-white/10 bg-white/[0.02]">
            <h3 className="text-lg font-bold uppercase tracking-tight">Konfigurasi Event</h3>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Buat atau perbarui detail event</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#FF0033] uppercase ml-1">Nama Event</label>
                <input 
                  value={eventForm.name}
                  onChange={e => setEventForm(prev => ({...prev, name: e.target.value}))}
                  placeholder="mosing privat"
                  className="w-full bg-[#0A0A0B] border border-white/20 rounded-lg px-3 py-3 text-sm outline-none focus:border-[#FF0033]/50 transition-colors"
                />
              </div>



              {/* Date & PO Deadline - Aligned */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#FF0033] uppercase ml-1">Tanggal</label>
                  <DatePicker 
                    value={eventForm.date}
                    onChange={val => setEventForm(prev => ({...prev, date: val}))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#FF0033] uppercase ml-1">Batas PO</label>
                  <DatePicker 
                    value={eventForm.po_deadline}
                    onChange={val => setEventForm(prev => ({...prev, po_deadline: val}))}
                    align="right"
                  />
                </div>
              </div>

              {/* Time & Location - Aligned (Only for Standard) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#FF0033] uppercase ml-1">Waktu</label>
                    <input 
                      value={eventForm.time}
                      onChange={e => setEventForm(prev => ({...prev, time: e.target.value}))}
                      placeholder="Contoh: 19:00 WIB"
                      className="w-full bg-[#0A0A0B] border border-white/20 rounded-lg px-3 py-3 text-sm outline-none focus:border-[#FF0033]/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#FF0033] uppercase ml-1">Lokasi</label>
                    <input 
                      value={eventForm.location}
                      onChange={e => setEventForm(prev => ({...prev, location: e.target.value}))}
                      placeholder="Contoh: Surabaya"
                      className="w-full bg-[#0A0A0B] border border-white/20 rounded-lg px-3 py-3 text-sm outline-none focus:border-[#FF0033]/50 transition-colors"
                    />
                  </div>
                </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#FF0033] uppercase ml-1">Status</label>
                <div className="flex bg-[#0A0A0B] rounded-lg p-1 border border-white/20">
                  <button 
                    onClick={() => setEventForm(prev => ({...prev, status: 'ongoing'}))}
                    className={`flex-1 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${eventForm.status === 'ongoing' ? 'bg-green-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                  >
                    Berjalan
                  </button>
                  <button 
                    onClick={() => setEventForm(prev => ({...prev, status: 'done'}))}
                    className={`flex-1 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${eventForm.status === 'done' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'}`}
                  >
                    Selesai
                  </button>
                </div>
              </div>

            </div>

            {/* Special Event Pricing (Left Column) */}


            {/* Member Lineup (For ALL Event Types) */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-end">
                <label className="text-xs font-bold text-[#FF0033] uppercase ml-1">Daftar Member</label>
                <button 
                  onClick={() => setEventForm(prev => ({...prev, available_members: ['GROUP', ...membersList.map(m => m.nickname)]}))}
                  className="text-[10px] uppercase font-bold text-white/40 hover:text-white transition-colors"
                >
                  Pilih Semua
                </button>
              </div>
              <div className="flex flex-col gap-2 bg-[#0A0A0B] p-2 rounded-lg border border-white/10">
                {/* Row 1: Main Members (4 cols) */}
                <div className="grid grid-cols-4 gap-2">
                  {membersList.filter(m => m.name !== 'NOT SIGNAL').map(m => (
                    <button
                      key={m.id}
                      onClick={() => {
                        const isSelected = eventForm.available_members.includes(m.nickname);
                        setEventForm(prev => ({
                          ...prev,
                          available_members: isSelected 
                            ? prev.available_members.filter(nm => nm !== m.nickname)
                            : [...prev.available_members, m.nickname]
                        }));
                      }}
                      className={`py-1.5 rounded text-[10px] font-bold uppercase transition-all ${
                        eventForm.available_members.includes(m.nickname)
                          ? 'bg-[#FF0033] text-white shadow-lg shadow-[#FF0033]/20'
                          : 'bg-white/5 text-white/40 hover:bg-white/10'
                      }`}
                    >
                      {m.nickname}
                    </button>
                  ))}
                </div>
                
                {/* Row 2: NOT SIGNAL / Others (Centered) */}
                <div className="grid grid-cols-2 gap-2 opacity-60">
                   {membersList.filter(m => m.name === 'NOT SIGNAL').map(m => (
                    <button
                      key={m.id}
                      onClick={() => {
                        const isSelected = eventForm.available_members.includes(m.nickname);
                        setEventForm(prev => ({
                          ...prev,
                          available_members: isSelected 
                            ? prev.available_members.filter(nm => nm !== m.nickname)
                            : [...prev.available_members, m.nickname]
                        }));
                      }}
                      className={`py-1.5 rounded text-[10px] font-bold uppercase transition-all ${
                        eventForm.available_members.includes(m.nickname)
                          ? 'bg-amber-600 text-white shadow-lg'
                          : 'bg-white/5 text-white/40 hover:bg-white/10'
                      }`}
                    >
                      {m.nickname || 'NOT SIGNAL'}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const isSelected = eventForm.available_members.includes('GROUP');
                    setEventForm(prev => ({
                      ...prev,
                      available_members: isSelected 
                        ? prev.available_members.filter(nm => nm !== 'GROUP')
                        : [...prev.available_members, 'GROUP']
                    }));
                  }}
                  className={`col-span-4 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${
                    eventForm.available_members.includes('GROUP')
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                      : 'bg-white/5 text-white/40 hover:bg-white/10'
                  }`}
                >
                  GROUP
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              {eventModal.mode === 'edit' && (
                <button 
                  onClick={() => {
                    setEventModal({ show: false, mode: 'add', data: null });
                    setEventForm({ 
                      name: '', date: '', po_deadline: '', status: 'ongoing', 
                      type: 'standard', location: '', time: '', lineup: ['GROUP'],
                      theme: '', available_members: ['GROUP'], 
                      special_solo_price: 30000, special_group_price: 35000, group_enabled: true
                    });
                  }}
                  className="px-4 py-3 bg-[#0A0A0B] border border-white/20 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition-colors"
                >
                  Batal
                </button>
              )}
              <button
                onClick={handleEventSubmit}
                disabled={isSavingEvent}
                className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
                  isSavingEvent 
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : eventModal.mode === 'add' 
                      ? 'bg-gradient-to-r from-[#FF0033] to-purple-600 text-white hover:scale-[1.02] active:scale-[0.98] shadow-[#FF0033]/20'
                      : 'bg-white text-black hover:bg-gray-200'
                }`}
              >
                {isSavingEvent ? <LoadingSpinner size={16} /> : null}
                {isSavingEvent ? 'Memproses...' : (eventModal.mode === 'add' ? 'Buat Event Baru' : 'Simpan Perubahan')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Pricing & History */}
      <div className="flex flex-col gap-6">
        {/* Pricing Configuration (Always Visible - Comparison Mode) */}
        <div className="bg-[#121214] border border-white/10 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="p-4 border-b border-white/10 bg-white/[0.02] flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#FF0033]">
              Konfigurasi Harga (Global)
            </h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/40 ml-1">Solo Price</label>
              <div className="relative">
                <PriceInput 
                  value={globalSettings.prices.regular_cheki_solo}
                  onChange={val => {
                    setGlobalSettings(prev => ({
                      ...prev,
                      prices: { ...prev.prices, regular_cheki_solo: val }
                    }));
                  }}
                  className="text-right pr-2 bg-[#0A0A0B] border border-white/20 rounded-lg px-3 py-2 text-sm"
                  colorClass="text-[#FF0033] font-bold"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white/20 pointer-events-none">Rp</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/40 ml-1">Group Price</label>
              <div className="relative">
                <PriceInput 
                  value={globalSettings.prices.regular_cheki_group}
                  onChange={val => {
                    setGlobalSettings(prev => ({
                      ...prev,
                      prices: { ...prev.prices, regular_cheki_group: val }
                    }));
                  }}
                  className="text-right pr-2 bg-[#0A0A0B] border border-white/20 rounded-lg px-3 py-2 text-sm"
                  colorClass="text-[#FF0033] font-bold"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white/20 pointer-events-none">Rp</span>
              </div>
            </div>
          </div>
          <div className="px-4 pb-4">
            <button 
              onClick={updateGlobalSettings}
              disabled={isSavingGlobalSettings}
              className={`w-full py-3 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${isSavingGlobalSettings ? 'bg-indigo-900/50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20'}`}
            >
              {isSavingGlobalSettings ? <LoadingSpinner size={16} /> : null}
              {isSavingGlobalSettings ? 'Menyimpan...' : 'Perbarui Harga Standar'}
            </button>
          </div>
        </div>

        {/* Event History */}
        <div className="flex-1 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 ml-1">Riwayat Event</h3>
          <div className="space-y-3">
            {events.map((ev) => (
              <div 
                key={ev.id} 
                className="bg-[#121214] border border-white/10 p-5 rounded-2xl group hover:border-[#FF0033]/40 hover:bg-white/[0.03] transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-lg text-white group-hover:text-[#FF0033] transition-colors leading-tight">
                        {ev.name}
                      </h4>
                      <div className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                        ev.status === 'ongoing' 
                          ? 'bg-[#FF0033]/10 text-[#FF0033] border-[#FF0033]/20' 
                          : 'bg-white/10 text-white/40 border-white/10'
                      }`}>
                        {ev.status}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest leading-none mb-1">Solo</span>
                          <span className="text-sm font-black text-white/80 tracking-tight">
                            Rp {(globalSettings.prices.regular_cheki_solo / 1000)}K
                          </span>
                        </div>
                        <div className="w-[1px] h-6 bg-white/5" />
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest leading-none mb-1">Group</span>
                          <span className="text-sm font-black text-white/80 tracking-tight">
                            Rp {(globalSettings.prices.regular_cheki_group / 1000)}K
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-white/40">
                        <div className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="text-xs font-medium tabular-nums">{ev.event_date || 'No Date'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <div className="flex gap-1.5 p-1.5 bg-black/40 rounded-xl border border-white/5">
                      <button 
                        onClick={() => handleExport(ev.id, 'excel')}
                        disabled={exportingId === ev.id}
                        className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all duration-300"
                        title="Export Excel"
                      >
                        {exportingId === ev.id && exportType === 'excel' ? <RefreshCcw size={16} className="animate-spin" /> : <Download size={16} />}
                      </button>
                      <button 
                        onClick={() => handleExport(ev.id, 'pdf')}
                        disabled={exportingId === ev.id}
                        className="p-2.5 bg-[#FF0033]/10 text-[#FF0033] rounded-lg hover:bg-[#FF0033] hover:text-white transition-all duration-300"
                        title="Export PDF"
                      >
                        {exportingId === ev.id && exportType === 'pdf' ? <RefreshCcw size={16} className="animate-spin" /> : <FileText size={16} />}
                      </button>
                    </div>
                    
                    <div className="flex gap-1.5 p-1.5 bg-black/40 rounded-xl border border-white/5">
                      <button 
                        onClick={() => openEventModal('edit', ev)}
                        className={`p-2.5 rounded-lg transition-all duration-300 ${
                          eventModal.data?.id === ev.id 
                            ? 'bg-white text-black' 
                            : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                        }`}
                        title="Settings"
                      >
                        <Settings size={16} />
                      </button>
                      <button 
                        disabled={deletingId === ev.id}
                        onClick={() => deleteEvent(ev.id)}
                        className={`p-2.5 rounded-lg transition-all duration-300 ${
                          deletingId === ev.id 
                            ? 'bg-white/5 text-white/20' 
                            : 'bg-white/5 text-white/40 hover:bg-red-500 hover:text-white'
                        }`}
                        title="Delete"
                      >
                        {deletingId === ev.id ? <RefreshCcw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div className="text-center py-12 bg-[#121214] border border-white/10 rounded-xl">
                <p className="text-white/20 text-xs uppercase tracking-widest">Event tidak ditemukan</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default SettingsSection;
