import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchMembers } from '../api';
import { Sparkles, ChevronRight, Cake, Users, Instagram, Heart, ArrowLeft, Search } from 'lucide-react';
import SkeletonImage from '../components/SkeletonImage';
import { getMemberImageSrc, getMemberFallbackImage } from '../utils/memberImages';

const desktopSlideVariants = {
    initial: (direction) => ({
        x: direction > 0 ? 40 : -40,
        opacity: 0,
        scale: 0.98
    }),
    animate: {
        x: 0,
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 30,
            mass: 0.8
        }
    },
    exit: (direction) => ({
        x: direction > 0 ? -40 : 40,
        opacity: 0,
        scale: 0.98,
        transition: {
            duration: 0.2,
            ease: 'easeInOut'
        }
    })
};

const mobileSlideVariants = {
    initial: (direction) => ({
        x: direction > 0 ? 25 : -25,
        opacity: 0
    }),
    animate: {
        x: 0,
        opacity: 1,
        transition: {
            duration: 0.3,
            ease: [0.25, 0.1, 0.25, 1]
        }
    },
    exit: (direction) => ({
        x: direction > 0 ? -25 : 25,
        opacity: 0,
        transition: {
            duration: 0.2,
            ease: 'easeInOut'
        }
    })
};

const MemberDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [hoveredId, setHoveredId] = useState(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const previousIdRef = useRef(id);
    const directionRef = useRef(1);

    const filteredMembers = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();
        if (!keyword) return members;
        return members.filter((member) => member.nickname.toLowerCase().includes(keyword));
    }, [members, searchTerm]);

    const selectedMember = useMemo(() => {
        return members.find((member) => String(member.id) === String(id)) || null;
    }, [members, id]);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                const data = await fetchMembers();
                const formattedData = data
                    .map((m) => ({
                        ...m,
                        themeColor: m.theme_color || m.themeColor
                    }))
                    .sort((a, b) => Number(a.id) - Number(b.id));

                if (!isMounted) return;
                setMembers(formattedData);
            } finally {
                if (isMounted) {
                    setInitialLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 767px)');
        const syncMobile = () => setIsMobile(mediaQuery.matches);

        syncMobile();
        mediaQuery.addEventListener('change', syncMobile);

        return () => mediaQuery.removeEventListener('change', syncMobile);
    }, []);

    if (id !== previousIdRef.current) {
        const previousId = previousIdRef.current;
        const prevNumber = Number(previousId);
        const nextNumber = Number(id);

        if (Number.isFinite(prevNumber) && Number.isFinite(nextNumber) && prevNumber !== nextNumber) {
            directionRef.current = nextNumber > prevNumber ? 1 : -1;
        } else {
            const prevIndex = members.findIndex((member) => String(member.id) === String(previousId));
            const nextIndex = members.findIndex((member) => String(member.id) === String(id));

            if (prevIndex >= 0 && nextIndex >= 0 && prevIndex !== nextIndex) {
                directionRef.current = nextIndex > prevIndex ? 1 : -1;
            }
        }

        previousIdRef.current = id;
    }

    const flipDirection = directionRef.current;

    if (initialLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-[var(--bg-main)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-vibrant-pink border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-black uppercase tracking-widest text-vibrant-pink">Loading Stars...</p>
                </div>
            </div>
        );
    }

    if (!selectedMember) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-[var(--bg-main)] p-6 text-center">
                <h2 className="text-4xl font-black mb-4 text-[var(--text-main)]">Member Tidak Ditemukan</h2>
                <Link to="/members" className="vibrant-button">Kembali ke Daftar</Link>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] w-full flex flex-col bg-[var(--bg-main)] relative overflow-hidden pt-20 transition-colors duration-500">
            {/* Background Effects */}
            <div className="playful-bg opacity-80 dark:opacity-30" />
            <div className="grain-overlay" />
            
            {/* Global Glows for consistency */}
            <div className="absolute top-[10%] left-[-10%] w-[240px] sm:w-[400px] md:w-[800px] h-[240px] sm:h-[400px] md:h-[800px] bg-vibrant-pink/20 dark:bg-vibrant-pink/10 rounded-full blur-[80px] sm:blur-[100px] md:blur-[160px] -z-0 pointer-events-none" style={{ contain: 'strict', transform: 'translateZ(0)' }} />
            <div className="absolute bottom-[10%] right-[-10%] w-[240px] sm:w-[400px] md:w-[600px] h-[240px] sm:h-[400px] md:h-[600px] bg-vibrant-blue/20 dark:bg-vibrant-blue/10 rounded-full blur-[80px] sm:blur-[100px] md:blur-[140px] -z-0 pointer-events-none" style={{ contain: 'strict', transform: 'translateZ(0)' }} />

            <div className="w-full flex-1 flex justify-center p-2 sm:p-3 md:p-6 lg:py-6 lg:px-8 relative z-10 transition-all min-h-0">
                <div className="w-full max-w-7xl h-full relative">
                    <div className="bg-[var(--card-bg)] w-full h-full rounded-[1.75rem] md:rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl relative border border-[var(--border-main)]">
                        <div className="hidden md:flex w-64 bg-[var(--bg-subtle)] border-r border-[var(--border-main)] flex-col overflow-hidden shrink-0">
                            <div className="p-8 border-b border-[var(--border-main)] pt-10">
                                <h3 className="text-sm font-black text-[var(--text-main)] tracking-tight uppercase">Daftar Member</h3>
                                <div className="mt-4 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
                                    <input
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Cari member..."
                                        className="w-full bg-[var(--card-bg)] border border-[var(--border-main)] rounded-lg pl-9 pr-4 py-2 text-[10px] outline-none focus:border-vibrant-pink transition-colors text-[var(--text-main)] placeholder-[var(--text-muted)]"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 custom-scrollbar">
                                {filteredMembers.map((m) => (
                                    <button
                                        key={m.id}
                                        onMouseEnter={() => setHoveredId(m.id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                        onClick={() => navigate(`/members/${m.id}`)}
                                        className={`w-full text-left px-8 py-3 text-[10px] font-black uppercase transition-all duration-300 border-l-4 flex items-center justify-between group ${
                                            selectedMember.id === m.id
                                                ? 'bg-[var(--bg-subtle)] text-[var(--text-main)]'
                                                : 'text-[var(--text-muted)] border-transparent hover:bg-[var(--bg-subtle)] opacity-70 hover:opacity-100'
                                        }`}
                                        style={{
                                            color: (selectedMember.id === m.id || hoveredId === m.id) 
                                                ? ((m.themeColor?.toUpperCase() === '#F8F9FA' || m.themeColor?.toUpperCase() === '#FFFFFF') ? 'var(--vibrant-pink)' : m.themeColor || '#ff1b8d') 
                                                : '',
                                            borderLeftColor: selectedMember.id === m.id 
                                                ? (selectedMember.themeColor || '#ff1b8d') 
                                                : 'transparent',
                                            textShadow: (selectedMember.id === m.id && (m.themeColor?.toUpperCase() === '#F8F9FA' || m.themeColor?.toUpperCase() === '#FFFFFF')) ? '0 0 8px rgba(255,27,141,0.3)' : 'none'
                                        }}
                                    >
                                        {m.nickname}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col bg-[var(--card-bg)] overflow-hidden relative">
                            <AnimatePresence mode="wait" initial={false} custom={flipDirection}>
                                <motion.div
                                    key={id}
                                    variants={isMobile ? mobileSlideVariants : desktopSlideVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    className="h-full overflow-y-auto flex flex-col p-4 sm:p-5 lg:p-8 pt-5 lg:pt-8 pb-5 custom-scrollbar min-h-[500px]"

                                >
                                    <div className="flex flex-col items-start mb-3 md:mb-2 shrink-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Link to="/members" className="p-2 bg-[var(--bg-subtle)] text-[var(--text-muted)] rounded-full hover:bg-vibrant-pink hover:text-white transition-all transform hover:scale-110 border border-[var(--border-main)] border-opacity-50">
                                                <ArrowLeft size={14} />
                                            </Link>
                                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] md:tracking-[0.4em] text-[var(--text-muted)]">VIEOS PROFILE</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 text-[9px] md:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none">
                                            <Link to="/" className="hover:text-vibrant-pink transition-colors">Home</Link>
                                            <ChevronRight size={8} />
                                            <Link to="/members" className="hover:text-vibrant-pink transition-colors">Members</Link>
                                            <ChevronRight size={8} />
                                            <span style={{ 
                                                color: selectedMember.themeColor,
                                                textShadow: (selectedMember.themeColor?.toUpperCase() === '#F8F9FA' || selectedMember.themeColor?.toUpperCase() === '#FFFFFF') ? '0 0 5px rgba(0,0,0,0.2)' : 'none',
                                                WebkitTextStroke: (selectedMember.themeColor?.toUpperCase() === '#F8F9FA' || selectedMember.themeColor?.toUpperCase() === '#FFFFFF') ? '0.5px rgba(0,0,0,0.1)' : 'none'
                                             }}>{selectedMember.nickname}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col lg:flex-row gap-5 items-stretch">
                                        <div className="w-full max-w-[260px] sm:max-w-[280px] lg:max-w-[300px] flex flex-col items-center justify-center shrink-0 mx-auto lg:mx-0">
                                            <motion.div
                                                initial={{ scale: 0.95, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                                className="relative p-2 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col w-full aspect-[4/5]"
                                                style={{ backgroundColor: selectedMember.themeColor }}
                                            >
                                                <Sparkles className="absolute top-4 left-4 text-white opacity-80 animate-pulse" size={16} fill="white" />
                                                <Sparkles className="absolute bottom-4 right-4 text-white opacity-80 animate-pulse" size={16} fill="white" />

                                                <div className="bg-[var(--card-bg)] p-1.5 rounded-2xl flex flex-col flex-1 w-full h-full min-h-0 relative z-10 border border-[var(--border-main)]">
                                                    <div className="relative rounded-xl overflow-hidden bg-[var(--bg-subtle)] group flex-1 w-full h-full min-h-0">
                                                        <SkeletonImage
                                                            src={getMemberImageSrc(selectedMember)}
                                                            fallbackSrc={getMemberFallbackImage(selectedMember)}
                                                            alt={selectedMember.nickname}
                                                            wrapperClassName="absolute inset-0"
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-8 flex flex-col justify-end translate-y-2 group-hover:translate-y-0 transition-transform">
                                                            <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2">
                                                                {selectedMember.role && selectedMember.role !== 'Member'
                                                                    ? selectedMember.role
                                                                    : (selectedMember.fullname || selectedMember.name || '').includes(',')
                                                                        ? (selectedMember.fullname || selectedMember.name).split(',')[1].trim()
                                                                        : (selectedMember.gelar || 'VIEOS')}
                                                            </span>
                                                            <h4 className="text-4xl font-brand italic text-white leading-none capitalize">
                                                                {selectedMember.nickname.toLowerCase()}
                                                            </h4>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>

                                        <div className="flex-1 w-full flex flex-col gap-2 md:gap-3 pb-2 justify-center">
                                            <div className="mb-4 relative group/header">
                                                <span className="relative z-10 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] block mb-0.5 ml-1">Selection Star</span>
                                                <div className="relative z-10 flex flex-wrap items-baseline gap-2 mb-1">
                                                    <h1 
                                                        className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter transition-all duration-500 relative" 
                                                        style={{ 
                                                            color: selectedMember.themeColor,
                                                            filter: (selectedMember.themeColor?.toUpperCase() === '#F8F9FA' || selectedMember.themeColor?.toUpperCase() === '#FFFFFF')
                                                                ? 'drop-shadow(0 0 10px rgba(0,0,0,0.15)) drop-shadow(0 0 20px rgba(255,27,141,0.2))'
                                                                : (selectedMember.themeColor?.toUpperCase() === '#000000' || selectedMember.themeColor?.toUpperCase() === '#1A1A1D')
                                                                    ? 'drop-shadow(0 0 12px rgba(255,255,255,0.4))'
                                                                    : `drop-shadow(0 0 15px ${selectedMember.themeColor}33)`
                                                        }}
                                                    >
                                                        {selectedMember.nickname}
                                                    </h1>
                                                    <Sparkles size={16} style={{ color: selectedMember.themeColor }} className="animate-spin-slow opacity-80" />
                                                </div>
                                                <div className="h-0.5 w-full bg-gradient-to-r from-[var(--border-main)] via-[var(--border-main)] to-transparent mb-2 opacity-50" />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-3xl">
                                                <div className="bg-[var(--bg-subtle)] border border-[var(--border-main)] p-3 rounded-[1.25rem] flex items-center gap-3 hover:border-vibrant-pink/40 transition-all group backdrop-blur-md">
                                                    <div className="p-2.5 rounded-xl transition-all group-hover:bg-vibrant-pink group-hover:text-white shrink-0 bg-white dark:bg-black/20 font-bold" 
                                                         style={{ 
                                                            color: selectedMember.themeColor,
                                                            border: (selectedMember.themeColor?.toUpperCase() === '#F8F9FA' || selectedMember.themeColor?.toUpperCase() === '#FFFFFF') ? '1px solid rgba(0,0,0,0.1)' : 'none',
                                                            boxShadow: (selectedMember.themeColor?.toUpperCase() === '#F8F9FA' || selectedMember.themeColor?.toUpperCase() === '#FFFFFF') ? 'inset 0 0 10px rgba(0,0,0,0.02)' : 'none'
                                                         }}>
                                                        <Cake size={16} />
                                                    </div>
                                                    <div>
                                                        <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest block mb-0.5">Birthday</span>
                                                        <span className="text-xs sm:text-sm font-bold text-[var(--text-main)] tracking-tight">
                                                            {(selectedMember.birth_date || '-')
                                                                .replace(/,?\s?\d{4}$/, '')
                                                                .replace(/^\d{4}-/, '')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="bg-[var(--bg-subtle)] border border-[var(--border-main)] p-3 rounded-[1.25rem] flex items-center gap-3 hover:border-vibrant-pink/40 transition-all group backdrop-blur-md">
                                                    <div className="p-2.5 rounded-xl transition-all group-hover:bg-vibrant-pink group-hover:text-white shrink-0 bg-white dark:bg-black/20 font-bold" 
                                                         style={{ 
                                                            color: selectedMember.themeColor,
                                                            border: (selectedMember.themeColor?.toUpperCase() === '#F8F9FA' || selectedMember.themeColor?.toUpperCase() === '#FFFFFF') ? '1px solid rgba(0,0,0,0.1)' : 'none',
                                                            boxShadow: (selectedMember.themeColor?.toUpperCase() === '#F8F9FA' || selectedMember.themeColor?.toUpperCase() === '#FFFFFF') ? 'inset 0 0 10px rgba(0,0,0,0.02)' : 'none'
                                                         }}>
                                                        <Users size={16} />
                                                    </div>
                                                    <div>
                                                        <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest block mb-0.5">Color Persona</span>
                                                        <span className="text-xs sm:text-sm font-bold text-[var(--text-main)] tracking-tight">
                                                            {selectedMember.role && selectedMember.role !== 'Member'
                                                                ? selectedMember.role
                                                                : (selectedMember.fullname || selectedMember.name || '').includes(',')
                                                                    ? (selectedMember.fullname || selectedMember.name).split(',')[1].trim()
                                                                    : (selectedMember.gelar || 'Member')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="bg-[var(--bg-subtle)] border border-[var(--border-main)] p-3 rounded-[1.25rem] flex items-start gap-3 hover:border-vibrant-pink/40 transition-all group md:col-span-2 backdrop-blur-md">
                                                    <div className="p-2.5 rounded-xl transition-all group-hover:rotate-12 shrink-0 bg-white dark:bg-black/20 font-bold" 
                                                         style={{ 
                                                            color: selectedMember.themeColor,
                                                            border: (selectedMember.themeColor?.toUpperCase() === '#F8F9FA' || selectedMember.themeColor?.toUpperCase() === '#FFFFFF') ? '1px solid rgba(0,0,0,0.1)' : 'none',
                                                            boxShadow: (selectedMember.themeColor?.toUpperCase() === '#F8F9FA' || selectedMember.themeColor?.toUpperCase() === '#FFFFFF') ? 'inset 0 0 10px rgba(0,0,0,0.02)' : 'none'
                                                         }}>
                                                        <Heart size={16} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest block mb-0.5">Jikoshoukai</span>
                                                        <p className="text-xs sm:text-sm font-bold text-[var(--text-main)] italic leading-snug">
                                                            &quot;{selectedMember.jiko || 'Halo semua! Saya member dari VIEOS.'}&quot;
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="bg-[var(--bg-subtle)] border border-[var(--border-main)] p-3 rounded-[1.25rem] flex items-center gap-3 hover:border-vibrant-pink/40 transition-all group md:col-span-2 backdrop-blur-md">
                                                    <div className="p-2.5 rounded-xl transition-all group-hover:scale-110 shrink-0 bg-white dark:bg-black/20 font-bold" 
                                                         style={{ 
                                                            color: selectedMember.themeColor,
                                                            border: (selectedMember.themeColor?.toUpperCase() === '#F8F9FA' || selectedMember.themeColor?.toUpperCase() === '#FFFFFF') ? '1px solid rgba(0,0,0,0.1)' : 'none',
                                                            boxShadow: (selectedMember.themeColor?.toUpperCase() === '#F8F9FA' || selectedMember.themeColor?.toUpperCase() === '#FFFFFF') ? 'inset 0 0 10px rgba(0,0,0,0.02)' : 'none'
                                                         }}>
                                                        <Instagram size={16} />
                                                    </div>
                                                    <div>
                                                        <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest block mb-0.5">Social Media</span>
                                                        <a 
                                                            href={`https://instagram.com/${(selectedMember.instagram || 'vieos.idol').replace(/^@/, '')}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-xs sm:text-sm font-bold text-[var(--text-main)] underline decoration-vibrant-pink/30 hover:text-vibrant-pink transition-colors cursor-pointer"
                                                        >
                                                            {selectedMember.instagram || '@vieos.idol'}
                                                        </a>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className="mt-8 md:hidden shrink-0 px-2"
                                        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
                                    >
                                        <div className="flex gap-3 overflow-x-auto px-1 py-2 scrollbar-none">
                                            {members.map((m) => (
                                                <button
                                                    key={m.id}
                                                    onClick={() => navigate(`/members/${m.id}`)}
                                                    className={`shrink-0 flex flex-col items-center gap-1 origin-center transition-all ${selectedMember.id === m.id ? 'scale-100 opacity-100' : 'opacity-45 scale-95'}`}
                                                >
                                                    <div
                                                        className="w-14 h-14 rounded-full overflow-hidden border-2 p-0.5"
                                                        style={{ borderColor: selectedMember.id === m.id ? m.themeColor : 'transparent' }}
                                                    >
                                                        <SkeletonImage
                                                            src={getMemberImageSrc(m)}
                                                            fallbackSrc={getMemberFallbackImage(m)}
                                                            alt={m.nickname}
                                                            wrapperClassName="w-full h-full rounded-full"
                                                            className="w-full h-full object-cover rounded-full"
                                                        />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberDetail;









