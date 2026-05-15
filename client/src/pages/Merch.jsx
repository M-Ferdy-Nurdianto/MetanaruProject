import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  ChevronRight, 
  Info, 
  AlertCircle, 
  Box, 
  Shirt, 
  Star,
  Clock,
  ArrowRight,
  Plus,
  Minus,
  Truck,
  Calendar,
  Gift,
  Zap
} from 'lucide-react';
import { supabase } from '../supabase';
import Loading from '../components/Loading';

const Merch = () => {
  const navigate = useNavigate();
  const [merch, setMerch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const fetchMerch = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('merchandise')
          .select('*')
          .eq('available', true)
          .order('urutan', { ascending: true });
        if (error) throw error;
        setMerch(data || []);
      } catch (error) {
        console.error('Error fetching merch:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMerch();
  }, []);

  const filteredMerch = merch.filter(item => 
    activeCategory === 'all' || item.category === activeCategory
  );

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-32 sm:pt-40 pb-20 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#FF0033]/20 to-transparent pointer-events-none" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-[#FF0033]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Anniversary Header */}
        <div className="mb-12 text-center" data-aos="fade-down">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-[#FF0033]/30 mb-6 backdrop-blur-md">
            <Zap className="text-[#FF0033]" size={14} fill="#FF0033" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">2nd ANNIVERSARY SPECIAL</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter mb-4 leading-none">
            PRE-ORDER <span className="text-[#FF0033] drop-shadow-[0_0_20px_rgba(255,0,51,0.6)]">MERCH</span>
          </h1>
          <p className="max-w-2xl mx-auto text-white/60 text-xs md:text-sm leading-relaxed italic">
            "Terima kasih karena tetap hadir, mendukung, percaya dan terus berjalan bersama METANARU."
          </p>
        </div>

        {/* Anniversary Info Guide */}
        <div className="max-w-5xl mx-auto mb-16" data-aos="fade-up">
          <div className="bg-[#0D0D0D] border border-white/10 rounded-[2.5rem] overflow-hidden relative">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[#FF0033]/5 to-transparent pointer-events-none" />
            
            <div className="p-8 sm:p-12 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Schedule & Freebies */}
                <div className="lg:col-span-7 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FF0033]/10 flex items-center justify-center text-[#FF0033] border border-[#FF0033]/30 shadow-[0_0_20px_rgba(255,0,51,0.2)]">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h3 className="text-xs font-black tracking-[0.3em] text-[#FF0033] mb-1 uppercase">PO Batch 1</h3>
                      <p className="text-lg font-black italic">15 MEI - 23 JUNI 2026</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                      <Gift size={24} />
                    </div>
                    <div>
                      <h3 className="text-xs font-black tracking-[0.3em] text-amber-500 mb-1 uppercase">Freebies Gacha</h3>
                      <p className="text-sm font-bold text-white/80 leading-tight">PC, Sticker, & Special Handwritten Letter</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4 flex items-center gap-2">
                      <Info size={14} /> Syarat & Ketentuan PO
                    </h4>
                    <ul className="space-y-2.5">
                      {[
                        'WAJIB LANGSUNG LUNAS.',
                        'Produksi dilakukan setelah close PO.',
                        'Isi data diri & alamat dengan teliti (kesalahan bukan tanggung jawab kami).',
                        'Pesanan tidak dapat dibatalkan/diubah setelah form terkirim.',
                        'Dengan mengisi form, pembeli setuju dengan seluruh S&K.'
                      ].map((text, i) => (
                        <li key={i} className="flex gap-3 text-[11px] text-white/50 leading-relaxed italic">
                          <span className="text-[#FF0033] font-black">•</span> {text}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right: Payment QR (Simulated) & Notes */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                    <div className="bg-[#FF0033] text-white text-[10px] font-black px-4 py-1 rounded-full mb-6 tracking-widest shadow-[0_0_15px_rgba(255,0,51,0.4)]">
                      LUNAS DI AWAL
                    </div>
                    <div className="w-40 h-40 bg-white rounded-2xl p-2 mb-6 shadow-[0_0_40px_rgba(255,255,255,0.05)]">
                      <img src="https://placehold.co/400x400/FFFFFF/000000?text=SCAN+QRIS" alt="QRIS" className="w-full h-full" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Konfirmasi Via WA</p>
                    <div className="flex items-center gap-2 text-[#FF0033] font-black text-xs">
                      <Truck size={14} /> Biaya Ongkir Ditanggung Pembeli
                    </div>
                  </div>
                  
                  <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500 mb-1 leading-tight">
                      * COD DI EVENT?
                    </p>
                    <p className="text-[10px] text-white/40 italic leading-tight font-medium">
                      Tuliskan detail COD di kolom catatan saat mengisi form pesanan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex justify-center gap-3 mb-12" data-aos="fade-up">
          {[
            { id: 'all', label: 'SEMUA', icon: Package },
            { id: 'accessory', label: 'AKSESORIS', icon: Box },
            { id: 'tshirt', label: 'T-SHIRT', icon: Shirt },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] tracking-[0.2em] transition-all border ${
                activeCategory === cat.id 
                ? 'bg-[#FF0033] border-[#FF0033] shadow-[0_0_20px_rgba(255,0,51,0.3)] text-white' 
                : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'
              }`}
            >
              <cat.icon size={14} />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Merch Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {filteredMerch.map((item, index) => (
            <div 
              key={item.id} 
              className="group bg-white/[0.02] border border-white/10 rounded-[2rem] overflow-hidden flex flex-col hover:border-[#FF0033]/40 transition-all duration-500 hover:translate-y-[-4px] hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)]"
              data-aos="fade-up"
              data-aos-delay={index * 50}
            >
              <div className="aspect-[3/4] relative overflow-hidden bg-black/40">
                <img 
                  src={item.images?.[0] || item.gambar_url} 
                  alt={item.nama}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                  <div className="px-2 py-0.5 bg-amber-500 text-black text-[8px] font-black uppercase tracking-widest rounded-md flex items-center gap-1 shadow-lg">
                    <Clock size={8} /> PO SPECIAL
                  </div>
                  <div className="px-2 py-0.5 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[8px] font-black uppercase tracking-widest rounded-md">
                    {item.category}
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5">
                  <button 
                    onClick={() => navigate('/merch/order', { state: { product: item } })}
                    className="w-full py-3 bg-white text-black font-black uppercase tracking-[0.2em] text-[9px] rounded-xl flex items-center justify-center gap-2 hover:bg-[#FF0033] hover:text-white transition-all transform translate-y-2 group-hover:translate-y-0 duration-500"
                  >
                    Pesan Sekarang <ArrowRight size={12} />
                  </button>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-3">
                  <h3 className="text-sm font-bold mb-0.5 group-hover:text-[#FF0033] transition-colors line-clamp-1">{item.nama}</h3>
                  <p className="text-lg font-black tracking-tighter text-[#FF0033]">
                    Rp {item.harga?.toLocaleString()}
                  </p>
                </div>
                
                <p className="text-white/30 text-[10px] line-clamp-2 italic mb-4 flex-1 leading-relaxed">
                  {item.deskripsi}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[9px] font-black uppercase tracking-widest text-white/20">
                  <span>PRE-ORDER</span>
                  <div className="group-hover:text-white transition-colors cursor-pointer flex items-center gap-1" onClick={() => navigate('/merch/order', { state: { product: item } })}>
                    Detail <ChevronRight size={10} />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredMerch.length === 0 && (
            <div className="col-span-full py-20 text-center" data-aos="fade-up">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                <Package className="text-white/20" size={24} />
              </div>
              <p className="text-white/20 font-bold uppercase tracking-[0.3em] text-[10px]">Belum ada item tersedia</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Merch;
