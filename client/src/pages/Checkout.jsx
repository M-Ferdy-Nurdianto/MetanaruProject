import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, ChevronLeft, CreditCard, Send, Sparkles, 
  CheckCircle2, QrCode, Trash2, Camera, Upload, Image as ImageIcon,
  User, Instagram, MessageCircle, FileText, Calendar
} from 'lucide-react';
import { members } from '../constants';
import { API_URL, fetchEvents } from '../api';
import Toast from '../components/Toast';
import html2canvas from 'html2canvas';

const Checkout = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const receiptRef = useRef(null);
  
  const [cart, setCart] = useState([]);
  const [liveEvents, setLiveEvents] = useState([]);

  // Helper to get price from live data
  const getItemPrice = (item, eventId) => {
    if (!eventId) return item.price;
    const event = liveEvents.find(e => e.id.toString() === eventId.toString());
    if (!event || event.type === 'standard') return item.price;

    const memberName = item.member?.nickname || item.name.split(' ')[0];
    if (item.type === 'solo' && event.special_prices && event.special_prices[memberName]) {
        return event.special_prices[memberName];
    }
    if (item.type === 'group' && event.special_prices?.['GROUP']) {
        return event.special_prices['GROUP'];
    }
    return item.price;
  };
  const [isOrdered, setIsOrdered] = useState(false);
  const [showToast, setShowToast] = useState(null);
  
  const [formData, setFormData] = useState({
    nickname: '',
    contact: '',
    note: '',
    eventId: '',
    isDropdownOpen: false
  });
  
  const [proof, setProof] = useState({
    preview: null,
    compressed: null,
    isCompressing: false
  });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const savedCart = localStorage.getItem('metanaru_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    const loadEvents = async () => {
      try {
        const data = await fetchEvents();
        setLiveEvents(data);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    };
    loadEvents();
  }, []);

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    localStorage.setItem('metanaru_cart', JSON.stringify(newCart));
  };

  const total = cart.reduce((sum, item) => sum + getItemPrice(item, formData.eventId), 0);

  const handleSaveReceipt = async () => {
    if (!receiptRef.current) return;
    
    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#000000',
        scale: 2, // Higher quality
        logging: false,
        useCORS: true
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `METANARU-RECEIPT-${orderId.replace('#', '')}.png`;
      link.click();
      setShowToast("Nota berhasil disimpan ke Galeri!");
    } catch (err) {
      console.error("Save error:", err);
      setShowToast("Gagal menyimpan nota, coba screenshot manual ya Bos!");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProof(prev => ({ ...prev, isCompressing: true }));
    
    // Preview immediately
    const reader = new FileReader();
    reader.onload = (event) => {
      setProof(prev => ({ ...prev, preview: event.target.result }));
      
      // Compress
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Quality 0.7 for good balance
        canvas.toBlob((blob) => {
          setProof(prev => ({ 
            ...prev, 
            compressed: blob,
            isCompressing: false 
          }));
        }, 'image/jpeg', 0.7);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const isFormValid = formData.nickname && formData.contact && formData.eventId && proof.compressed && cart.length > 0;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmOrder = async () => {
    if (cart.length === 0) {
      setShowToast("Keranjang masih kosong, Bos!");
      return;
    }
    if (!formData.nickname) {
      setShowToast("Nama Panggilan harus diisi!");
      return;
    }
    if (!formData.contact) {
      setShowToast("Username IG / WA harus diisi!");
      return;
    }
    if (!formData.eventId) {
      setShowToast("Pilih event dulu ya!");
      return;
    }

    const selectedEvent = liveEvents.find(e => e.id.toString() === formData.eventId.toString());
    if (selectedEvent && selectedEvent.status === 'done') {
      setShowToast("Event sudah selesai, Bos!");
      return;
    }

    if (!proof.compressed) {
      setShowToast("Upload bukti bayar dulu, Bos!");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload proof image to Supabase Storage
      let proofUrl = null;
      if (proof.compressed) {
        const uploadData = new FormData();
        uploadData.append('proof', proof.compressed, 'proof.jpg');
        const uploadRes = await fetch(`${API_URL}/orders/upload-proof`, {
          method: 'POST',
          body: uploadData
        });
        if (!uploadRes.ok) throw new Error('Gagal upload bukti bayar');
        const uploadResult = await uploadRes.json();
        proofUrl = uploadResult.url;
      }

      // 2. Build order items
      const groupedItems = Object.values(cart.reduce((acc, item) => {
        const key = `${item.name}-${item.type}`;
        if (!acc[key]) acc[key] = { member_id: item.member?.nickname || item.name, cheki_type: item.type, qty: 0 };
        acc[key].qty += 1;
        return acc;
      }, {}));

      // 3. Create order
      const orderRes = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: formData.nickname,
          contact: formData.contact,
          event_id: parseInt(formData.eventId),
          items: groupedItems,
          cheki_type: groupedItems[0]?.cheki_type || 'solo',
          qty: cart.length,
          mode: 'online',
          payment_method: 'transfer',
          payment_proof_url: proofUrl,
          note: formData.note
        })
      });

      if (!orderRes.ok) throw new Error('Gagal membuat pesanan');
      const orderData = await orderRes.json();

      setOrderId(`#M-${orderData.id}`);
      setIsOrdered(true);
      localStorage.removeItem('metanaru_cart');
    } catch (error) {
      console.error('Order error:', error);
      setShowToast(error.message || "Terjadi kesalahan, coba lagi!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative pt-28 pb-16 sm:pt-32 sm:pb-20 px-4 sm:px-6 md:px-12 bg-black overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[420px] bg-[#FF0033]/12 blur-[140px] pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        <button 
          onClick={() => navigate('/cheki')}
          className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-[#777] hover:text-white transition-colors mb-8"
        >
          <ChevronLeft size={14} /> KEMBALI
        </button>

        <AnimatePresence mode="wait">
          {!isOrdered ? (
            <motion.div
              key="order-slip"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 mb-8 sm:mb-10">
                 <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF0033]/80">METANARU / SECURE PAYMENT</p>
                   <h1 className="font-metal text-4xl sm:text-5xl md:text-6xl text-white mt-2 tracking-[0.12em]">Checkout</h1>
                 </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
                 {/* Left Column: Form */}
                  <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
                    {/* Data Pemesan */}
                    <div className="glass-card rounded-none p-5 sm:p-6 md:p-7 border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.25)] relative overflow-hidden">
                      <h2 className="text-xs font-black uppercase tracking-[0.22em] text-white mb-6 flex items-center gap-2">
                        <User size={15} className="text-[#FF0033]" /> Data Pemesan
                       </h2>
                       
                      <div className="space-y-5">
                           <div className="space-y-2">
                          <label className="text-[11px] font-black uppercase tracking-[0.18em] text-[#888]">Nama Panggilan</label>
                          <input type="text" name="nickname" value={formData.nickname} onChange={handleInputChange} placeholder="e.g. Budi Wota" className="w-full rounded-none bg-black/40 border border-white/10 focus:border-[#FF0033]/70 focus:bg-black/60 p-3.5 text-sm font-semibold text-white placeholder:text-white/25 outline-none transition-all" />
                           </div>
                           <div className="space-y-2">
                          <label className="text-[11px] font-black uppercase tracking-[0.18em] text-[#888]">Username IG / WA</label>
                          <input type="text" name="contact" value={formData.contact} onChange={handleInputChange} placeholder="@username / 0812..." className="w-full rounded-none bg-black/40 border border-white/10 focus:border-[#FF0033]/70 focus:bg-black/60 p-3.5 text-sm font-semibold text-white placeholder:text-white/25 outline-none transition-all" />
                           </div>
                           <div className="space-y-2 relative group/select">
                          <label className="text-[11px] font-black uppercase tracking-[0.18em] text-[#888]">Pilih Event</label>
                              <div className="relative">
                            <div onClick={() => setFormData(prev => ({ ...prev, isDropdownOpen: !prev.isDropdownOpen }))} className="w-full rounded-none bg-black/40 border border-white/10 hover:border-[#FF0033]/70 hover:bg-black/60 p-3.5 text-sm font-semibold text-white cursor-pointer flex justify-between items-center transition-all">
                                    <span className={!formData.eventId ? "text-white/20" : "text-[#fff500]"}>
                                       {formData.eventId ? liveEvents.find(e => e.id.toString() === formData.eventId.toString())?.name : "-- Pilih Event --"}
                                    </span>
                                    <motion.div animate={{ rotate: formData.isDropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                       <ChevronLeft size={14} className="-rotate-90 text-[#FF0033]" />
                                    </motion.div>
                                 </div>
                                 <AnimatePresence>
                                    {formData.isDropdownOpen && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 w-full mt-2 bg-[#111] border border-white/10 shadow-2xl overflow-hidden z-[100] rounded-none">
                                          {liveEvents.map(ev => {
                                             const isCompleted = ev.status === 'done';
                                             return (
                                      <div key={ev.id} onClick={() => { if (isCompleted) { setShowToast("Event sudah selesai, Bos!"); return; } setFormData(prev => ({ ...prev, eventId: ev.id, isDropdownOpen: false })); }} className={`p-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors border-b border-white/5 last:border-0 flex justify-between items-center ${isCompleted ? 'bg-black/80 text-white/20 cursor-not-allowed' : 'text-white hover:bg-[#FF0033]/15 cursor-pointer'}`}>
                                                  <span>{ev.name}</span>
                                        <span className={`text-[9px] px-2 py-1 ${isCompleted ? 'bg-white/5' : 'bg-[#FF0033]/15 text-[#FF0033]'}`}>{isCompleted ? 'SELESAI' : ev.date}</span>
                                               </div>
                                             );
                                          })}
                                       </motion.div>
                                    )}
                                 </AnimatePresence>
                              </div>
                           </div>
                           <div className="space-y-2">
                          <label className="text-[11px] font-black uppercase tracking-[0.18em] text-[#888]">Catatan (Opsional)</label>
                          <textarea name="note" value={formData.note} onChange={handleInputChange} placeholder="Contoh: Vivi 1S (Titip/Tidak Datang)." className="w-full rounded-none bg-black/40 border border-white/10 focus:border-[#FF0033]/70 focus:bg-black/60 p-3.5 text-sm font-semibold text-white placeholder:text-white/25 outline-none transition-all resize-none h-24 custom-scrollbar" />
                           </div>
                       </div>
                    </div>

                 </div>

                 {/* Right Column: Upload & Summary */}
                 <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
                    {/* Bukti Pembayaran */}
                    <div className="glass-card rounded-none p-5 sm:p-6 md:p-7 border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.25)] relative overflow-hidden">
                      <h2 className="text-xs font-black uppercase tracking-[0.22em] text-white mb-5 flex items-center gap-2">
                        <Camera size={15} className="text-[#fff500]" /> Bukti Pembayaran
                      </h2>
                      <div onClick={() => fileInputRef.current.click()} className="relative w-full h-[150px] sm:h-[180px] bg-[#050505] border-2 border-dashed border-white/10 rounded-none flex flex-col items-center justify-center cursor-pointer hover:border-[#FF0033]/70 hover:bg-white/5 transition-all group overflow-hidden">
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                        {proof.preview ? (
                          <>
                            <img src={proof.preview} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-20 transition-opacity blur-[1px]" alt="Proof Background" />
                            <div
                              onClick={(event) => {
                                event.stopPropagation();
                                setIsPreviewOpen(true);
                              }}
                              className="relative z-10 max-w-[85%] max-h-[85%] border border-white/10 shadow-2xl cursor-zoom-in"
                              role="button"
                              tabIndex={0}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  setIsPreviewOpen(true);
                                }
                              }}
                            >
                              <img src={proof.preview} className="w-full h-full object-contain" alt="Proof" />
                            </div>
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-[2px]">
                              <div className="bg-[#FF0033] text-white p-3 mb-3 transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 shadow-[0_0_20px_rgba(255,0,51,0.35)]">
                                <Upload size={22} />
                              </div>
                              <span className="text-[10px] font-black text-white uppercase tracking-[0.28em]">Ganti Foto</span>
                            </div>
                            {proof.isCompressing && (
                              <div className="absolute inset-0 bg-black/90 z-30 flex items-center justify-center backdrop-blur-sm">
                                <span className="text-sm font-metal text-[#fff500] tracking-widest animate-pulse">OPTIMIZING...</span>
                              </div>
                            )}
                            <div className="absolute top-3 right-3 bg-[#fff500] text-black px-2.5 py-1 text-[9px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(255,245,0,0.2)] z-20">READY</div>
                          </>
                        ) : (
                          <div className="text-center p-6 relative z-10 flex flex-col items-center">
                            <div className="w-12 h-12 bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-[#FF0033]/15 transition-all duration-300 border border-white/5 group-hover:border-[#FF0033]/30">
                              <Upload size={22} className="text-white/40 group-hover:text-[#FF0033] transition-colors" />
                            </div>
                            <p className="text-xs font-black text-white uppercase tracking-[0.28em] mb-2 leading-none">Upload Bukti</p>
                            <p className="text-[9px] font-bold text-[#888] tracking-widest uppercase">JPG / PNG / Screenshot</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="glass-card rounded-none p-5 sm:p-6 md:p-7 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.45)] lg:sticky lg:top-8 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF0033]/10 blur-[40px] pointer-events-none" />
                       
                      <h2 className="text-xs font-black uppercase tracking-[0.22em] text-white mb-5 pb-4 border-b border-white/10 flex items-center justify-between">
                          <span>Ringkasan</span>
                        <span className="text-[9px] text-[#fff500] bg-[#fff500]/10 px-3 py-1 border border-[#fff500]/20">{cart.length} ITEMS</span>
                       </h2>

                      <div className="space-y-4 mb-7 min-h-[140px] max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                          {Object.values(cart.reduce((acc, item) => {
                            const key = `${item.name}-${item.type}`;
                            if (!acc[key]) acc[key] = { ...item, qty: 0 };
                            acc[key].qty += 1;
                            return acc;
                          }, {})).map((item, idx) => (
                         <div key={idx} className="flex justify-between text-[11px] font-semibold uppercase text-white group/item items-center">
                               <div className="flex items-center gap-3">
                                  <span className="tracking-widest">{item.name}</span>
                             <span className="text-[#fff500] text-[9px] px-1.5 py-0.5 bg-[#fff500]/10">x{item.qty}</span>
                               </div>
                               <div className="flex items-center gap-4">
                                  <span className="text-[#888]">{(item.price * item.qty)/1000}K</span>
                                  <button onClick={() => {
                                       const newCart = cart.filter(i => `${i.name}-${i.type}` !== `${item.name}-${item.type}`);
                                       setCart(newCart);
                                       localStorage.setItem('metanaru_cart', JSON.stringify(newCart));
                                    }} className="opacity-0 group-hover/item:opacity-100 text-[#FF0033] hover:scale-110 transition-transform">
                                     <Trash2 size={12} />
                                  </button>
                               </div>
                            </div>
                          ))}
                       </div>

                      <div className="mt-6 pt-6 border-t border-[#FF0033]/25 mb-7">
                          <div className="flex justify-between items-end">
                          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#888] mb-1">Grand Total</span>
                          <span className="text-2xl sm:text-3xl font-metal text-[#FF0033] drop-shadow-[0_0_10px_rgba(255,0,51,0.15)] tracking-[0.2em]">IDR {total/1000}K</span>
                          </div>
                       </div>

                      <button onClick={handleConfirmOrder} disabled={isSubmitting} className={`w-full bg-white text-black py-4 font-black text-[11px] tracking-[0.35em] uppercase hover:bg-[#FF0033] hover:text-white hover:shadow-[0_0_30px_rgba(255,0,51,0.35)] transition-all duration-500 relative group overflow-hidden rounded-none ${isSubmitting ? 'opacity-50 cursor-wait' : ''}`}>
                          <span className="relative z-10 flex items-center justify-center gap-3">
                            {isSubmitting ? 'MEMPROSES...' : 'PAY NOW'} <Send size={14} className="group-hover:translate-x-2 transition-transform" />
                          </span>
                       </button>

                      <p className="text-[9px] font-bold text-[#555] text-center mt-6 uppercase tracking-[0.25em] flex items-center justify-center gap-2">
                          <Sparkles size={10} /> Fast compression enabled
                       </p>
                    </div>
                 </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="success-slip" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
               <motion.div
                 ref={receiptRef}
                 initial={{ y: 30, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 className="bg-black border-2 border-[#FF0033] p-8 md:p-12 relative overflow-hidden print-only shadow-[0_0_50px_rgba(255,0,51,0.2)]"
               >
                  <div className="absolute top-0 left-0 w-full h-2 bg-[#FF0033]" />
                  <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#FF0033]/10 blur-[80px] pointer-events-none" />
                  
                  {/* Success Stamp Overlay */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
                     <motion.div 
                       initial={{ scale: 2, opacity: 0, rotate: -30 }}
                       animate={{ scale: 1, opacity: 1, rotate: -15 }}
                       transition={{ type: 'spring', damping: 10, delay: 0.5 }}
                       className="font-metal text-6xl md:text-8xl text-[#FF0033]/10 uppercase border-[10px] border-[#FF0033]/10 p-6 tracking-widest backdrop-blur-sm"
                     >
                        CONFIRMED
                     </motion.div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12 border-b border-white/10 pb-8 relative z-10">
                    <div>
                       <h1 className="font-metal text-5xl md:text-6xl text-white mb-2 tracking-wider">E-TICKET.</h1>
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF0033]">METANARU OFFICIAL</p>
                    </div>
                    <div className="text-left md:text-right">
                       <p className="text-[8px] font-black uppercase text-[#888] mb-2 leading-none tracking-widest">ORDER ID</p>
                       <p className="text-xl md:text-2xl font-black text-[#fff500] tracking-widest bg-white/5 px-4 py-2 border border-white/10">{orderId}</p>
                    </div>
                  </div>

                  <div className="mb-12 space-y-6 relative z-10">
                     <div className="bg-[#111] p-6 md:p-8 border border-white/5 shadow-inner">
                        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#888]">Rincian Pesanan</span>
                        </div>
                        <div className="space-y-4">
                           {Object.values(cart.reduce((acc, item) => {
                             const key = `${item.name}-${item.type}`;
                             if (!acc[key]) acc[key] = { ...item, qty: 0 };
                             acc[key].qty += 1;
                             return acc;
                           }, {})).map((item, idx) => (
                             <div key={idx} className="flex justify-between text-xs md:text-sm font-black uppercase text-white">
                                <span className="tracking-widest">{item.name} <span className="text-[#fff500] ml-2 bg-[#fff500]/10 px-2 py-0.5">x{item.qty}</span></span>
                                <span className="text-[#888]">{(getItemPrice(item, formData.eventId) * item.qty)/1000}K</span>
                             </div>
                           ))}
                        </div>
                        <div className="mt-8 pt-6 border-t border-[#FF0033]/30 flex justify-between items-center">
                           <span className="text-[10px] font-black uppercase tracking-widest text-[#888]">Total Paid</span>
                           <span className="text-3xl md:text-4xl font-metal text-[#FF0033] tracking-widest">IDR {total/1000}K</span>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#111] p-6 border border-white/5">
                           <p className="text-[8px] font-black uppercase tracking-widest text-[#888] mb-3 flex items-center gap-2"><User size={10} className="text-[#FF0033]" /> Pemesan</p>
                           <p className="text-sm font-black uppercase text-white tracking-widest">{formData.nickname}</p>
                        </div>
                        <div className="bg-[#111] p-6 border border-white/5">
                           <p className="text-[8px] font-black uppercase tracking-widest text-[#888] mb-3 flex items-center gap-2"><Calendar size={10} className="text-[#FF0033]" /> Event</p>
                           <p className="text-sm font-black uppercase text-[#fff500] tracking-widest">
                              {liveEvents.find(e => e.id.toString() === formData.eventId.toString())?.name}
                           </p>
                        </div>
                     </div>
                  </div>

                  <div className="text-center py-6 border-t border-white/10 relative z-10 bg-[#FF0033]/5 border-dashed">
                     <p className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-white flex items-center justify-center gap-3">
                        <CheckCircle2 size={16} className="text-[#FF0033]" /> Tunjukkan E-Ticket ini di Booth
                     </p>
                     <p className="text-[9px] font-bold text-[#FF0033] mt-3 uppercase tracking-[0.2em]">
                        Booth Collection Only - Event Day
                     </p>
                  </div>
               </motion.div>

               <div className="flex flex-col sm:flex-row gap-4 no-print relative z-10">
                  <button 
                    onClick={handleSaveReceipt}
                    className="flex-1 bg-[#fff500] text-black py-5 font-black text-[10px] tracking-widest uppercase shadow-[0_0_20px_rgba(255,245,0,0.2)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                  >
                     <ImageIcon size={16} /> UNDUH TIKET (PNG)
                  </button>
                  <button 
                    onClick={() => navigate('/')}
                    className="flex-1 bg-white/5 text-white py-5 font-black text-[10px] tracking-widest uppercase border border-white/10 hover:bg-[#FF0033] hover:border-[#FF0033] transition-all"
                  >
                     KEMBALI KE HOME
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showToast && (
            <Toast 
              message={showToast} 
              type="error"
              onClose={() => setShowToast(null)} 
            />
          )}
        </AnimatePresence>

        {proof.preview && isPreviewOpen && (
          <div
            className="fixed inset-0 z-[80] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setIsPreviewOpen(false)}
          >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setIsPreviewOpen(false);
              }}
              className="absolute top-6 right-6 text-[#FF0033] font-black text-xs tracking-widest"
            >
              [ TUTUP ]
            </button>
            <img
              src={proof.preview}
              alt="Preview Bukti"
              className="max-h-[85vh] max-w-[90vw] border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.6)]"
              onClick={(event) => event.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;










