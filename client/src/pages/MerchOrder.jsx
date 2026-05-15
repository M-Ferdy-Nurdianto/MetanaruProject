import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingCart, 
  User, 
  MessageCircle, 
  Instagram, 
  StickyNote, 
  Check, 
  AlertCircle,
  Truck,
  Box,
  Shirt,
  Star,
  Info
} from 'lucide-react';
import { supabase } from '../supabase';
import Loading from '../components/Loading';

const MerchOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    whatsapp: '',
    instagram: '',
    catatan: '',
    size: '',
    variant: null,
    quantity: 1
  });

  // Redirect if no product (or show selection if needed, but for now we expect a product)
  useEffect(() => {
    if (!product) {
      navigate('/merch');
    } else {
      // Default size/variant
      if (product.category === 'tshirt' && product.sizes?.length > 0) {
        setFormData(prev => ({ ...prev, size: product.sizes[0] }));
      }
      if (product.category === 'accessory' && product.variants?.length > 0) {
        setFormData(prev => ({ ...prev, variant: product.variants[0] }));
      }
    }
  }, [product, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      // 1. Generate Order Number
      const newOrderNumber = `MRCH-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
      
      const totalPrice = (formData.variant ? formData.variant.price : product.harga) * formData.quantity;

      // 2. Create Order
      const { data: order, error: orderError } = await supabase
        .from('merch_orders')
        .insert([{
          order_number: newOrderNumber,
          nama_lengkap: formData.nama_lengkap,
          whatsapp: formData.whatsapp,
          instagram: formData.instagram,
          catatan: formData.catatan,
          total_harga: totalPrice,
          status: 'pending'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 3. Create Order Items
      const { error: itemError } = await supabase
        .from('merch_order_items')
        .insert([{
          merch_order_id: order.id,
          merchandise_id: product.id,
          item_name: product.nama,
          harga: formData.variant ? formData.variant.price : product.harga,
          quantity: formData.quantity,
          size: product.category === 'tshirt' ? formData.size : (formData.variant ? formData.variant.name : null)
        }]);

      if (itemError) throw itemError;

      setOrderNumber(newOrderNumber);
      setSuccess(true);
      window.scrollTo(0, 0);

    } catch (error) {
      console.error('Error placing order:', error);
      alert('Gagal membuat pesanan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white pt-32 pb-20 px-4">
        <div className="max-w-md mx-auto text-center" data-aos="zoom-in">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(34,197,94,0.4)]">
            <Check size={48} className="text-black" />
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter mb-4">PESANAN DITERIMA!</h1>
          <p className="text-white/40 mb-8 font-medium">
            Terima kasih telah memesan gear Metanaru. Simpan nomor pesananmu untuk konfirmasi.
          </p>
          
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2">Nomor Pesanan</p>
            <p className="text-2xl font-black text-[#FF0033] tracking-wider">{orderNumber}</p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl mb-8 text-left">
            <p className="text-xs text-amber-200/80 italic leading-relaxed">
              Tim kami akan menghubungi kamu melalui WhatsApp untuk informasi pembayaran (TF/QRIS) dan koordinasi pengiriman atau COD.
            </p>
          </div>

          <button 
            onClick={() => navigate('/merch')}
            className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-[#FF0033] hover:text-white transition-all"
          >
            Kembali ke Katalog
          </button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const currentPrice = formData.variant ? formData.variant.price : product.harga;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-32 sm:pt-40 pb-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-bl from-purple-500/5 to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <button 
          onClick={() => navigate('/merch')}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Kembali</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Product Info Section */}
          <div className="space-y-8" data-aos="fade-right">
            <div className="aspect-square rounded-[3rem] overflow-hidden border border-white/10 bg-white/5">
              <img 
                src={formData.variant?.image_url || product.images?.[0] || product.gambar_url} 
                alt={product.nama} 
                className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-700"
              />
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-[#FF0033] text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                  {product.category}
                </span>
                {product.is_po && (
                  <span className="px-3 py-1 bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest rounded-full">
                    Pre-Order
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter mb-4 leading-tight">{product.nama}</h1>
              <p className="text-white/40 leading-relaxed italic mb-8">{product.deskripsi}</p>
              
              <div className="p-8 bg-white/5 border border-white/10 rounded-3xl">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2">Total Harga</p>
                <p className="text-4xl font-black text-[#FF0033]">Rp {(currentPrice * formData.quantity).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div data-aos="fade-left">
            <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-8 md:p-12 space-y-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <ShoppingCart size={20} className="text-[#FF0033]" />
                </div>
                <h2 className="text-2xl font-black italic tracking-tighter">ORDER FORM</h2>
              </div>

              {/* Product Options */}
              <div className="space-y-6 pb-8 border-b border-white/5">
                {product.category === 'tshirt' && product.sizes?.length > 0 && (
                  <div>
                    <label className="flex text-[10px] font-black uppercase tracking-widest text-white/30 mb-4 items-center gap-2">
                      <Shirt size={14} /> Pilih Ukuran
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {product.sizes.map(size => (
                        <button 
                          key={size}
                          type="button"
                          onClick={() => setFormData({...formData, size})}
                          className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold text-xs transition-all ${
                            formData.size === size ? 'bg-purple-600 border-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.4)] text-white' : 'bg-white/5 border-white/10 text-white/40'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.category === 'accessory' && product.variants?.length > 0 && (
                  <div>
                    <label className="flex text-[10px] font-black uppercase tracking-widest text-white/30 mb-4 items-center gap-2">
                      <Star size={14} /> Pilih Varian
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {product.variants.map(variant => (
                        <button 
                          key={variant.name}
                          type="button"
                          onClick={() => setFormData({...formData, variant})}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            formData.variant?.name === variant.name ? 'bg-blue-600/20 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-white/40'
                          }`}
                        >
                          <p className="text-[10px] font-black uppercase tracking-widest mb-1">{variant.name}</p>
                          <p className="text-xs font-bold text-[#FF0033]">Rp {variant.price?.toLocaleString()}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">Jumlah</label>
                  <div className="flex items-center gap-4">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, quantity: Math.max(1, formData.quantity - 1)})}
                      className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="text-xl font-black w-8 text-center">{formData.quantity}</span>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, quantity: formData.quantity + 1})}
                      className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Personal Data */}
              <div className="space-y-6">
                <div>
                  <label className="flex text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 items-center gap-2">
                    <User size={14} /> Nama Lengkap
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="Masukkan nama asli anda"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm focus:outline-none focus:border-[#FF0033]/50 transition-colors"
                    value={formData.nama_lengkap}
                    onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 items-center gap-2">
                      <MessageCircle size={14} /> WhatsApp (Wajib)
                    </label>
                    <input 
                      type="tel" 
                      required
                      placeholder="08xxxxxxxxxx"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm focus:outline-none focus:border-[#FF0033]/50 transition-colors"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="flex text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 items-center gap-2">
                      <Instagram size={14} /> Instagram (Optional)
                    </label>
                    <input 
                      type="text" 
                      placeholder="@username"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm focus:outline-none focus:border-[#FF0033]/50 transition-colors"
                      value={formData.instagram}
                      onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="flex text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 items-center gap-2">
                    <StickyNote size={14} /> Catatan Tambahan
                  </label>
                  <textarea 
                    placeholder="Alamat pengiriman / Request COD di event / Catatan lainnya..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm focus:outline-none focus:border-[#FF0033]/50 transition-colors h-32 resize-none"
                    value={formData.catatan}
                    onChange={(e) => setFormData({...formData, catatan: e.target.value})}
                  />
                </div>
              </div>

              {/* Shipping Disclaimer */}
              <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-amber-500">
                  <Truck size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Informasi Pengiriman</span>
                </div>
                <p className="text-xs text-amber-200/60 leading-relaxed italic">
                  * Biaya pengiriman ditanggung sepenuhnya oleh pembeli.<br/>
                  * Jika minat COD di event Metanaru, silakan tulis di kolom catatan di atas.
                </p>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-[#FF0033] rounded-[2rem] font-black italic tracking-tighter text-xl hover:shadow-[0_0_40px_rgba(255,0,51,0.5)] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'MEMPROSES...' : 'KONFIRMASI PESANAN'}
              </button>

              <p className="text-[9px] text-center text-white/20 uppercase font-black tracking-[0.2em]">
                Pembayaran menggunakan TF/QRIS akan dikonfirmasi via WhatsApp
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchOrder;
