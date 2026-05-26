import { useState, useRef, MouseEvent } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export function useAnimatedWord() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const textRef = useRef<HTMLDivElement>(null);
    const [isHoveringState, setIsHoveringState] = useState(false);

    const isDesktop = useMediaQuery('(min-width: 1024px)');

    const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
        if (!isDesktop || !textRef.current) return;
        const rect = textRef.current.getBoundingClientRect();
        setMousePosition({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        });
    };

    const handleMouseEnter = () => {
        if (!isDesktop) return;
        setIsHoveringState(true);
    };
    
    const handleMouseLeave = () => {
        if (!isDesktop) return;
        setIsHoveringState(false);
    };

    const isHovering = isHoveringState && isDesktop;

    return {
        textRef,
        isHovering,
        mousePosition,
        eventHandlers: {
            onMouseMove: handleMouseMove,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
        },
    };
} 