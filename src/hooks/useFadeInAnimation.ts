'use client';

import { useEffect, useState, useRef } from 'react';

interface UseFadeInAnimationOptions {
  delay?: number;
  duration?: number;
  threshold?: number;
  translateX?: number;
  translateY?: number;
}

export function useFadeInAnimation<T extends HTMLElement>({
  delay = 0,
  duration = 600,
  threshold = 0.1,
  translateX = 0,
  translateY = 20,
}: UseFadeInAnimationOptions = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isVisible) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
        }
      },
      {
        threshold,
        rootMargin: '50px',
      }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [delay, threshold, isVisible]);

  const animationStyles = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible 
      ? 'translateX(0) translateY(0)' 
      : `translateX(${translateX}px) translateY(${translateY}px)`,
    transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
  };

  return {
    elementRef,
    animationStyles,
    isVisible,
  };
} 