import React from 'react';
import { motion } from 'framer-motion';

const Loading = () => {
  return (
    <div className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="relative"
      >
        <div className="absolute inset-0 bg-[#FF0033] blur-[60px] opacity-20 rounded-full" />
        <img src="/logos/logo.png" alt="Loading..." className="w-24 sm:w-32 relative z-10 drop-shadow-[0_0_20px_rgba(255,0,51,0.5)]" />
      </motion.div>
      
      <div className="mt-12 flex flex-col items-center gap-4">
        <div className="w-48 h-[2px] bg-white/5 relative overflow-hidden">
          <motion.div 
            initial={{ left: '-100%' }}
            animate={{ left: '100%' }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-[#FF0033] to-transparent"
          />
        </div>
        <p className="text-[10px] font-black text-[#FF0033] uppercase tracking-[0.5em] animate-pulse">
          INITIALIZING CORE
        </p>
      </div>
    </div>
  );
};

export default Loading;
