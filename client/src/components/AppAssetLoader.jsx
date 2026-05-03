import React, { useEffect, useState } from 'react';
import { LOCAL_MEMBER_IMAGES } from '../utils/memberImages';

const BOOT_IMAGES = [
    '/photo/hero/hero.webp',
    '/photo/about/about-hero.webp',
    '/photo/hero/intro.jpg',
    '/assets/qris.webp',
    ...LOCAL_MEMBER_IMAGES
];

const preloadImage = (src) =>
    new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve();
        image.onerror = () => resolve();
        image.src = src;
    });

const AppAssetLoader = ({ children }) => {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadAssets = async () => {
            await Promise.all(BOOT_IMAGES.map(preloadImage));
            if (isMounted) {
                setIsReady(true);
            }
        };

        loadAssets();

        return () => {
            isMounted = false;
        };
    }, []);

    if (!isReady) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0b0b0d]">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-white/20 border-t-vibrant-pink animate-spin" />
                    <p className="text-[11px] font-black uppercase tracking-[0.35em] text-white/80">
                        Loading Assets
                    </p>
                </div>
            </div>
        );
    }

    return children;
};

export default AppAssetLoader;
