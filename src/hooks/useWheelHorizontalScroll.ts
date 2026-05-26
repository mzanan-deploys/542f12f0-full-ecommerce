import { useEffect, RefObject } from 'react';

interface UseWheelHorizontalScrollOptions {
    enabled?: boolean;
    scrollMultiplier?: number;
}

export function useWheelHorizontalScroll(
    scrollContainerRef: RefObject<Element | null>,
    options: UseWheelHorizontalScrollOptions = {}
) {
    const { enabled = true, scrollMultiplier = 2 } = options;

    useEffect(() => {
        const element = scrollContainerRef.current;
        if (!element || !(element instanceof HTMLElement) || !enabled) return;

        const handleWheel = (event: WheelEvent) => {
            const htmlElement = element as HTMLElement;
            const scrollableWidth = htmlElement.scrollWidth - htmlElement.clientWidth;
            if (scrollableWidth <= 0) return;

            const scrollAmountX = event.deltaX;
            const scrollAmountY = event.deltaY * scrollMultiplier;

            if (scrollAmountX === 0 && scrollAmountY === 0) return;

            event.preventDefault();
            
            htmlElement.scrollTo({
                left: htmlElement.scrollLeft + scrollAmountX + scrollAmountY,
            });
        };

        element.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            element.removeEventListener('wheel', handleWheel);
        };
    }, [scrollContainerRef, enabled, scrollMultiplier]);
} 