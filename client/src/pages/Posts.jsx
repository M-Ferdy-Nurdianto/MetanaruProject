import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Newspaper } from 'lucide-react';
import { supabase } from '../supabase';
import Loading from '../components/Loading';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const parseContent = (contentStr) => {
    try {
      if (contentStr && typeof contentStr === 'string' && contentStr.startsWith('{')) {
        return JSON.parse(contentStr);
      }
    } catch (e) {}
    return { text: contentStr, postUrl: '' };
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('post_events')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setPosts(data || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="bg-black min-h-screen">
      <Helmet>
        <title>Metanaru Official Website</title>
        <meta name="description" content="Kabar terbaru, pengumuman, dan rekap kegiatan METANARU." />
      </Helmet>
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden bg-black">
                {/* Smoother, Multi-layered Hero Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(255,0,51,0.12)_0%,_transparent_80%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none"></div>
        
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FF0033]/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#fff500]/30 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
           <h1 className="text-4xl sm:text-7xl font-black mb-4 uppercase tracking-tighter animate-fade-in text-gradient">OTSU POST</h1>
           
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-6xl py-12 sm:py-20 relative">
        {/* Subtle Red Highlight for Content Area */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-[radial-gradient(circle_at_50%_50%,_rgba(255,0,51,0.04)_0%,_transparent_70%)] pointer-events-none"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 min-h-[320px] sm:min-h-[400px]">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center text-center glass-card border-white/5 bg-white/5 animate-pulse min-h-[320px] sm:min-h-[400px]">
             <div className="w-10 h-10 border-4 border-[#FF0033] border-t-transparent rounded-full animate-spin mb-4" />
             <p className="text-[10px] font-black uppercase tracking-widest text-white/50">MENGAMBIL DATA POST...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center text-center glass-card border-dashed border-white/10 min-h-[320px] sm:min-h-[400px]">
            <Newspaper size={64} className="text-white/10 mb-6" />
            <p className="text-sm font-black uppercase tracking-widest text-white/30">Belum ada post yang diterbitkan</p>
          </div>
        ) : (
          posts.map((post) => {
            return (
            <div key={post.id} className="glass-card flex flex-col group overflow-hidden" data-aos="fade-up">
              {post.instagram_url ? (
                <a href={post.instagram_url} target="_blank" rel="noreferrer" className="aspect-video bg-[#111] flex items-center justify-center relative overflow-hidden cursor-pointer">
                   {post.image_url ? (
                     <img src={post.image_url} alt={post.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                   ) : (
                     <span className="text-[#222] font-black text-6xl group-hover:text-[#FF0033]/20 transition-all duration-700">POSTER</span>
                   )}
                   <div className="absolute top-4 left-4 sm:top-6 sm:left-6 px-3 sm:px-4 py-1 bg-[#FF0033] text-black text-[9px] sm:text-[10px] font-black uppercase tracking-widest z-10">
                      {post.category || 'GENERAL'}
                   </div>
                </a>
              ) : (
                <div className="aspect-video bg-[#111] flex items-center justify-center relative overflow-hidden">
                   {post.image_url ? (
                     <img src={post.image_url} alt={post.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                   ) : (
                     <span className="text-[#222] font-black text-6xl group-hover:text-[#FF0033]/20 transition-all duration-700">POSTER</span>
                   )}
                   <div className="absolute top-4 left-4 sm:top-6 sm:left-6 px-3 sm:px-4 py-1 bg-[#FF0033] text-black text-[9px] sm:text-[10px] font-black uppercase tracking-widest z-10">
                      {post.category || 'GENERAL'}
                   </div>
                </div>
              )}
              
                <div className="p-6 sm:p-8 md:p-10 flex flex-col gap-4 flex-1">
                  <h2 className="text-2xl sm:text-3xl font-black text-white group-hover:text-[#FF0033] transition-colors uppercase line-clamp-2">{post.title}</h2>
                  <p className="text-[#888] font-bold text-[11px] sm:text-sm leading-relaxed mb-6 tracking-wide line-clamp-3">
                    {post.caption}
                 </p>
                 {post.instagram_url ? (
                   <a href={post.instagram_url} target="_blank" rel="noreferrer" className="text-[11px] sm:text-xs font-black text-white border-b border-white/20 pb-1 w-fit mt-auto hover:border-[#FF0033] hover:text-[#FF0033] transition-all uppercase tracking-widest">
                      LIHAT DI INSTAGRAM
                   </a>
                 ) : (
                   <button className="text-[11px] sm:text-xs font-black text-white border-b border-white/20 pb-1 w-fit mt-auto hover:border-[#FF0033] hover:text-[#FF0033] transition-all uppercase tracking-widest">
                      BACA SELENGKAPNYA
                   </button>
                 )}
              </div>
            </div>
          )})
        )}
      </div>
      </div>
    </div>
  );
};

export default Posts;










