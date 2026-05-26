'use client';

import { useEffect, useRef } from 'react';
import { useScrollRestorationContext } from '@/components/providers/ScrollRestorationProvider';

interface UseScrollRestorationOptions {
  key: string;
  restoreOnReload?: boolean;
  restoreOnNavigation?: boolean;
  smoothRestore?: boolean;
  delay?: number;
}

export function useScrollRestoration({
  key,
  restoreOnReload = true,
  restoreOnNavigation = true,
  smoothRestore = true,
  delay = 100
}: UseScrollRestorationOptions) {
  const { isInitialLoadInSession } = useScrollRestorationContext();
  const hasRestoredRef = useRef(false);
  const isRestoringRef = useRef(false);

  useEffect(() => {
    if (hasRestoredRef.current) return;
    
    const attemptScrollRestoration = () => {
      const navigationEntries = typeof window !== 'undefined' ? performance.getEntriesByType("navigation") : [];
      const navigationType = navigationEntries.length > 0 ? (navigationEntries[0] as PerformanceNavigationTiming).type : null;

      let shouldRestore = false;
      
      if (restoreOnReload && navigationType === 'reload') {
        shouldRestore = true;
      } else if (restoreOnNavigation && !isInitialLoadInSession) {
        shouldRestore = true;
      }

      if (shouldRestore) {
        const savedScrollPos = localStorage.getItem(key);
        
        if (savedScrollPos) {
          const scrollPos = parseInt(savedScrollPos, 10);
          
          if (!isNaN(scrollPos) && scrollPos > 0) {
            isRestoringRef.current = true;
            hasRestoredRef.current = true;
            
            setTimeout(() => {
              if (smoothRestore) {
                window.scrollTo({ top: scrollPos, behavior: 'smooth' });
              } else {
                window.scrollTo(0, scrollPos);
              }
              
              setTimeout(() => {
                isRestoringRef.current = false;
              }, smoothRestore ? 1000 : 100);
            }, delay);
          }
        } else {
          window.scrollTo(0, 0);
        }
      } else {
        window.scrollTo(0, 0);
      }
    };

    if (typeof window !== 'undefined') {
      if (document.readyState === 'complete') {
        attemptScrollRestoration();
      } else {
        window.addEventListener('load', attemptScrollRestoration, { once: true });
      }
    }

    const handleScroll = () => {
      if (!isRestoringRef.current && typeof window !== 'undefined') {
        localStorage.setItem(key, String(window.scrollY));
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('load', attemptScrollRestoration);
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [key, isInitialLoadInSession, restoreOnReload, restoreOnNavigation, smoothRestore, delay]);

  return {
    isRestoring: isRestoringRef.current,
    clearScrollPosition: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    }
  };
} 