import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, Calendar, Music } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: "BORN FROM FIRE",
    subtitle: "METALCORE PRAYER",
    description: "Setiap teriakanmu jadi bahan bakar. Di sini, semua amarah kita diubah jadi anthem METANARU. Siap masuk ke pit?",
    image: "/photo/hero/intro.jpg",
    fallback: "https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=2000",
    type: "INTRO",
    accent: "text-vibrant-pink"
  },
  {
    id: 2,
    title: "IRON BLOOM",
    subtitle: "Single Terbaru • Out Now",
    description: "Babak baru dimulai. \"Iron Bloom\" jadi saksi perjalanan METANARU. Putar volumenya, jangan pelan-pelan.",
    image: "/photo/hero/memoire.jpg",
    fallback: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=2070",
    type: "RELEASE",
    accent: "text-vibrant-blue"
  },
  {
    id: 3,
    title: "PIT RITUAL",
    subtitle: "Jangan Lewatkan Malamnya",
    description: "Setiap event adalah ritual baru. Pastikan namamu tercatat dan jadi bagian dari ledakan METANARU bulan ini.",
    image: "/photo/hero/live.jpg",
    fallback: "https://images.unsplash.com/photo-1514525253361-bee8718a74a2?auto=format&fit=crop&q=80&w=2000",
    type: "EVENT",
    accent: "text-purple-400"
  }
];

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-[90vh] sm:h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background Slides */}
      <AnimatePresence>
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
        >
          {/* Ken Burns Effect Image */}
            <img 
               src={slides[current].image} 
               alt={slides[current].title}
               className="absolute inset-0 w-full h-full object-cover"
               onError={(e) => {
                  e.target.src = slides[current].fallback;
               }}
            />
          
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80" />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
          
          {/* Colored Tint Overlay */}
          <div className={`absolute inset-0 opacity-20 mix-blend-overlay ${
            slides[current].accent.includes('blue') ? 'bg-blue-600' : 
            slides[current].accent.includes('pink') ? 'bg-pink-600' : 'bg-purple-600'
          }`} />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 text-center max-w-5xl px-5 sm:px-6 pt-24 sm:pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 100,
              damping: 20,
              mass: 1
            }}
            className="flex flex-col items-center"
          >
            {/* Badge */}
            <motion.div 
               initial={{ letterSpacing: "0.2em", opacity: 0 }}
               animate={{ letterSpacing: "0.4em", opacity: 1 }}
               className="mb-4 border-b border-white/30 pb-2"
            >
              <span className="text-[9px] sm:text-[10px] md:text-xs font-black uppercase text-white tracking-[0.25em] sm:tracking-[0.35em] md:tracking-[0.4em]">
                {slides[current].subtitle}
              </span>
            </motion.div>

            {/* 3D Logo with AOS */}
            <div 
              className="mb-4 relative group"
              data-aos="zoom-in"
              data-aos-delay="200"
              style={{ willChange: 'transform, opacity' }}
            >
              <div className="text-3xl sm:text-5xl md:text-7xl font-brand text-vibrant-pink tracking-[0.15em] sm:tracking-[0.2em] drop-shadow-[0_20px_50px_rgba(181,0,36,0.6)]">
                METANARU
              </div>
              <div className="absolute inset-0 bg-vibrant-pink/25 blur-[60px] rounded-full animate-pulse -z-0" />
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-7xl font-brand italic font-black mb-4 tracking-tighter text-white leading-[0.98] sm:leading-[0.95] drop-shadow-2xl">
              {slides[current].title}
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base md:text-xl text-white/80 max-w-2xl mb-8 font-medium leading-relaxed drop-shadow-lg">
              {slides[current].description}
            </p>

            {/* CTA Removed as requested */}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-6 sm:bottom-12 flex items-center gap-4 sm:gap-6 z-20">
        <div className="flex gap-2 sm:gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className="relative h-1 w-8 sm:w-12 bg-white/20 rounded-full overflow-hidden"
            >
              {index === current && (
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 6, ease: "linear" }}
                  className="absolute inset-0 bg-vibrant-pink"
                />
              )}
            </button>
          ))}
        </div>
        <div className="text-[9px] sm:text-[10px] font-bold text-white/50 tracking-widest">
          0{current + 1} / 0{slides.length}
        </div>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-12 left-12 w-24 h-24 border-l border-t border-white/20 -z-10 hidden sm:block" />
      <div className="absolute bottom-12 right-12 w-24 h-24 border-r border-b border-white/20 -z-10 hidden sm:block" />
    </div>
  );
};

export default HeroCarousel;
