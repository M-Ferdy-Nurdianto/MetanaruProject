import React from 'react';
import { motion } from 'framer-motion';

const EventSkeleton = () => {
    return (
        <div className="space-y-6">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="p-10 rounded-[2.5rem] border border-[var(--border-main)] bg-[var(--bg-main)] animate-pulse"
                >
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="text-center md:text-left min-w-full md:min-w-[120px]">
                            <div className="h-10 w-24 bg-black/5 dark:bg-white/5 rounded-lg mx-auto md:mx-0"></div>
                            <div className="h-3 w-16 bg-black/5 dark:bg-white/5 rounded mt-2 mx-auto md:mx-0"></div>
                        </div>

                        <div className="flex-grow space-y-4 w-full">
                            <div className="h-10 w-3/4 bg-black/5 dark:bg-white/5 rounded-xl mx-auto md:mx-0"></div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-8">
                                <div className="h-4 w-24 bg-black/5 dark:bg-white/5 rounded"></div>
                                <div className="h-4 w-24 bg-black/5 dark:bg-white/5 rounded"></div>
                            </div>
                        </div>

                        <div className="h-12 w-48 bg-vibrant-pink/10 rounded-full"></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default EventSkeleton;
