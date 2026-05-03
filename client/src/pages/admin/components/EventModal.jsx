import React from 'react';
import DatePicker from '../../../components/DatePicker';
import PriceInput from './PriceInput';
import LoadingSpinner from './LoadingSpinner';

const EventModal = ({
  eventModal,
  setEventModal,
  modalTab,
  setModalTab,
  eventForm,
  setEventForm,
  membersList,
  handleEventSubmit,
  isSavingEvent,
  globalSettings
}) => {
  if (!eventModal.show) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div 
         onClick={() => setEventModal({ show: false, mode: 'add', data: null })}
         className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <div className="relative bg-[#121214] border border-white/10 rounded-xl w-full max-w-md shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden">
         {/* Modal Header */}
         <div className="p-5 pb-0">
            <h3 className="text-lg font-bold mb-0.5">{eventModal.mode === 'add' ? 'Event Baru' : 'Edit Event'}</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">Konfigurasi detail event di bawah ini.</p>
            
            {/* Tab Switcher */}
            <div className="flex gap-1 bg-[#0A0A0B] p-1 rounded-lg border border-white/10 mb-5">
               <button 
                  onClick={() => setModalTab('info')}
                  className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${modalTab === 'info' ? 'bg-white/10 text-white shadow-sm' : 'text-white/30 hover:text-white/50'}`}
               >
                  Info Event
               </button>
               <button 
                  onClick={() => setModalTab('lineup')}
                  className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${modalTab === 'lineup' ? 'bg-white/10 text-white shadow-sm' : 'text-white/30 hover:text-white/50'}`}
               >
                  Lineup & Harga
               </button>
            </div>
         </div>
         
         <div className="flex-1 overflow-y-auto px-5 custom-scrollbar pb-5">
            <div className="space-y-4">
               {modalTab === 'info' ? (
                  <div className="space-y-4 animate-in fade-in duration-300">
                     <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-white/40 ml-1">Nama Event</label>
                        <input 
                           value={eventForm.name}
                           onChange={e => setEventForm(prev => ({...prev, name: e.target.value}))}
                           placeholder="mosing privat"
                           className="w-full bg-[#0A0A0B] border border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-white/50"
                        />
                     </div>



                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-xs font-semibold text-white/40 ml-1">Tanggal</label>
                           <DatePicker 
                              value={eventForm.date}
                              onChange={val => setEventForm(prev => ({...prev, date: val}))}
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-xs font-semibold text-white/40 ml-1">Batas PO</label>
                           <DatePicker 
                              value={eventForm.po_deadline}
                              onChange={val => setEventForm(prev => ({...prev, po_deadline: val}))}
                              align="right"
                           />
                        </div>
                     </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-white/40 ml-1">Waktu</label>
                              <input 
                                 value={eventForm.time}
                                 onChange={e => setEventForm(prev => ({...prev, time: e.target.value}))}
                                 placeholder="Contoh: 19:00 WIB"
                                 className="w-full bg-[#0A0A0B] border border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-white/50"
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-white/40 ml-1">Lokasi</label>
                              <input 
                                 value={eventForm.location}
                                 onChange={e => setEventForm(prev => ({...prev, location: e.target.value}))}
                                 placeholder="Contoh: Surabaya"
                                 className="w-full bg-[#0A0A0B] border border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-white/50"
                              />
                           </div>
                        </div>

                     <div className="grid grid-cols-2 gap-4">

                        <div className="space-y-1.5">
                           <label className="text-xs font-semibold text-white/40 ml-1">Status</label>
                           <div className="flex bg-[#0A0A0B] rounded-lg p-1 border border-white/20">
                              <button 
                                 onClick={() => setEventForm(prev => ({...prev, status: 'ongoing'}))}
                                 className={`flex-1 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${eventForm.status === 'ongoing' ? 'bg-green-600 text-white' : 'text-white/40 hover:text-white'}`}
                              >
                                 Ongoing
                              </button>
                              <button 
                                 onClick={() => setEventForm(prev => ({...prev, status: 'done'}))}
                                 className={`flex-1 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${eventForm.status === 'done' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'}`}
                              >
                                 Done
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="space-y-5 animate-in fade-in duration-300">
                     {/* Member Lineup Group */}
                     <div className="space-y-3">
                        <div className="flex justify-between items-end">
                           <label className="text-xs font-bold text-[#FF0033] uppercase ml-1">Daftar Member</label>
                           <button 
                                 onClick={() => setEventForm(prev => ({...prev, available_members: ['GROUP', ...membersList.map(m => m.nickname)]}))}
                              className="text-[10px] uppercase font-bold text-white/40 hover:text-white transition-colors"
                           >
                              Pilih Semua
                           </button>
                        </div>
                        <div className="grid grid-cols-4 gap-2 bg-[#0A0A0B] p-2 rounded-lg border border-white/10">
                           {membersList.map(m => (
                              <button
                                 key={m.id}
                                 type="button"
                                 onClick={() => {
                                    const isSelected = eventForm.available_members.includes(m.nickname);
                                    setEventForm(prev => ({
                                       ...prev,
                                       available_members: isSelected 
                                          ? prev.available_members.filter(nm => nm !== m.nickname)
                                          : [...prev.available_members, m.nickname]
                                    }));
                                 }}
                                 className={`py-1 rounded text-[10px] font-bold uppercase transition-all ${
                                    eventForm.available_members.includes(m.nickname)
                                       ? 'bg-[#FF0033] text-white shadow-lg shadow-[#FF0033]/20'
                                       : 'bg-white/5 text-white/40 hover:bg-white/10'
                                 }`}
                              >
                                 {m.nickname}
                              </button>
                           ))}
                           <button
                              type="button"
                              onClick={() => {
                                 const isSelected = eventForm.available_members.includes('GROUP');
                                 setEventForm(prev => ({
                                    ...prev,
                                    available_members: isSelected 
                                       ? prev.available_members.filter(nm => nm !== 'GROUP')
                                       : [...prev.available_members, 'GROUP']
                                 }));
                              }}
                              className={`col-span-4 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                                 eventForm.available_members.includes('GROUP')
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                                    : 'bg-white/5 text-white/40 hover:bg-white/10'
                              }`}
                           >
                              GROUP
                           </button>
                        </div>
                     </div>


                  </div>
               )}
            </div>
         </div>
         
         {/* Footer / Actions */}
         <div className="p-5 border-t border-white/10 bg-white/[0.02] flex gap-3">
            <button 
               onClick={() => setEventModal({ show: false, mode: 'add', data: null })}
               className="flex-1 py-3 bg-[#0A0A0B] border border-white/20 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition-colors"
            >
               Batal
            </button>
            <button
               onClick={handleEventSubmit}
               disabled={isSavingEvent}
               className={`flex-2 py-3 px-8 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
               isSavingEvent 
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : eventModal.mode === 'add' 
                     ? 'bg-gradient-to-r from-[#FF0033] to-purple-600 text-white hover:scale-[1.02] active:scale-[0.98] shadow-[#FF0033]/20'
                     : 'bg-white text-black hover:bg-gray-200'
               }`}
            >
               {isSavingEvent && <LoadingSpinner size={16} />}
               {isSavingEvent ? 'Memproses...' : (eventModal.mode === 'add' ? 'Buat Event' : 'Simpan')}
            </button>
         </div>
      </div>
    </div>
  );
};

export default EventModal;
