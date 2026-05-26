'use client';

import React, { forwardRef } from 'react';
import type { SetType } from '@/lib/schemas/setSchema';
import { usePathSelector } from '@/hooks/usePathSelector';
import AnimatedWord from '../AnimatedWord/AnimatedWord';

interface PathSelectorProps {
  selectedType: SetType | null;
  onSelectType: (type: SetType) => void;
  onDiagonalAnimationComplete?: () => void;
}

const PathSelector = forwardRef<HTMLElement, PathSelectorProps>((
  { 
    selectedType, 
    onSelectType,
    onDiagonalAnimationComplete
  }, 
  ref
) => {
  const { setHoveredPath, whiteSideRef, getDiagonalPosition } = usePathSelector({
    selectedType,
    onDiagonalAnimationComplete: onDiagonalAnimationComplete || (() => { }),
  });

  const { topPosition, bottomPosition } = getDiagonalPosition();

  const handleDayClick = () => {
    onSelectType('DAY');
  };

  const handleNightClick = () => {
    onSelectType('NIGHT');
  };

  return (
    <section id="path-selector" ref={ref} className="relative h-dvh w-full max-w-[100vw] overflow-hidden snap-start">
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-center z-20">
        <p className="text-lg font-medium text-gray-500 mb-2">Choose your path</p>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Click a side or scroll to continue</span>
        </div>
      </div>

      <div
        ref={whiteSideRef}
        className="absolute inset-0 bg-white flex items-center cursor-pointer z-10"
        style={{
          clipPath: `polygon(0 0, ${topPosition}% 0, ${bottomPosition}% 100%, 0 100%)`,
          transition: "clip-path 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          width: '100%',
          maxWidth: '100vw',
          overflow: 'hidden'
        }}
        onClick={handleDayClick}
        onMouseEnter={() => setHoveredPath('DAY')}
        onMouseLeave={() => setHoveredPath(null)}
      >
        <div className="ml-[20%] lg:ml-[33%]">
          <AnimatedWord 
            word="Day" 
            onClick={handleDayClick}
            className="text-4xl md:text-7xl lg:text-8xl font-medium text-gray-800 font-['Cormorant_Garamond'] mb-4 w-full"
            hoverColor="silver"
          />
        </div>
      </div>

      <div
        className="absolute inset-0 bg-black flex items-center justify-end cursor-pointer z-0"
        style={{
          width: '100%',
          maxWidth: '100vw',
          overflow: 'hidden'
        }}
        onClick={handleNightClick}
        onMouseEnter={() => setHoveredPath('NIGHT')}
        onMouseLeave={() => setHoveredPath(null)}
      >
        <div className="mr-[20%] lg:mr-[33%]">
          <AnimatedWord
            word="Night"
            onClick={handleNightClick}
            className="text-4xl md:text-7xl lg:text-8xl font-medium text-white font-['Great_Vibes'] mb-4 italic"
            hoverColor="red"
          />
        </div>
      </div>
    </section>
  );
});

PathSelector.displayName = 'PathSelector';

export default PathSelector; 