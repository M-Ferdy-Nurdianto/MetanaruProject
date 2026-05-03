import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ y: 50, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 20, opacity: 0, scale: 0.9 }}
      className="fixed bottom-10 left-0 right-0 mx-auto w-max z-[200] flex items-center gap-3 bg-black/90 text-white px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/10"
    >
      {type === 'success' ? (
        <CheckCircle2 size={18} className="text-vibrant-green" />
      ) : (
        <AlertCircle size={18} className="text-vibrant-pink" />
      )}
      <span className="text-[10px] font-black uppercase tracking-widest">{message}</span>
      <button onClick={onClose} className="ml-4 opacity-30 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </motion.div>
  );
};

export default Toast;
