import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { fetchMembers } from '../api';
import { SLOGAN, members as MEMBERS_FALLBACK } from '../constants';
import Loading from '../components/Loading';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchMembers().then(data => {
      const finalMembers = (data && data.length > 0) ? data : MEMBERS_FALLBACK;
      const sorted = [...finalMembers].sort((a, b) => {
        if (a.name === 'NOT SIGNAL') return 1;
        if (b.name === 'NOT SIGNAL') return -1;
        return a.id - b.id;
      });
      setMembers(sorted.map(m => ({ ...m, themeColor: m.theme_color || m.themeColor })));
      setLoading(false);
    }).catch(err => {
      console.error("Error loading members:", err);
      setMembers(MEMBERS_FALLBACK.map(m => ({ ...m, themeColor: m.themeColor })));
      setLoading(false);
    });
  }, []);

  if (loading) return <Loading />;
  return (
    <div className="bg-black min-h-screen">
      <Helmet>
        <title>Daftar Member | METANARU Official</title>
        <meta name="description" content="Kenali personel METANARU. Profil lengkap member Kawaii Metal Surabaya: Fay, Moi, Nera, Joy, dan Caca." />
      </Helmet>
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 overflow-hidden bg-black">
        {/* Smoother, Multi-layered Hero Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(255,0,51,0.12)_0%,_transparent_80%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none"></div>
        
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FF0033]/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#fff500]/30 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
           <h1 className="text-4xl sm:text-7xl font-black mb-4 uppercase tracking-tighter animate-fade-in text-gradient">DAFTAR MEMBER</h1>
           
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-5xl py-12 sm:py-20 relative">
        {/* Subtle Red Highlight for Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-[radial-gradient(circle_at_50%_50%,_rgba(255,0,51,0.06)_0%,_transparent_100%)] pointer-events-none"></div>

      <div className="flex flex-col gap-12 sm:gap-20 md:gap-28 relative z-10">
        {members.map((member, idx) => (
          <div key={member.id} 
               className={`flex ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} gap-4 sm:gap-12 md:gap-14 items-start`}
               data-aos="fade-up">
            
            {/* Photo Container with Background Glow */}
            <div className="w-[35%] md:w-[38%] aspect-[3/4] relative shrink-0">
                {/* Background Gold Glow - Large and Blurred */}
                <div className="absolute -inset-4 sm:-inset-10 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,245,0,0.2)_0%,_transparent_70%)] blur-2xl pointer-events-none z-0"></div>
                
                <div className="w-full h-full glass-card flex items-center justify-center relative overflow-hidden group border-x-2 md:border-x-4 border-[#FF0033] shadow-[0_0_20px_rgba(255,245,0,0.1)] bg-black z-10">
                    {/* Subtle Gold Edge Glow inside borders */}
                    <div className="absolute inset-y-0 left-0 w-px bg-[#fff500] blur-[2px] opacity-30 pointer-events-none z-10"></div>
                    <div className="absolute inset-y-0 right-0 w-px bg-[#fff500] blur-[2px] opacity-30 pointer-events-none z-10"></div>
                    
                    {/* Member Photo */}
                    <img 
                      src={`/photo/members/${member.name.toLowerCase()}.${member.name.toLowerCase() === 'joy' || member.name.toLowerCase() === 'fay' ? 'jpg' : 'webp'}`}
                      alt={member.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-100 transition-all duration-700 grayscale hover:grayscale-0 scale-100 z-0"
                      onLoad={(e) => {
                        const placeholder = e.target.parentElement.querySelector('.no-signal-placeholder');
                        if (placeholder) placeholder.style.display = 'none';
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const placeholder = e.target.parentElement.querySelector('.no-signal-placeholder');
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />

                    <div className="no-signal-placeholder flex flex-col items-center justify-center text-center">
                       <div className="text-xl md:text-3xl text-[#111] font-black tracking-widest uppercase group-hover:text-[#FF0033]/20 transition-all duration-700">
                           NO SIGNAL
                       </div>
                       <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none text-[8rem] sm:text-[15rem] md:text-[18rem] font-black group-hover:opacity-10 transition-all duration-700" style={{ color: member.themeColor }}>
                         {member.symbol}
                       </div>
                    </div>
                </div>
            </div>

            {/* Info Container */}
            <div className="w-[65%] md:w-[62%] flex flex-col gap-3 sm:gap-5 md:gap-8 text-left pt-2 md:pt-4">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] md:text-[10px] font-black tracking-[0.2em] md:tracking-[0.4em] uppercase text-[#FF0033]">
                  {member.vibe}
                </span>
                <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">{member.name}</h2>
              </div>
              
              <div className="text-xs sm:text-xl md:text-2xl italic text-[#C0C0C0] font-bold border-l-2 md:border-l-4 border-[#FF0033] pl-3 md:pl-6 py-1 md:py-3">
                "{member.catchphrase}"
              </div>

              <div className="flex flex-col gap-2 md:gap-3 text-[9px] md:text-xs font-bold text-[#888] uppercase tracking-[0.15em] md:tracking-[0.25em]">
                <div className="flex items-center gap-2 md:gap-4">
                    <span className="text-[#FF0033]">●</span> MBTI: <span className="text-white">{member.mbti}</span>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    <span className="text-[#FF0033]">●</span> ZODIAC: <span className="text-white">{member.zodiac}</span>
                </div>
              </div>

              <div className="pt-2 md:pt-4">
                <a href={member.instagram} 
                   target="_blank" rel="noopener noreferrer"
                   className="btn-outline inline-block text-center text-[8px] md:text-[10px] px-4 md:px-8 py-2 md:py-2.5">
                   PROFIL LENGKAP
                </a>
              </div>
            </div>

          </div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default Members;










