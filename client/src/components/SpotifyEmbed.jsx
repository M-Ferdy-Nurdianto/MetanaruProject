import React from 'react';
import { motion } from 'framer-motion';

const SpotifyEmbed = ({ url, height = "152" }) => {
  const embedUrl = url.includes("/embed/") ? url : url.replace("https://open.spotify.com/", "https://open.spotify.com/embed/");

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ scale: 1.01 }}
      className="rounded-3xl shadow-2xl overflow-hidden border transition-colors duration-500"
      style={{ 
        backgroundColor: 'var(--bg-main)', 
        borderColor: 'var(--border-main)',
        boxShadow: 'var(--shadow-lg)'
      }}
    >
      <iframe
        style={{ borderRadius: '12px' }}
        src={embedUrl}
        width="100%"
        height={height}
        frameBorder="0"
        allowFullScreen=""
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      ></iframe>
    </motion.div>
  );
};

export default SpotifyEmbed;
