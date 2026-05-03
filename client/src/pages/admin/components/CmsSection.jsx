import React, { useState, useEffect } from 'react';
import { Newspaper, Plus, Trash2, Edit3, Image as ImageIcon, ExternalLink, X, Upload } from 'lucide-react';
import { supabase } from '../../../supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const CmsSection = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'PENGUMUMAN',
    content: '',
    post_url: '',
    image_url: ''
  });
  
  const [imageFile, setImageFile] = useState({
    file: null,
    preview: null,
    isCompressing: false
  });

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus post ini secara permanen?')) return;
    try {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) throw error;
      setPosts(posts.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const parseContent = (contentStr) => {
    try {
      if (contentStr && contentStr.startsWith('{')) {
        return JSON.parse(contentStr);
      }
    } catch (e) {
      // ignore
    }
    return { text: contentStr, postUrl: '' };
  };

  const openModal = (post = null) => {
    if (post) {
      const parsed = parseContent(post.content);
      setEditingId(post.id);
      setFormData({
        title: post.title || '',
        category: post.category || 'PENGUMUMAN',
        content: parsed.text || '',
        post_url: parsed.postUrl || '',
        image_url: post.image_url || ''
      });
      setImageFile({ file: null, preview: post.image_url, isCompressing: false });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        category: 'PENGUMUMAN',
        content: '',
        post_url: '',
        image_url: ''
      });
      setImageFile({ file: null, preview: null, isCompressing: false });
    }
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(prev => ({ ...prev, isCompressing: true }));
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageFile(prev => ({ ...prev, preview: event.target.result }));
      
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
        
        canvas.toBlob((blob) => {
          setImageFile(prev => ({ 
            ...prev, 
            file: blob,
            isCompressing: false 
          }));
        }, 'image/webp', 0.8);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSavePost = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalImageUrl = formData.image_url;

      // Upload if new image is selected
      if (imageFile.file) {
        const uploadData = new FormData();
        uploadData.append('proof', imageFile.file, 'post_image.webp');
        const uploadRes = await fetch(`${API_URL}/orders/upload-proof`, {
          method: 'POST',
          body: uploadData
        });
        if (!uploadRes.ok) throw new Error('Gagal upload gambar');
        const uploadResult = await uploadRes.json();
        finalImageUrl = uploadResult.url;
      }

      const payloadContent = JSON.stringify({
        text: formData.content,
        postUrl: formData.post_url
      });

      const payload = {
        title: formData.title,
        category: formData.category,
        content: payloadContent,
        image_url: finalImageUrl
      };

      if (editingId) {
        const { error } = await supabase
          .from('posts')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('posts')
          .insert([payload]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Gagal menyimpan post!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-l-4 border-[#FF0033] pl-6">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight italic">Otsu Post Manager</h2>
          <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] mt-1 font-bold">Kelola pengumuman & rekap kegiatan</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-[#FF0033] text-white px-6 py-3 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,0,51,0.2)]">
          <Plus size={14} /> Tambah Post Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[300px]">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center text-center glass-card border-white/5 bg-white/5 animate-pulse min-h-[300px]">
             <div className="w-10 h-10 border-4 border-[#FF0033] border-t-transparent rounded-full animate-spin mb-4" />
             <p className="text-[10px] font-black uppercase tracking-widest text-white/50">MENGAMBIL DATA POST...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center text-center glass-card border-dashed border-white/10 min-h-[300px]">
            <Newspaper size={48} className="text-white/10 mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Belum ada post yang diterbitkan</p>
          </div>
        ) : (
          posts.map((post) => {
            const parsed = parseContent(post.content);
            return (
            <div key={post.id} className="glass-card group hover:border-[#FF0033]/40 transition-all duration-500 overflow-hidden flex flex-col">
              <div className="aspect-video bg-[#111] relative overflow-hidden">
                {post.image_url ? (
                  <img src={post.image_url} alt={post.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/5 uppercase font-black text-4xl italic">
                    NO IMAGE
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="bg-[#FF0033] text-white text-[8px] font-black px-3 py-1 uppercase tracking-widest">
                    {post.category || 'GENERAL'}
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="text-[10px] font-bold text-white/30 mb-2">{new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                <h4 className="text-xl font-black uppercase tracking-tight mb-4 group-hover:text-[#FF0033] transition-colors line-clamp-2">{post.title}</h4>
                
                <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openModal(post)}
                      className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all">
                      <Edit3 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className="p-2 bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-500 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {parsed.postUrl && (
                    <a href={parsed.postUrl} target="_blank" rel="noreferrer" className="text-white/20 hover:text-[#FF0033] transition-all">
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )})
        )}
      </div>

      <div className="bg-[#121214] border border-white/10 p-8 rounded-none">
        <div className="flex items-center gap-4 text-[#FF0033]">
          <ImageIcon size={20} />
          <h3 className="font-black uppercase tracking-tight">Post Tips</h3>
        </div>
        <ul className="mt-4 space-y-2">
          <li className="text-[10px] text-white/40 uppercase font-bold tracking-wider leading-relaxed">
            ● Gunakan gambar dengan rasio 16:9 untuk hasil terbaik di Otsu Post.
          </li>
          <li className="text-[10px] text-white/40 uppercase font-bold tracking-wider leading-relaxed">
            ● Pastikan kategori diisi agar memudahkan fans menyaring berita.
          </li>
        </ul>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-2xl bg-[#0a0a0a] border-[#FF0033]/20 shadow-[0_0_50px_rgba(255,0,51,0.1)] flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#111]">
              <h3 className="text-xl font-black uppercase tracking-tight italic">
                {editingId ? 'Edit Post' : 'Tambah Post Baru'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white/50 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSavePost} className="flex flex-col flex-grow overflow-hidden">
              <div className="p-5 overflow-y-auto custom-scrollbar flex-grow space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#FF0033]">Judul Post</label>
                      <input 
                        required
                        type="text" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full bg-black border border-white/10 p-3 text-sm font-bold text-white focus:border-[#FF0033] focus:bg-[#111] transition-all outline-none"
                        placeholder="Masukkan judul post..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#FF0033]">Kategori</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-black border border-white/10 p-3 text-sm font-bold text-white focus:border-[#FF0033] focus:bg-[#111] transition-all outline-none appearance-none cursor-pointer"
                      >
                        <option value="PENGUMUMAN">PENGUMUMAN</option>
                        <option value="REKAP EVENT">REKAP EVENT</option>
                        <option value="GENERAL">GENERAL</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#FF0033]">URL Post / IG (Opsional)</label>
                      <input 
                        type="url" 
                        value={formData.post_url}
                        onChange={(e) => setFormData({...formData, post_url: e.target.value})}
                        className="w-full bg-black border border-white/10 p-3 text-sm font-bold text-white focus:border-[#FF0033] focus:bg-[#111] transition-all outline-none"
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#FF0033]">Gambar Post (Otomatis WebP)</label>
                    <label className="relative flex-1 flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed border-white/10 hover:border-[#FF0033]/50 bg-black hover:bg-white/5 transition-all cursor-pointer overflow-hidden group">
                       {imageFile.preview ? (
                          <>
                             <img src={imageFile.preview} alt="Preview" className="w-full h-full object-contain bg-black/20 opacity-80 group-hover:opacity-40 transition-all" />
                             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                <span className="bg-[#FF0033] text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest">Ganti Gambar</span>
                             </div>
                             {imageFile.isCompressing && (
                                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                                   <span className="text-white text-xs font-bold animate-pulse">Compressing...</span>
                                </div>
                             )}
                          </>
                       ) : (
                          <div className="flex flex-col items-center text-center p-4">
                             <Upload size={24} className="text-white/20 mb-2 group-hover:text-[#FF0033] transition-colors" />
                             <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Klik untuk upload</span>
                             <span className="text-[8px] text-white/30 uppercase mt-1">JPEG/PNG akan di-compress</span>
                          </div>
                       )}
                       <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#FF0033]">Konten / Deskripsi</label>
                  <textarea 
                    required
                    rows="3"
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full bg-black border border-white/10 p-3 text-sm font-bold text-white focus:border-[#FF0033] focus:bg-[#111] transition-all outline-none resize-none leading-relaxed"
                    placeholder="Tuliskan isi post..."
                  />
                </div>
              </div>

              <div className="p-5 flex justify-end gap-3 border-t border-white/10 bg-[#111]">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 border border-white/20 font-bold uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all">
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || imageFile.isCompressing}
                  className="bg-[#FF0033] text-white px-8 py-2.5 font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,0,51,0.2)] disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2">
                  {isSubmitting ? 'MENYIMPAN...' : 'SIMPAN POST'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CmsSection;
