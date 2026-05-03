import React from 'react';

const MemberCardSkeleton = ({ count = 10 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="w-full animate-pulse"
          style={{ animationDelay: `${idx * 80}ms` }}
        >
          {/* Card Frame - matches real card aspect ratio exactly */}
          <div className="relative aspect-[4/5] rounded-xl overflow-hidden border-[6px] border-white/10 dark:border-white/5 bg-black/5 dark:bg-white/5">
            {/* Shimmer effect */}
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_ease-in-out_infinite]"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,105,180,0.06) 40%, rgba(255,105,180,0.12) 50%, rgba(255,105,180,0.06) 60%, transparent 100%)',
                  animationDelay: `${idx * 120}ms`
                }}
              />
            </div>
            
            {/* Fake content lines for visual interest */}
            <div className="absolute bottom-4 left-4 right-4 space-y-2">
              <div className="h-3 w-16 rounded-full bg-white/10 dark:bg-white/8" />
            </div>

            {/* Corner bracket accents to match real card */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-white/10" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-white/10" />
          </div>

          {/* Name Tag placeholder - matches real layout */}
          <div className="mt-5 flex flex-col items-center gap-2">
            <div className="h-4 w-20 rounded-full bg-black/8 dark:bg-white/8" />
            <div className="h-2 w-28 rounded-full bg-black/5 dark:bg-white/5" />
          </div>
        </div>
      ))}
    </>
  );
};

export default MemberCardSkeleton;
