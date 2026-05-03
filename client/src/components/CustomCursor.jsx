import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

const CustomCursor = () => {
    const [isHovering, setIsHovering] = useState(false);
    
    const mouseX = useSpring(0, { stiffness: 500, damping: 28 });
    const mouseY = useSpring(0, { stiffness: 500, damping: 28 });

    useEffect(() => {
        const moveMouse = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        const handleHover = () => setIsHovering(true);
        const handleUnhover = () => setIsHovering(false);

        window.addEventListener('mousemove', moveMouse);
        
        const interactiveElements = document.querySelectorAll('a, button, [role="button"]');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', handleHover);
            el.addEventListener('mouseleave', handleUnhover);
        });

        return () => {
            window.removeEventListener('mousemove', moveMouse);
            interactiveElements.forEach(el => {
                el.removeEventListener('mouseenter', handleHover);
                el.removeEventListener('mouseleave', handleUnhover);
            });
        };
    }, []);

    return (
        <motion.div
            style={{
                translateX: mouseX,
                translateY: mouseY,
            }}
            className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] hidden lg:flex items-center justify-center -ml-4 -mt-4"
        >
            <motion.div
                animate={{
                    scale: isHovering ? 2.5 : 1,
                    backgroundColor: isHovering ? 'rgba(212, 175, 55, 0.3)' : '#B50024',
                    border: isHovering ? '2px solid rgba(212, 175, 55, 0.8)' : '0px solid transparent'
                }}
                className="w-full h-full rounded-full shadow-lg"
            />
            {isHovering && (
                <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute text-[10px] font-black text-white uppercase"
                >
                    View
                </motion.span>
            )}
        </motion.div>
    );
};

export default CustomCursor;
