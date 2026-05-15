import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'HOME' },
    { path: '/members', label: 'MEMBER' },
    { path: '/posts', label: 'OTSU' },
    { path: '/merch', label: 'MERCH' },
    { path: '/cheki', label: 'TIKET' },
  ];

  return (
    <div className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 flex justify-center px-4 py-5 sm:py-6 ${isScrolled ? 'pt-4' : 'pt-8'}`}>
      
      {/* FLOATING PILL NAVBAR */}
      <nav className={`flex items-center justify-center w-full md:w-auto max-w-[980px] px-6 py-2 sm:py-3 glass-card rounded-2xl md:rounded-none border border-[#FF0033]/40 md:border-x-4 md:border-y-0 md:border-[#FF0033] relative transition-all duration-500 ${isScrolled ? 'bg-black/90 shadow-[0_0_40px_rgba(0,0,0,0.8)]' : 'bg-black/20'}`}>
        
        {/* LOGO - ABSOLUTE LEFT ON MOBILE */}
        <Link to="/" className="absolute left-6 md:static group flex items-center">
          <img src="/logos/logo.png" alt="METANARU" className="h-16 w-auto group-hover:rotate-12 transition-transform" />
        </Link>

        {/* TEXT - CENTERED */}
        <span className="text-lg sm:text-xl md:text-2xl font-metal tracking-widest text-white leading-none md:ml-3">METANARU</span>

        {/* NAVIGATION LINKS (DESKTOP) */}
        <div className="hidden md:flex gap-8 items-center border-l border-white/10 pl-8 ml-8">
           {navLinks.map((link) => (
             <Link
               key={link.path}
               to={link.path}
               className={`text-[10px] font-black tracking-[0.5em] uppercase transition-all duration-300 relative group ${
                 location.pathname === link.path ? 'text-[#fff500] drop-shadow-[0_0_8px_rgba(255,245,0,0.4)]' : 'text-[#888] hover:text-white'
               }`}
             >
               {link.label}
               <span className={`absolute -bottom-1 left-0 w-0 h-[2px] bg-[#fff500] shadow-[0_0_8px_rgba(255,245,0,0.6)] transition-all duration-300 ${location.pathname === link.path ? 'w-full' : 'group-hover:w-full'}`}></span>
             </Link>
           ))}
        </div>

        {/* MOBILE TOGGLE - ABSOLUTE RIGHT */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="md:hidden absolute right-6 text-white"
        >
          <div className="w-5 h-5 flex flex-col justify-between">
            <span className={`w-full h-0.5 bg-white transition-all ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`w-full h-0.5 bg-white transition-all ${isOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-full h-0.5 bg-white transition-all ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </div>
        </button>

      </nav>

      {/* MOBILE OVERLAY MENU - DISTORTED SIDEBAR STYLE */}
      <div className={`fixed inset-0 z-[60] pointer-events-none ${isOpen ? 'pointer-events-auto' : ''}`}>
        {/* Backdrop */}
        <div 
          onClick={() => setIsOpen(false)}
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        ></div>

        {/* Slanted Sidebar */}
        <div 
          className={`absolute top-0 right-0 h-full w-[80%] max-w-[320px] bg-[#0a0a0a] border-l-4 border-[#FF0033] transition-transform duration-500 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}
        >
           <button 
             onClick={() => setIsOpen(false)}
             className="absolute top-8 right-8 text-white/30 hover:text-white"
           >
             <span className="text-[10px] font-black uppercase tracking-widest">[ TUTUP ]</span>
           </button>

           <div className="flex-1 flex flex-col justify-center pl-16 pr-8 gap-8">
             {navLinks.map((link, index) => (
               <Link
                 key={link.path}
                 to={link.path}
                 onClick={() => setIsOpen(false)}
                 className={`group flex flex-col ${location.pathname === link.path ? 'text-white' : 'text-white/40'}`}
               >
                 <span className="text-[10px] font-black text-[#FF0033] mb-1 tracking-widest">0{index + 1}</span>
                 <span className="text-3xl font-black uppercase tracking-tighter group-hover:text-[#FF0033] group-hover:translate-x-2 transition-all">
                   {link.label}
                 </span>
                 <div className={`h-[1px] bg-gradient-to-r from-[#FF0033] to-transparent mt-2 transition-all duration-500 ${location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-1/2'}`}></div>
               </Link>
             ))}
           </div>

           {/* Sidebar Footer */}
           <div className="p-10 pl-16 border-t border-white/5 flex items-center gap-4">
              <img src="/logos/logo.png" alt="Logo" className="h-8 w-auto grayscale" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white tracking-widest uppercase">Metanaru</span>
                <span className="text-[8px] font-bold text-white/20 uppercase">Internal System v1.0</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

