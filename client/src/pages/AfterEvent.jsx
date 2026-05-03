import React, { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { fetchPostEvents } from '../api';

const fallbackPosts = [
  {
    id: 'fallback-1',
    title: 'ASHES & GOLD',
    caption: 'Moshpit glow, gold flare, raw energy.',
    image_url: 'https://images.unsplash.com/photo-1514525253361-bee8718a74a2?auto=format&fit=crop&q=80&w=900',
    instagram_url: 'https://instagram.com/metanaru'
  },
  {
    id: 'fallback-2',
    title: 'FORGE NIGHT',
    caption: 'Forged in sound, bound in sweat.',
    image_url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&q=80&w=900',
    instagram_url: 'https://instagram.com/metanaru'
  },
  {
    id: 'fallback-3',
    title: 'CRIMSON WAVE',
    caption: 'Red lights, loud chants, no mercy.',
    image_url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=900',
    instagram_url: 'https://instagram.com/metanaru'
  }
];

const AfterEvent = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchPostEvents();
        if (Array.isArray(data)) {
          setPosts(data);
        }
      } catch (error) {
        console.error('Failed to load post events:', error);
      }
    };

    loadPosts();
  }, []);

  const visiblePosts = posts.length > 0 ? posts : fallbackPosts;

  return (
    <div className="min-h-screen bg-black relative">
        {/* Smoother, Multi-layered Hero Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(255,0,51,0.12)_0%,_transparent_80%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none"></div>
        
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FF0033]/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#fff500]/30 to-transparent"></div>
        

        <div className="container mx-auto px-4 relative z-10 text-center">
          <p className="text-[9px] sm:text-[10px] font-black tracking-[0.25em] sm:tracking-[0.5em] uppercase text-[#FF0033]">After Event</p>
          <h1 className="text-4xl sm:text-7xl md:text-8xl font-black tracking-tighter mt-4 text-gradient uppercase">OtsuPost Gallery</h1>
          <p className="text-[11px] sm:text-sm md:text-base text-[#888] mt-4 max-w-2xl mx-auto font-bold uppercase tracking-widest">
            Koleksi foto setelah event. Klik fotonya untuk menuju IG resmi.
          </p>
          
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
          {visiblePosts.map((post) => (
            <a
              key={post.id}
              href={post.instagram_url}
              target="_blank"
              rel="noreferrer"
              className="group"
            >
              <div className="relative overflow-hidden rounded-[1.25rem] sm:rounded-[2rem] border border-white/10 bg-black/40 shadow-2xl">
                <div className="aspect-[4/5]">
                  <img
                    src={post.image_url}
                    alt={post.title || 'After Event'}
                    className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-black">OPEN IG</span>
                  <ExternalLink size={16} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">{post.title || 'After Event'}</h3>
                <p className="text-[11px] sm:text-xs text-white/50 mt-1">{post.caption || 'Moshpit energy on loop.'}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AfterEvent;










