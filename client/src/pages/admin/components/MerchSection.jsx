import React, { useState, useEffect, useCallback } from 'react';
import { 
  Package, 
  Plus, 
  Edit2, 
  Trash2, 
  ShoppingCart, 
  Check, 
  X, 
  Search, 
  Filter, 
  Image as ImageIcon, 
  Shirt,
  Box,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageCircle,
  Instagram,
  Clock,
  AlertCircle,
  Upload,
  Loader2,
  FileSpreadsheet,
  FileText,
  Download
} from 'lucide-react';
import { supabase } from '../../../supabase';
import { API_URL } from '../../../api';
import LoadingSpinner from './LoadingSpinner';

const MerchSection = ({ showToast }) => {
  const [activeSubTab, setActiveSubTab] = useState('catalog');
  const [catalog, setCatalog] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [exportingType, setExportingType] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    harga: 0,
    stok: 0,
    category: 'accessory',
    is_po: false,
    available: true,
    images: [],
    variants: [],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    size_chart_urls: []
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: merchData, error: merchError } = await supabase
        .from('merchandise')
        .select('*')
        .order('urutan', { ascending: true });

      if (merchError) throw merchError;
      setCatalog(merchData || []);

      const { data: orderData, error: orderError } = await supabase
        .from('merch_orders')
        .select(`
          *,
          merch_order_items (
            *,
            merchandise (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (orderError) throw orderError;
      setOrders(orderData || []);

    } catch (error) {
      console.error('Error fetching merch data:', error);
      showToast('Gagal memuat data merch', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Image Compression Utility
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max dimension 1200px
          const maxDim = 1200;
          if (width > height) {
            if (width > maxDim) {
              height *= maxDim / width;
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width *= maxDim / height;
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/webp', 0.8); // 80% quality WebP
        };
      };
    });
  };

  const handleFileUpload = async (e, type = 'product', variantIdx = null) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const compressedBlob = await compressImage(file);
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
        const filePath = `merchandise/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('merchandise')
          .upload(filePath, compressedBlob);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('merchandise')
          .getPublicUrl(filePath);

        return publicUrl;
      });

      const urls = await Promise.all(uploadPromises);

      if (type === 'product') {
        setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
      } else if (type === 'variant' && variantIdx !== null) {
        const newVariants = [...formData.variants];
        newVariants[variantIdx].image_url = urls[0];
        setFormData(prev => ({ ...prev, variants: newVariants }));
      }

      showToast('Gambar berhasil diunggah');
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Gagal mengunggah gambar', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        nama: item.nama || '',
        deskripsi: item.deskripsi || '',
        harga: item.harga || 0,
        stok: item.stok || 0,
        category: item.category || 'accessory',
        is_po: item.is_po || false,
        available: item.available ?? true,
        images: item.images || [],
        variants: item.variants || [],
        sizes: item.sizes || ['S', 'M', 'L', 'XL', 'XXL'],
        size_chart_urls: item.size_chart_urls || []
      });
    } else {
      setEditingItem(null);
      setFormData({
        nama: '',
        deskripsi: '',
        harga: 0,
        stok: 0,
        category: 'accessory',
        is_po: false,
        available: true,
        images: [],
        variants: [],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        size_chart_urls: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...formData
      };

      if (editingItem) {
        const { error } = await supabase
          .from('merchandise')
          .update(payload)
          .eq('id', editingItem.id);
        if (error) throw error;
        showToast('Merchandise berhasil diperbarui');
      } else {
        const { error } = await supabase
          .from('merchandise')
          .insert([payload]);
        if (error) throw error;
        showToast('Merchandise berhasil ditambahkan');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving merch:', error);
      showToast('Gagal menyimpan merchandise', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus item ini?')) return;
    try {
      const { error } = await supabase
        .from('merchandise')
        .delete()
        .eq('id', id);
      if (error) throw error;
      showToast('Item dihapus');
      fetchData();
    } catch (error) {
      showToast('Gagal menghapus item', 'error');
    }
  };

  const handleMerchExport = async (type) => {
    setExportingType(type);
    try {
      const response = await fetch(`${API_URL}/orders/export-merch/${type}`);
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `METANARU_Merch_Report.${type === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast(`Laporan ${type.toUpperCase()} berhasil diunduh!`, 'success');
    } catch (error) {
      console.error('Export error:', error);
      showToast('Gagal mengunduh laporan.', 'error');
    } finally {
      setExportingType(null);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const { error } = await supabase
        .from('merch_orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      if (error) throw error;
      
      // Update state locally to avoid "hard refresh" scroll jump
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      showToast('Status pesanan diperbarui');
    } catch (error) {
      showToast('Gagal memperbarui status', 'error');
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pesanan ini?')) return;
    try {
      const { error } = await supabase
        .from('merch_orders')
        .delete()
        .eq('id', orderId);
      if (error) throw error;
      
      // Update state locally
      setOrders(prev => prev.filter(o => o.id !== orderId));
      showToast('Pesanan berhasil dihapus');
    } catch (error) {
      showToast('Gagal menghapus pesanan', 'error');
    }
  };

  const filteredCatalog = catalog.filter(item => 
    item.nama.toLowerCase().includes(search.toLowerCase())
  );

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.nama_lengkap?.toLowerCase().includes(search.toLowerCase()) || 
                          order.order_number?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || order.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sub Tabs */}
      <div className="flex gap-4 border-b border-white/5 pb-1">
        <button 
          onClick={() => setActiveSubTab('catalog')}
          className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${
            activeSubTab === 'catalog' ? 'text-[#FF0033]' : 'text-white/40 hover:text-white/60'
          }`}
        >
          Katalog Merch
          {activeSubTab === 'catalog' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF0033] shadow-[0_0_10px_#FF0033]" />}
        </button>
        <button 
          onClick={() => setActiveSubTab('orders')}
          className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${
            activeSubTab === 'orders' ? 'text-[#FF0033]' : 'text-white/40 hover:text-white/60'
          }`}
        >
          Pesanan Merch
          {activeSubTab === 'orders' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF0033] shadow-[0_0_10px_#FF0033]" />}
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input 
            type="text" 
            placeholder={activeSubTab === 'catalog' ? "Cari produk..." : "Cari pesanan atau nama..."}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#FF0033]/50 transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        {activeSubTab === 'catalog' ? (
          <button 
            onClick={() => handleOpenModal()}
            className="metal-btn-primary flex items-center gap-2 px-6 py-3"
          >
            <Plus size={18} />
            <span>Tambah Merch</span>
          </button>
        ) : (
          <select 
            className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#FF0033]/50"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        )}
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : activeSubTab === 'catalog' ? (
        /* CATALOG VIEW */
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCatalog.map(item => (
            <div key={item.id} className="metal-card group relative overflow-hidden flex flex-col border border-white/5 hover:border-[#FF0033]/30 transition-all">
              <div className="aspect-[4/5] relative overflow-hidden bg-black/40">
                <img 
                  src={item.images?.[0] || item.gambar_url} 
                  alt={item.nama}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenModal(item)}
                    className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-[#FF0033] transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="absolute top-2 left-2">
                  <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest backdrop-blur-md border ${
                    item.category === 'tshirt' ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                  }`}>
                    {item.category}
                  </div>
                </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <div className="mb-2">
                  <h3 className="font-bold text-sm group-hover:text-[#FF0033] transition-colors line-clamp-1">{item.nama}</h3>
                  <p className="font-black text-[#FF0033] text-base">Rp {item.harga?.toLocaleString()}</p>
                </div>
                
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/20 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1.5">
                    {item.is_po ? (
                      <span className="text-amber-500 flex items-center gap-1">
                        <Clock size={10} /> PO
                      </span>
                    ) : (
                      <span>Stock: {item.stok}</span>
                    )}
                  </div>
                  <div className={item.available ? 'text-green-500/50' : 'text-red-500/50'}>
                    {item.available ? 'READY' : 'EMPTY'}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredCatalog.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-3xl">
              <Package className="mx-auto text-white/10 mb-4" size={48} />
              <p className="text-white/40 font-bold uppercase tracking-widest">Belum ada merchandise</p>
            </div>
          )}
        </div>
      ) : (
        /* ORDERS VIEW */
        <div className="space-y-6">
          {/* Export Buttons */}
          <div className="flex gap-4 p-4 metal-card bg-black/40 border border-[#FF0033]/20">
            <div>
              <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Ekspor Laporan Merch</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleMerchExport('excel')}
                  disabled={exportingType === 'excel'}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${exportingType === 'excel' ? 'bg-green-800 opacity-50 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'}`}
                >
                  {exportingType === 'excel' ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
                  Excel
                </button>
                <button 
                  onClick={() => handleMerchExport('pdf')}
                  disabled={exportingType === 'pdf'}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${exportingType === 'pdf' ? 'bg-red-800 opacity-50 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500'}`}
                >
                  {exportingType === 'pdf' ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                  PDF
                </button>
              </div>
            </div>
          </div>

          {/* ORDERS TABLE */}
          <div className="metal-card overflow-hidden border border-white/10 bg-black/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                    <th className="p-4 text-center w-12">No</th>
                    <th className="p-4">Customer & Order ID</th>
                    <th className="p-4">Merch Items</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.map((order, index) => (
                    <tr key={order.id} className="group hover:bg-white/[0.02] transition-colors">
                      {/* 1. Number */}
                      <td className="p-4 text-center text-xs font-black text-white/20">
                        {index + 1}
                      </td>

                      {/* 2. Customer Info */}
                      <td className="p-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-sm font-bold text-white group-hover:text-[#FF0033] transition-colors">
                            {order.nama_lengkap}
                          </span>
                          <span className="text-[10px] font-mono text-white/40">
                            {order.order_number}
                          </span>
                          <div className="flex flex-col gap-1 mt-1">
                            <a 
                              href={`https://wa.me/${order.whatsapp?.replace(/\D/g, '')}`} 
                              target="_blank" 
                              className="flex items-center gap-2 text-[11px] text-green-500/80 hover:text-green-500 transition-colors"
                            >
                              <MessageCircle size={12} />
                              <span className="font-mono">{order.whatsapp}</span>
                            </a>
                            {order.instagram && (
                              <a 
                                href={`https://instagram.com/${order.instagram.replace('@', '')}`} 
                                target="_blank" 
                                className="flex items-center gap-2 text-[11px] text-pink-500/80 hover:text-pink-500 transition-colors"
                              >
                                <Instagram size={12} />
                                <span>{order.instagram}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 3. Items List */}
                      <td className="p-4 max-w-xs">
                        <div className="space-y-2">
                          {order.merch_order_items?.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-[10px] text-white/70 leading-tight">
                              <span className="w-4 h-4 rounded bg-white/5 flex items-center justify-center text-[8px] font-black">{item.quantity}x</span>
                              <span className="font-bold truncate">{item.item_name}</span>
                              {item.size && <span className="text-white/30">[{item.size}]</span>}
                            </div>
                          ))}
                          {order.catatan && (
                            <div className="flex items-start gap-1 text-[9px] text-amber-500/80 italic bg-amber-500/5 p-1.5 rounded border border-amber-500/10">
                              <AlertCircle size={10} className="shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{order.catatan}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 4. Total Price */}
                      <td className="p-4">
                        <span className="text-sm font-black text-[#FF0033]">
                          Rp {order.total_harga?.toLocaleString()}
                        </span>
                      </td>

                      {/* 5. Status Badge */}
                      <td className="p-4">
                        <div className={`inline-flex px-2 py-1 rounded text-[9px] font-black tracking-widest border uppercase ${
                          order.status === 'pending' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                          order.status === 'paid' ? 'bg-green-500/10 border-green-500/30 text-green-500' :
                          order.status === 'completed' ? 'bg-purple-500/10 border-purple-500/30 text-purple-500' :
                          'bg-white/10 border-white/20 text-white/60'
                        }`}>
                          {order.status}
                        </div>
                      </td>

                      {/* 6. Actions */}
                      <td className="p-4">
                        <div className="flex flex-col gap-1.5 items-center">
                          <div className="flex gap-1.5 w-full">
                            <button 
                              onClick={() => updateOrderStatus(order.id, 'paid')}
                              title="Confirm Payment"
                              className="flex-1 py-1.5 bg-green-600/10 hover:bg-green-600 border border-green-600/30 text-green-500 hover:text-white rounded-lg text-[9px] font-black uppercase transition-all"
                            >
                              Paid
                            </button>
                            <button 
                              onClick={() => deleteOrder(order.id)}
                              title="Hapus Pesanan"
                              className="px-2 py-1.5 bg-red-600/10 hover:bg-red-600 border border-red-600/30 text-red-500 hover:text-white rounded-lg transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            className="w-full py-1.5 bg-white/5 hover:bg-white border border-white/10 text-white/40 hover:text-black rounded-lg text-[9px] font-black uppercase transition-all"
                          >
                            Mark Complete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredOrders.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-white/10 rounded-3xl">
              <ShoppingCart className="mx-auto text-white/10 mb-4" size={48} />
              <p className="text-white/40 font-bold uppercase tracking-widest">Belum ada pesanan</p>
            </div>
          )}
        </div>
      )}

      {/* MERCH MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-[#0D0D0D] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-[#FF0033]/10 to-transparent">
              <div>
                <h2 className="text-2xl font-black italic tracking-tighter">
                  {editingItem ? 'EDIT MERCHANDISE' : 'TAMBAH MERCHANDISE'}
                </h2>
                <p className="text-[10px] uppercase font-black tracking-[0.3em] text-[#FF0033]">Admin Panel</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4 md:col-span-2">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Nama Produk</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-[#FF0033]/50"
                      value={formData.nama}
                      onChange={(e) => setFormData({...formData, nama: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Deskripsi</label>
                    <textarea 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-[#FF0033]/50 h-24 resize-none"
                      value={formData.deskripsi}
                      onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Kategori</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, category: 'accessory'})}
                      className={`py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                        formData.category === 'accessory' ? 'bg-[#FF0033] border-[#FF0033] text-white' : 'bg-white/5 border-white/10 text-white/40'
                      }`}
                    >
                      <Box size={16} /> <span className="text-[10px] font-bold uppercase">Aksesoris</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, category: 'tshirt'})}
                      className={`py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                        formData.category === 'tshirt' ? 'bg-[#FF0033] border-[#FF0033] text-white' : 'bg-white/5 border-white/10 text-white/40'
                      }`}
                    >
                      <Shirt size={16} /> <span className="text-[10px] font-bold uppercase">T-Shirt</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Tipe Stok</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, is_po: false})}
                      className={`py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                        !formData.is_po ? 'bg-white/20 border-white/30 text-white' : 'bg-white/5 border-white/10 text-white/40'
                      }`}
                    >
                      <Check size={16} /> <span className="text-[10px] font-bold uppercase">Ready Stock</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, is_po: true})}
                      className={`py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                        formData.is_po ? 'bg-amber-500/20 border-amber-500/50 text-amber-500' : 'bg-white/5 border-white/10 text-white/40'
                      }`}
                    >
                      <Clock size={16} /> <span className="text-[10px] font-bold uppercase">Pre-Order</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Harga (Rp)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-[#FF0033]/50"
                    value={formData.harga}
                    onChange={(e) => setFormData({...formData, harga: parseInt(e.target.value) || 0})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Stok {formData.is_po && '(Optional)'}</label>
                  <input 
                    type="number" 
                    disabled={formData.is_po}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-[#FF0033]/50 disabled:opacity-30"
                    value={formData.stok}
                    onChange={(e) => setFormData({...formData, stok: parseInt(e.target.value) || 0})}
                  />
                </div>

                {/* Images Upload */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Foto Produk (Multiple)</label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-4">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="aspect-square relative rounded-xl overflow-hidden border border-white/10 group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, images: formData.images.filter((_, i) => i !== idx)})}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <label className={`aspect-square border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, 'product')} 
                      />
                      {uploading ? <Loader2 className="animate-spin text-white/40" size={20} /> : <Plus className="text-white/20" size={20} />}
                    </label>
                  </div>
                  <p className="text-[9px] text-white/20 italic">* Gambar akan otomatis dikompres ke ukuran optimal</p>
                </div>

                {/* Variants for Accessories */}
                {formData.category === 'accessory' && (
                  <div className="md:col-span-2 p-6 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Varian Produk</h4>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, variants: [...formData.variants, { name: '', price: formData.harga, stock: 0, image_url: '' }]})}
                        className="text-[10px] font-bold uppercase text-[#FF0033] hover:underline"
                      >
                        + Tambah Varian
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {formData.variants.map((v, idx) => (
                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-start border-b border-white/5 pb-4 last:border-0 last:pb-0">
                          <div className="flex flex-col gap-2">
                            <label className="w-full aspect-square rounded-lg border border-white/10 overflow-hidden bg-black/40 cursor-pointer relative group">
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => handleFileUpload(e, 'variant', idx)} 
                              />
                              {v.image_url ? (
                                <img src={v.image_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/20">
                                  <ImageIcon size={20} />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-black uppercase">
                                Ubah Foto
                              </div>
                            </label>
                            <input placeholder="Nama Varian" className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs" value={v.name} onChange={(e) => {
                              const newV = [...formData.variants]; newV[idx].name = e.target.value; setFormData({...formData, variants: newV});
                            }} />
                          </div>
                          
                          <div className="sm:col-span-1 pt-8">
                            <input placeholder="Harga" type="number" className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs" value={v.price} onChange={(e) => {
                              const newV = [...formData.variants]; newV[idx].price = parseInt(e.target.value) || 0; setFormData({...formData, variants: newV});
                            }} />
                          </div>

                          <div className="flex gap-2 pt-8">
                            <input placeholder="Stok" type="number" className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs" value={v.stock} onChange={(e) => {
                              const newV = [...formData.variants]; newV[idx].stock = parseInt(e.target.value) || 0; setFormData({...formData, variants: newV});
                            }} />
                            <button type="button" onClick={() => {
                              const newV = formData.variants.filter((_, i) => i !== idx); setFormData({...formData, variants: newV});
                            }} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg h-9 self-end"><X size={16} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes for Tshirts */}
                {formData.category === 'tshirt' && (
                  <div className="md:col-span-2 p-6 bg-white/5 rounded-2xl border border-white/5">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-purple-400 mb-4">Ukuran Tersedia</h4>
                    <div className="flex flex-wrap gap-3">
                      {['S', 'M', 'L', 'XL', 'XXL', '3XL', 'Custom'].map(size => (
                        <button 
                          key={size}
                          type="button"
                          onClick={() => {
                            const newSizes = formData.sizes.includes(size) ? formData.sizes.filter(s => s !== size) : [...formData.sizes, size];
                            setFormData({...formData, sizes: newSizes});
                          }}
                          className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold text-xs transition-all ${
                            formData.sizes.includes(size) ? 'bg-purple-500 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-white/40'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-white/10 transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSaving || uploading}
                  className="flex-[2] py-4 bg-[#FF0033] rounded-2xl font-black italic tracking-tighter text-lg hover:shadow-[0_0_30px_#FF0033] transition-all disabled:opacity-50"
                >
                  {isSaving ? 'MENYIMPAN...' : 'SIMPAN MERCHANDISE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchSection;
