'use client';

import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils/cn';
import { useAnimatedWord } from './useAnimatedWord';

interface AnimatedWordProps {
    word: string;
    className?: string;
    hoverColor?: string;
    onClick: () => void;
}

export default function AnimatedWord({
    word,
    className,
    hoverColor = 'deeppink',
    onClick
}: AnimatedWordProps) {
    const { textRef, isHovering, mousePosition, eventHandlers } = useAnimatedWord();

    const textClasses = cn( "text-6xl md:text-8xl tracking-tight select-none p-4", className );

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick();
    };

    return (
        <motion.div
            ref={textRef}
            className="relative text-center cursor-pointer group"
            onClick={handleClick}
            {...eventHandlers}
            initial={{ y: -8 }}
            animate={{ y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
        >
            {/* Base Text Layer (Color determined by parent + mix-blend) */}
            <h2 className={cn(textClasses, "relative")} aria-hidden="true">
                {word}
            </h2>

            {/* Hover Text Layer (Revealed Gradient) */}
            <h2 className={cn( textClasses, "absolute inset-0 z-10" )}
                style={{
                    color: hoverColor,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundImage: isHovering
                        ? `radial-gradient(circle 100px at ${mousePosition.x}px ${mousePosition.y}px, ${hoverColor} 50%, transparent 100%)`
                        : 'none',
                    opacity: isHovering ? 1 : 0,
                    transition: 'opacity 0.2s ease-in-out',
                    pointerEvents: 'none',
                }}
            >
                {word}
            </h2>
        </motion.div>
    );
} 