import React from 'react';
import { Link } from 'react-router-dom';
import { SOCIAL_LINKS } from '../constants';

const Footer = () => {
  return (
      <footer className="bg-black border-t border-white/5 py-10 sm:py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Simple Social Links */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-8">
           {Object.entries(SOCIAL_LINKS).map(([key, url]) => (
             <a key={key} href={url} target="_blank" rel="noopener noreferrer" 
                className="text-[#888] hover:text-[#fff500] font-black text-[9px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.4em] uppercase transition-all">
                {key.split('_')[0]}
             </a>
           ))}
        </div>

        {/* Bottom Info */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/5">
           <div className="text-[10px] font-black text-[#FF0033] tracking-[0.35em] sm:tracking-[0.4em] uppercase">
              METANARU
           </div>
           
           <div className="text-[8px] sm:text-[9px] font-bold text-[#444] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-center">
              © {new Date().getFullYear()} DIKEMBANGKAN OLEH 
              <a href="https://m-ferdy-nurdianto.github.io/JuraganWebsite/" 
                 target="_blank" rel="noopener noreferrer"
                 className="text-[#fff500] hover:text-white ml-1 transition-all font-black drop-shadow-[0_0_8px_rgba(255,245,0,0.6)]">
                 JURAGAN WEBSITE
              </a>
              <Link to="/login" className="text-[7px] text-[#111] hover:text-[#FF0033] ml-4 transition-all uppercase tracking-[0.3em] font-black opacity-20 hover:opacity-100">
                [S]
              </Link>
           </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

