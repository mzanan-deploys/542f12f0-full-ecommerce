'use client';

import { useState, useRef, useEffect } from 'react';
import type { SetType } from '@/lib/schemas/setSchema';

interface UsePathSelectorProps {
  selectedType: SetType | null;
  onDiagonalAnimationComplete: () => void;
}

export function usePathSelector({ selectedType, onDiagonalAnimationComplete }: UsePathSelectorProps) {
  const [hoveredPath, setHoveredPath] = useState<SetType | null>(null);
  const whiteSideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const whiteSideElement = whiteSideRef.current;
    if (!whiteSideElement) return;

    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.propertyName === "clip-path" && selectedType) {
        onDiagonalAnimationComplete();
      }
    };

    whiteSideElement.addEventListener("transitionend", handleTransitionEnd);
    return () => {
      whiteSideElement.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, [selectedType, onDiagonalAnimationComplete]);

  const getDiagonalPosition = () => {
    let topPosition = 60;
    let bottomPosition = 40;

    if (selectedType === 'NIGHT') {
      topPosition = 100;
      bottomPosition = 0;
    }

    if (selectedType === 'DAY') {
      topPosition = 0;
      bottomPosition = 100;
    }

    if (hoveredPath === 'NIGHT' && !selectedType) {
      topPosition = 80;
      bottomPosition = 20;
    }

    if (hoveredPath === 'DAY' && !selectedType) {
      topPosition = 40;
      bottomPosition = 60;
    }

    return {
      topPosition,
      bottomPosition,
    };
  };

  return {
    hoveredPath,
    setHoveredPath,
    whiteSideRef,
    getDiagonalPosition,
  };
} 