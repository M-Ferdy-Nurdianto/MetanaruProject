import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { PRICING, members } from '../constants';
import { useNavigate } from 'react-router-dom';
import { fetchMembers, fetchEvents } from '../api';
import Loading from '../components/Loading';
import Toast from '../components/Toast';

const Cheki = () => {
  const [cart, setCart] = useState([]);
  const [membersList, setMembersList] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const IS_MAINTENANCE = false; // System is now active

  useEffect(() => {
    const loadData = async () => {
      try {
        const [mems, evs] = await Promise.all([
          fetchMembers(),
          fetchEvents()
        ]);
        
        // Find active event
        const active = evs?.find(e => e.status === 'ongoing' || e.is_active) || evs?.[0];
        setActiveEvent(active);
        setEvents(evs || []);

        const finalMembers = (mems && mems.length > 0) ? mems : members;
        const sorted = [...finalMembers].sort((a, b) => {
          if (a.name === 'NOT SIGNAL') return 1;
          if (b.name === 'NOT SIGNAL') return -1;
          return a.id - b.id;
        });
        setMembersList(sorted.map(m => ({ ...m, themeColor: m.theme_color || m.themeColor || '#FF0033' })));
      } catch (err) {
        console.error('Error loading cheki data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);



  const addToCart = (item) => {
    setCart([...cart, { ...item, cartId: Date.now() }]);
    setToast({ message: `${item.name} DITAMBAHKAN KE KERANJANG`, type: 'success' });
  };

  const removeFromCart = (cartId) => {
    const item = cart.find(i => i.cartId === cartId);
    setCart(cart.filter(item => item.cartId !== cartId));
    if (item) setToast({ message: `${item.name} DIHAPUS`, type: 'info' });
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    localStorage.setItem('metanaru_cart', JSON.stringify(cart));
    navigate('/checkout');
  };

  if (loading) return <Loading />;

  return (
    <div className="bg-black min-h-screen">
      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
      <Helmet>
        <title>Cheki Station | METANARU Official</title>
        <meta name="description" content="Amankan slot Cheki favoritmu di Metanaru Cheki Station." />
      </Helmet>

      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden mb-12 sm:mb-16">
        {/* Smoother, Multi-layered Hero Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(255,0,51,0.12)_0%,_transparent_80%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none"></div>
        
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FF0033]/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#fff500]/30 to-transparent"></div>
        
        
        <div className="container mx-auto px-4 relative z-10 text-center sm:text-left sm:pl-12">
           <div className="border-l-4 sm:border-l-8 border-[#FF0033] pl-4 sm:pl-8 inline-block">
              <h1 className="text-4xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter text-white italic text-gradient leading-none">
                 Cheki Station
              </h1>
              <p className="text-[#fff500] font-black uppercase tracking-[0.25em] sm:tracking-[0.4em] text-[10px] sm:text-sm mt-3 drop-shadow-[0_0_8px_rgba(255,245,0,0.4)]">Amankan Slot Cheki Anda Sekarang</p>
           </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-7xl relative">
        {/* Subtle Red Highlight for Content Area */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-[radial-gradient(circle_at_50%_50%,_rgba(255,0,51,0.06)_0%,_transparent_100%)] pointer-events-none"></div>

        {IS_MAINTENANCE && (
           <div className="mb-12 glass-card p-6 border-l-4 border-[#FF0033] bg-[#FF0033]/5 animate-pulse">
              <h3 className="text-[#FF0033] font-black uppercase tracking-widest text-lg">ORDER SYSTEM OFFLINE</h3>
              <p className="text-[#888] text-xs font-bold uppercase mt-2 tracking-widest">
                 Layanan pemesanan sedang ditutup sementara (Status Hiatus). Nantikan informasi selanjutnya.
              </p>
           </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">
          
          {/* MAIN CONTENT - SELECTION */}
          <div className="lg:col-span-8 space-y-10 sm:space-y-16">
            
            {/* 1. GROUP CHEKI BANNER */}
            <div className="relative group overflow-hidden glass-card p-1 border-[#FF0033]/20 shadow-[0_0_20px_rgba(255,245,0,0.1)]">
               <div className="relative aspect-[16/9] sm:aspect-[21/9] md:aspect-[21/7] bg-[#111] overflow-hidden flex items-center px-5 sm:px-8 md:px-12">
                  {/* Individual Gold Highlight - Always Visible */}
                  
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10"></div>
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 p-4 sm:p-8 z-0 opacity-10">
                     <span className="text-[96px] sm:text-[150px] font-black italic">GRUP</span>
                  </div>

                  <div className="relative z-20 max-w-[260px] sm:max-w-md">
                     <span className="bg-[#fff500] text-black text-[9px] sm:text-[10px] font-black px-3 sm:px-4 py-1 tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(255,245,0,0.3)]">Best Value Deal</span>
                     <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white uppercase mt-4 tracking-tighter leading-none">
                        Group Cheki
                     </h2>
                     <p className="text-[#888] font-bold text-[10px] sm:text-xs uppercase mt-4 tracking-widest leading-relaxed">
                        Abadikan momen bersama seluruh personel Metanaru dalam satu frame.
                     </p>
                     <div className="flex flex-wrap items-center gap-4 sm:gap-8 mt-6 sm:mt-8">
                         <div className="text-2xl sm:text-3xl font-black text-white italic">IDR {PRICING.REGULAR_GROUP.toLocaleString('id-ID')}</div>
                         <button 
                           onClick={() => !IS_MAINTENANCE && addToCart({ name: 'GROUP CHEKI', price: PRICING.REGULAR_GROUP, type: 'GROUP' })}
                           disabled={IS_MAINTENANCE}
                           className={`px-6 sm:px-8 py-2.5 sm:py-3 font-black text-[11px] sm:text-xs uppercase tracking-widest transition-all ${
                             IS_MAINTENANCE 
                             ? 'bg-[#1a1a1a] text-[#444] cursor-not-allowed border border-white/5' 
                             : 'bg-white text-black hover:bg-[#FF0033] hover:text-white'
                           }`}>
                           {IS_MAINTENANCE ? 'NOT AVAILABLE' : '+ TAMBAH'}
                         </button>
                      </div>
                  </div>
               </div>
            </div>

            {/* 2. MEMBER SOLO GRID */}
            <div>
               <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-10">
                  <h3 className="text-2xl sm:text-3xl font-black uppercase italic text-white tracking-tight">2-Shot / Solo</h3>
                  <div className="h-[2px] flex-grow bg-white/5"></div>
               </div>
               
               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                   {membersList.filter(m => m.name !== 'NOT SIGNAL').map((member) => (
                     <div key={member.id} className="relative group flex flex-col">
                         {/* Background Gold Glow */}
                         <div className="absolute -inset-4 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,245,0,0.15)_0%,_transparent_70%)] blur-2xl pointer-events-none z-0"></div>
                         <div className="glass-card group-hover:border-[#FF0033]/40 transition-all duration-500 overflow-hidden flex flex-col shadow-[0_0_15px_rgba(255,245,0,0.05)] relative z-10 bg-black/60">
                        <div className="aspect-[3/4] bg-gradient-to-t from-[#0a0a0a] to-[#111] relative overflow-hidden flex items-center justify-center p-4">
                           {/* Individual Gold Highlight - Always Visible */}
                           
                           {/* Subtle Gold Edge Glow */}
                           <div className="absolute inset-0 border border-[#fff500]/5 pointer-events-none"></div>
                           
                           <img 
                             src={`/photo/members/${member.name.toLowerCase()}.${member.name.toLowerCase() === 'joy' || member.name.toLowerCase() === 'fay' ? 'jpg' : 'webp'}`}
                             alt={member.name}
                             className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 grayscale group-hover:grayscale-0 scale-100 z-0"
                             onLoad={(e) => {
                               if (e.target.nextSibling) e.target.nextSibling.style.display = 'none';
                             }}
                             onError={(e) => {
                               e.target.style.display = 'none';
                               if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                             }}
                           />
                           <span className="text-6xl font-black opacity-10 group-hover:opacity-100 group-hover:text-[#FF0033] transition-all duration-700 relative z-10" style={{ color: member.themeColor }}>
                               {member.symbol}
                           </span>
                           <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent z-20">
                              <div className="text-lg sm:text-2xl font-black text-white uppercase italic tracking-tighter">{member.nickname || member.name}</div>
                              <div className="text-[8px] sm:text-[9px] font-bold text-[#FF0033] uppercase tracking-widest mt-1">{member.vibe}</div>
                           </div>
                        </div>
                        <div className="p-4 sm:p-6 bg-[#050505] flex justify-between items-center border-t border-white/5">
                           <div className="text-xs sm:text-sm font-black text-white uppercase italic">
                              IDR {(activeEvent?.special_solo_price || PRICING.REGULAR_SOLO).toLocaleString('id-ID')}
                           </div>
                            <button 
                              onClick={() => !IS_MAINTENANCE && addToCart({ name: member.nickname || member.name, price: activeEvent?.special_solo_price || PRICING.REGULAR_SOLO, type: 'SOLO', member_id: member.id })}
                              disabled={IS_MAINTENANCE}
                              className={`w-10 h-10 rounded-none flex items-center justify-center font-black text-lg transition-all ${
                                IS_MAINTENANCE 
                                ? 'bg-[#1a1a1a] text-[#333] cursor-not-allowed' 
                                : 'bg-white text-black hover:bg-[#FF0033] hover:text-white'
                              }`}>
                               {IS_MAINTENANCE ? '×' : '+'}
                            </button>
                         </div>
                     </div>
                  </div>
                  ))}
               </div>
            </div>

          </div>

          {/* SIDEBAR - CART / CHECKOUT */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32 glass-card p-6 sm:p-8 md:p-10 border-white/10 flex flex-col gap-8">
               <div className="flex flex-col gap-2 border-b border-white/10 pb-6">
                  <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight italic">Keranjang Belanja</h2>
                  <p className="text-[9px] sm:text-[10px] font-bold text-[#555] uppercase tracking-widest">Konfirmasi pesanan Anda</p>
               </div>

               <div className="flex flex-col gap-4 max-h-[30vh] sm:max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.length === 0 ? (
                    <div className="py-12 sm:py-20 text-center flex flex-col items-center gap-4 border border-dashed border-white/10 opacity-30">
                       <div className="text-4xl text-[#333]">∅</div>
                       <span className="text-[9px] font-black uppercase tracking-[0.3em]">Belum ada pesanan</span>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.cartId} className="flex justify-between items-center group">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{item.name}</span>
                            <span className="text-[9px] font-bold text-[#FF0033] uppercase">Rp {item.price.toLocaleString('id-ID')}</span>
                         </div>
                         <button 
                           onClick={() => removeFromCart(item.cartId)}
                                        className="text-[9px] font-black text-[#FF0033] bg-[#FF0033]/10 border border-[#FF0033]/30 hover:bg-[#FF0033] hover:text-white px-3 py-1.5 uppercase transition-all flex items-center gap-1">
                           <span className="text-sm leading-none">&times;</span> HAPUS
                         </button>
                      </div>
                    ))
                  )}
               </div>

                      <div className="flex flex-col gap-6 pt-8 sm:pt-10 border-t border-white/10 mt-auto">
                  <div className="flex justify-between items-end">
                     <span className="text-[10px] font-black text-[#555] uppercase tracking-widest">Total Pesanan</span>
                               <span className="text-2xl sm:text-3xl font-black text-[#fff500] italic leading-none drop-shadow-[0_0_10px_rgba(255,245,0,0.2)]">IDR {totalAmount.toLocaleString('id-ID')}</span>
                  </div>

                  <button 
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                              className={`w-full py-4 sm:py-5 font-black text-[11px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] transition-all duration-500 ${
                      cart.length > 0 
                      ? 'bg-[#FF0033] text-white shadow-[0_0_30px_rgba(255,0,51,0.4)] hover:scale-[1.02]' 
                      : 'bg-[#111] text-[#333] cursor-not-allowed'
                    }`}>
                    CHECKOUT SEKARANG
                  </button>
                  
                           <p className="text-[8px] sm:text-[9px] text-center text-[#444] font-bold uppercase tracking-widest leading-relaxed">
                     Lanjutkan ke WhatsApp untuk konfirmasi pembayaran & reservasi slot.
                  </p>
               </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Cheki;










