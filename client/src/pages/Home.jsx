import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SLOGAN, SOCIAL_LINKS, members as MEMBERS_FALLBACK } from '../constants';
import { fetchMembers, fetchEvents, fetchPostEvents } from '../api';
import { supabase } from '../supabase';

const Home = () => {
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });

  const parseContent = (contentStr) => {
    try {
      if (contentStr && typeof contentStr === 'string' && contentStr.startsWith('{')) {
        return JSON.parse(contentStr);
      }
    } catch (e) {}
    return { text: contentStr, postUrl: '' };
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [mems, evs, { data: psts }] = await Promise.all([
        fetchMembers().catch(() => []),
        fetchEvents().catch(() => []),
        supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(4)
      ]);
      
      const finalMembers = (mems && mems.length > 0) ? mems : MEMBERS_FALLBACK;
      const sorted = [...finalMembers].sort((a, b) => {
          if (a.name === 'NOT SIGNAL') return 1;
          if (b.name === 'NOT SIGNAL') return -1;
          return a.id - b.id;
      });
      setMembers(sorted.map(m => ({ ...m, themeColor: m.theme_color || m.themeColor })));
      setEvents(evs || []);
      setPosts(psts || []);
    } catch (err) {
      console.error('Error loading home data:', err);
      setMembers(MEMBERS_FALLBACK.map(m => ({ ...m, themeColor: m.themeColor })));
      setEvents([]);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // REALTIME LISTENERS
    const eventChannel = supabase
      .channel('public-events-home')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        loadData();
      })
      .subscribe();

    const postChannel = supabase
      .channel('public-posts-home')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_events' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(eventChannel);
      supabase.removeChannel(postChannel);
    };
  }, []);

  // COUNTDOWN LOGIC
  useEffect(() => {
    if (!events || events.length === 0 || !events[0].date) return;

    const timer = setInterval(() => {
      const eventDateStr = events[0].date;
      // Try to parse the date. If it's just '20 DES', we might need a year.
      // But if it's from DatePicker, it's 'YYYY-MM-DD'
      let eventDate = new Date(eventDateStr);
      
      // Fallback for human-readable formats if parsing fails
      if (isNaN(eventDate.getTime())) {
          // If it's '20 DES', append current year or something
          // But usually we prefer ISO format from DB
          return; 
      }

      const now = new Date();
      const difference = eventDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
        clearInterval(timer);
        return;
      }

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        days: d.toString().padStart(2, '0'),
        hours: h.toString().padStart(2, '0'),
        minutes: m.toString().padStart(2, '0'),
        seconds: s.toString().padStart(2, '0')
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [events]);
  /* Loading screen disabled for debug */
  
  return (
    <div className="flex flex-col bg-black min-h-screen">


      <Helmet>
        <title>METANARU | Official Webcheki & Kawaii Metal Idol</title>
        <meta name="description" content="Website resmi METANARU, grup idol Kawaii Metal asal Surabaya. Pesan Cheki member favoritmu dan pantau jadwal manggung terbaru kami." />
        <meta name="keywords" content="Metanaru, Idol Surabaya, Kawaii Metal, Cheki, Webcheki, Metalcore Idol" />
      </Helmet>
      
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden bg-black">
        {/* Smoother, Multi-layered Hero Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(255,0,51,0.12)_0%,_transparent_80%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none"></div>
        
        
        
        
        <div className="container mx-auto px-4 z-10 flex flex-col items-center text-center">
           <img 
             src="/logos/logo.png" 
             alt="METANARU" 
             className="w-32 sm:w-40 md:w-64 mb-6 sm:mb-8 drop-shadow-[0_0_30px_rgba(255,0,51,0.5)] animate-fade-in"
           />
           <h1 className="text-4xl sm:text-7xl md:text-[10rem] font-black text-gradient uppercase tracking-tighter mb-4 leading-none drop-shadow-[0_0_20px_rgba(255,0,51,0.3)]">
              METANARU
           </h1>
           <p className="text-[#fff500] text-base sm:text-xl md:text-2xl font-bold tracking-[0.3em] sm:tracking-[0.5em] mb-12 uppercase drop-shadow-[0_0_10px_rgba(255,245,0,0.4)]">{SLOGAN}</p>
           
           <Link to="/cheki" className="btn-minimal px-10 sm:px-12 md:px-16 py-4 sm:py-6 text-sm sm:text-base md:text-xl bg-[#FF0033] text-white border-none shadow-[0_0_40px_rgba(255,0,51,0.5)] hover:bg-[#cc0029] transition-all">
              PESAN CHEKI
           </Link>
        </div>
      </section>

      {/* 2. ABOUT US */}
      <section className="py-16 sm:py-24 container mx-auto px-4 max-w-4xl">
        <div className="flex flex-col items-center text-center gap-8">
           <h2 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-tighter">Tentang Metanaru</h2>
           
           <p className="text-base sm:text-lg text-[#C0C0C0] font-bold leading-relaxed uppercase tracking-wide">
              Grup idol Kawaii Metal asal Surabaya. Gabungan estetika manis J-Pop dengan agresivitas Metalcore. 
              Setiap penampilan adalah ledakan energi bagi para fans.
           </p>
        </div>
      </section>

      {/* 3. DAFTAR MEMBER */}
      <section className="py-16 sm:py-24 container mx-auto px-4 relative">
        {/* Subtle Red Highlight for Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-[radial-gradient(circle_at_50%_50%,_rgba(255,0,51,0.06)_0%,_transparent_100%)] pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4 relative z-10">
           <div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase">Daftar Member</h2>
              <p className="text-[#888] font-bold text-xs tracking-widest uppercase mt-2">Personel Metanaru yang tersedia untuk Cheki</p>
           </div>
           <div className="h-1 flex-grow mx-8 bg-white/5 hidden md:block"></div>
        </div>

        {/* MOBILE VIEW - SEAMLESS INFINITE MARQUEE */}
        <div className="md:hidden overflow-hidden -mx-4 relative z-10">
           <div className="animate-marquee flex gap-4 px-4 py-4">
              {/* Render twice for seamless loop */}
              {Array.isArray(members) && [...members, ...members].map((member, idx) => (
                <div key={`${member.id}-${idx}`} className="min-w-[70vw] relative group flex flex-col">
                    {/* Background Gold Glow */}
                    <div className="absolute -inset-4 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,245,0,0.15)_0%,_transparent_70%)] blur-2xl pointer-events-none z-0"></div>
                    <div className="glass-card overflow-hidden flex flex-col relative z-10 bg-black/60">
                   <div className="aspect-[3/4] bg-black/40 flex items-center justify-center relative overflow-hidden">
                      {/* Individual Member Gold Highlight */}
                       <img 
                         src={`/photo/members/${member.name.toLowerCase()}.${member.name.toLowerCase() === 'joy' || member.name.toLowerCase() === 'fay' ? 'jpg' : 'webp'}`}
                         alt={member.name}
                         className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 grayscale group-hover:grayscale-0 scale-100 z-0"
                         onLoad={(e) => {
                            const p = e.target.parentElement;
                            const s = p.querySelector('span');
                            if (s) s.style.display = 'none';
                         }}
                         onError={(e) => {
                           e.target.style.display = 'none';
                           const p = e.target.parentElement;
                           const s = p.querySelector('span');
                           if (s) s.style.display = 'block';
                         }}
                       />
                      
                      
                      <span className="text-4xl font-black text-[#111] relative z-10" style={{ color: member.themeColor }}>
                         {member.symbol}
                      </span>
                      <div className="absolute top-4 right-4 px-3 py-1 text-[8px] font-black tracking-widest uppercase bg-[#fff500] text-black shadow-[0_0_10px_rgba(255,245,0,0.4)]">
                         LIVE
                      </div>
                   </div>
                   <div className="p-4 flex flex-col gap-3">
                      <div>
                         <h3 className="text-base font-black text-white uppercase">{member.name}</h3>
                         <p className="text-[8px] font-bold text-[#888] uppercase tracking-widest mt-1">{member.vibe}</p>
                      </div>
                      <Link to="/cheki" className="w-full py-2.5 text-center font-black text-[8px] uppercase tracking-[0.2em] bg-white text-black">
                         BELI CHEKI
                      </Link>
                   </div>
                </div>
              </div>
              ))}
           </div>
        </div>

        {/* DESKTOP VIEW - ORGANIZED GRID */}
        <div className="hidden md:flex flex-col gap-10 max-w-screen-2xl mx-auto px-12 lg:px-24 relative z-10">
            {/* Top Row: 4 Main Members */}
            <div className="grid grid-cols-4 gap-6">
               {Array.isArray(members) && members.filter(m => m.name !== 'NOT SIGNAL').map((member) => (
                 <div key={member.id} className="relative group flex flex-col">
                     {/* Background Gold Glow */}
                     <div className="absolute -inset-8 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,245,0,0.15)_0%,_transparent_70%)] blur-3xl pointer-events-none z-0"></div>
                     <div className="glass-card overflow-hidden flex flex-col relative z-10 bg-black/60">
                    <div className="aspect-[3/4] bg-black/40 flex items-center justify-center relative overflow-hidden">
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
                       <span className="text-4xl font-black text-[#111] group-hover:text-[#FF0033]/20 transition-all duration-700" style={{ color: member.themeColor }}>
                          {member.symbol}
                       </span>
                    </div>
                    <div className="p-6 flex flex-col gap-4">
                       <div>
                          <h3 className="text-xl font-black text-white uppercase">{member.name}</h3>
                          <p className="text-[10px] font-bold text-[#888] uppercase tracking-[0.2em] mt-1">{member.vibe}</p>
                       </div>
                       <Link to="/cheki" className="w-full py-3 text-center font-black text-[10px] uppercase tracking-[0.2em] bg-white text-black hover:bg-[#FF0033] hover:text-white transition-all">
                          BELI CHEKI
                       </Link>
                    </div>
                 </div>
               </div>
               ))}
            </div>

            {/* Bottom Row: NOT SIGNAL Members Centered */}
            <div className="flex justify-center gap-6">
               {Array.isArray(members) && members.filter(m => m.name === 'NOT SIGNAL').map((member) => (
                 <div key={member.id} className="w-1/4 glass-card group overflow-hidden flex flex-col opacity-50 hover:opacity-100 transition-opacity">
                    <div className="aspect-[3/4] bg-black/40 flex items-center justify-center relative">
                       <span className="text-4xl font-black text-[#111]" style={{ color: member.themeColor }}>
                          {member.symbol}
                       </span>
                    </div>
                    <div className="p-6 flex flex-col gap-4 text-center">
                       <div>
                          <h3 className="text-xl font-black text-white uppercase">{member.name}</h3>
                          <p className="text-[10px] font-bold text-[#888] uppercase tracking-[0.3em] mt-1">{member.vibe}</p>
                       </div>
                       <div className="w-full py-3 text-center font-black text-[10px] uppercase tracking-[0.2em] bg-[#111] text-[#333] cursor-not-allowed border border-white/5">
                          NOT AVAILABLE
                       </div>
                    </div>
                 </div>
               ))}
            </div>
        </div>
      </section>

      {/* 4. COUNTDOWN & SCHEDULE (New Position) */}
         <section className="py-16 sm:py-24 relative overflow-hidden bg-black/40 backdrop-blur-sm border-y border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,0,51,0.1)_0%,_transparent_80%)] pointer-events-none"></div>
        <div className="container mx-auto px-4 max-w-5xl text-center relative z-10">
           
           {/* Countdown Text */}
           {events.length > 0 ? (
             <div className="mb-16 sm:mb-20 flex flex-col items-center">
               <h2 className="text-white font-black text-lg sm:text-2xl md:text-4xl tracking-[0.12em] sm:tracking-[0.2em] mb-8 sm:mb-10 uppercase">
                  Next Perform: <span className="text-[#FF0033]">{events[0].name}</span>
               </h2>
               <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-8 justify-center">
                  {[ {l: 'HARI', v: timeLeft.days}, {l: 'JAM', v: timeLeft.hours}, {l: 'MENIT', v: timeLeft.minutes}, {l: 'DETIK', v: timeLeft.seconds} ].map((t, i) => (
                    <div key={i} className="flex flex-col items-center glass-card p-3 sm:p-4 md:p-6 min-w-[64px] sm:min-w-[80px] md:min-w-[110px]">
                       <span className="text-2xl sm:text-3xl md:text-5xl font-black text-white">{t.v}</span>
                       <span className="text-[9px] sm:text-[10px] font-bold text-[#FF0033] tracking-widest mt-2">{t.l}</span>
                    </div>
                  ))}
               </div>
             </div>
           ) : (
             <div className="mb-16 sm:mb-20 p-8 sm:p-12 glass-card border-[#FF0033]/20">
                <p className="text-xl sm:text-2xl font-black text-white tracking-[0.12em] sm:tracking-[0.2em] uppercase">Stay Tuned for the Next Show</p>
             </div>
           )}

           {/* Schedule List */}
           <div className="flex flex-col gap-4 mt-12 text-left">
              <h3 className="text-2xl sm:text-3xl font-black uppercase mb-8 border-l-4 border-[#FF0033] pl-4 sm:pl-6">Jadwal Terdekat</h3>
               {events.map((event) => (
                  <div key={event.id} className="glass-card p-5 sm:p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 hover:border-[#FF0033]/30 transition-all">
                     <div>
                        <span className="text-[9px] sm:text-[10px] font-black text-[#fff500] drop-shadow-[0_0_5px_rgba(255,245,0,0.4)] uppercase tracking-[0.3em]">
                           {event.type === 'special' ? 'SPECIAL SHOW' : 'LIVE PERFORMANCE'}
                        </span>
                        <h4 className="text-2xl font-black text-white uppercase mt-1">{event.name}</h4>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-1">
                           <p className="text-[#888] font-bold text-[10px] uppercase tracking-widest">{event.location || 'Surabaya'}</p>
                           {event.po_deadline && (
                              <p className="text-[#FF0033] font-black text-[10px] uppercase tracking-widest">
                                 Batas PO: {event.po_deadline}
                              </p>
                           )}
                        </div>
                     </div>
                     <div className="text-center md:text-right">
                        <p className="text-2xl sm:text-3xl font-black text-white">{event.date}</p>
                        <p className="text-[#666] font-bold text-[10px] uppercase tracking-widest">{event.time || ''}</p>
                     </div>
                  </div>
               ))}
           </div>
        </div>
      </section>

      <section className="py-20 sm:py-32 relative overflow-hidden bg-black">
        {/* Much smoother, larger radial gradients to prevent banding */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,0,51,0.08)_0%,_transparent_100%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(255,0,51,0.06)_0%,_transparent_80%)] pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FF0033]/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#fff500]/10 to-transparent"></div>
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-16 gap-4">
             <div>
                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">Otsu Post</h2>
                <p className="text-[#888] font-bold text-[10px] sm:text-xs tracking-widest uppercase mt-2">Kabar dan rekap kegiatan terbaru</p>
             </div>
             <Link to="/posts" className="text-[#FF0033] text-[10px] font-black uppercase tracking-[0.2em] hover:underline md:mb-1">Lihat Semua →</Link>
          </div>

          {/* MOBILE VIEW - LARGE SNAP SLIDER */}
          <div className="md:hidden">
             <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 px-6 pb-8 custom-scrollbar-hide">
                {posts?.length > 0 && [...posts, ...posts].map((post, idx) => {
                  const parsed = parseContent(post.content);
                  return (
                  <div key={`${post.id}-${idx}`} className="min-w-[85vw] snap-center glass-card group flex flex-col overflow-hidden bg-[#0a0a0a]/80 border-white/5">
                     {/* Large Image Section */}
                     <div className="relative aspect-[4/3] bg-[#111] overflow-hidden">
                        {post.image_url ? (
                            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover object-top" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                               <span className="text-xl font-black text-[#222]">MNR</span>
                            </div>
                        )}
                        <div className="absolute top-4 left-4 bg-[#FF0033] text-white text-[10px] font-black px-3 py-1.5 uppercase tracking-widest shadow-xl">
                           {post.category || 'POST'}
                        </div>
                     </div>

                     {/* Content Section */}
                     <div className="p-6 flex flex-col gap-3 flex-grow bg-gradient-to-b from-[#0a0a0a] to-black">
                        <h3 className="text-xl font-black text-white uppercase leading-tight line-clamp-2 tracking-tighter">
                           {post.title}
                        </h3>
                        <p className="text-[#888] text-[10px] font-bold uppercase tracking-widest line-clamp-2 leading-relaxed">
                           {parsed.text || 'Lihat detail postingan ini selengkapnya.'}
                        </p>
                        <a href={parsed.postUrl || '#'} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block">
                           <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] border-b border-[#FF0033] pb-1">
                              BACA SELENGKAPNYA →
                           </span>
                        </a>
                     </div>
                  </div>
                )})
                }
             </div>
          </div>

          {/* DESKTOP VIEW - GRID 4 COLS */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
             {posts?.length > 0 && posts.slice(0, 4).map((post) => {
                const parsed = parseContent(post.content);
                return (
                <div key={post.id} className="glass-card group flex flex-col overflow-hidden hover:border-[#FF0033]/30 transition-all">
                   {/* Image Section - Portrait Friendly Ratio */}
                   <div className="relative aspect-[4/5] bg-[#111] overflow-hidden">
                      {post.image_url ? (
                          <img src={post.image_url} alt={post.title} className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center">
                             <span className="text-2xl font-black text-[#222]">POSTER</span>
                          </div>
                      )}
                      {/* Red Badge */}
                      <div className="absolute top-4 left-4 bg-[#FF0033] text-white text-[10px] font-black px-3 py-1.5 uppercase tracking-widest shadow-lg">
                         {post.category || 'REKAP EVENT'}
                      </div>
                   </div>

                   {/* Content Section */}
                   <div className="p-5 sm:p-6 bg-[#0a0a0a] flex flex-col gap-3 flex-grow">
                      <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-none line-clamp-1">
                         {post.title}
                      </h3>
                      <p className="text-[#888] text-[10px] font-bold uppercase tracking-widest line-clamp-2">
                         {parsed.text || 'No description available.'}
                      </p>
                      
                      <div className="mt-auto pt-4">
                         <a href={parsed.postUrl || '#'} target="_blank" rel="noopener noreferrer" className="inline-block">
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] border-b border-white pb-1 hover:text-[#FF0033] hover:border-[#FF0033] transition-all">
                               BACA SELENGKAPNYA
                            </span>
                         </a>
                      </div>
                   </div>
                </div>
             )})
             }
          </div>

          {/* View All Button */}
          <div className="mt-12 text-center">
             <Link to="/otsu" className="inline-block px-10 py-4 bg-white text-black font-black text-xs uppercase tracking-[0.3em] hover:bg-[#FF0033] hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,0,51,0.3)]">
                LIHAT REKAP LAINNYA
             </Link>
          </div>
        </div>
      </section>

      {/* 6. HOW TO ORDER */}
      <section className="py-16 sm:py-24 relative overflow-hidden bg-[#050505] border-y border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,_rgba(255,0,51,0.05)_0%,_transparent_50%)] pointer-events-none"></div>
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
           <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-black uppercase">Cara Pemesanan</h2>
              
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
              {[
                 { s: '01', t: 'PILIH MEMBER', d: 'Pilih member favoritmu.' },
                 { s: '02', t: 'PILIH VARIASI', d: 'Tentukan jenis cheki.' },
                 { s: '03', t: 'PEMBAYARAN', d: 'Selesaikan transaksi.' },
                 { s: '04', t: 'PROSES CHEKI', d: 'Claim di booth metanaru.' },
              ].map((step, i) => (
                 <div key={i} className="flex flex-col items-center text-center gap-4">
                    <div className="text-4xl sm:text-5xl font-black text-[#fff500] drop-shadow-[0_0_15px_rgba(255,245,0,0.4)]">{step.s}</div>
                    <h3 className="text-base sm:text-lg font-black text-[#FF0033] uppercase tracking-tighter drop-shadow-[0_0_5px_rgba(255,0,51,0.3)]">{step.t}</h3>
                    <p className="text-[10px] sm:text-xs text-[#888] font-bold uppercase leading-relaxed tracking-wider">{step.d}</p>
                 </div>
              ))}
           </div>
        </div>
      </section>

      {/* 7. JURAGAN WEBSITE AD */}
      <section className="py-16 sm:py-24 container mx-auto px-4 max-w-5xl">
         <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-10 md:gap-12 glass-card p-6 sm:p-8 md:p-12 border-[#FF0033]/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#FF0033]"></div>
            <div className="flex-grow text-center md:text-left">
               <span className="text-[#fff500] font-black tracking-[0.3em] uppercase text-[10px] sm:text-xs drop-shadow-[0_0_5px_rgba(255,245,0,0.4)]">Official Digital Partner</span>
               <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mt-4 uppercase tracking-tighter">Ingin Web Seperti Ini?</h2>
               <p className="text-[#888] font-bold mt-4 uppercase tracking-widest text-[11px] sm:text-sm">
                  Jasa pembuatan website profesional di <span className="text-[#fff500] font-black drop-shadow-[0_0_8px_rgba(255,245,0,0.6)]">Juragan Website</span>.
               </p>
            </div>
            <a href="https://m-ferdy-nurdianto.github.io/JuraganWebsite/" 
               target="_blank" rel="noopener noreferrer"
               className="btn-minimal px-8 sm:px-10 md:px-12 py-3.5 sm:py-4 md:py-5 text-sm block text-center">
               HUBUNGI JURAGAN
            </a>
         </div>
      </section>
      
    </div>
  );
};

export default Home;










