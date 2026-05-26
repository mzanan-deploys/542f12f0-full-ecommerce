import type { SetType } from '@/lib/schemas/setSchema';
import type { MutableRefObject } from 'react';
import { saveScrollPosition } from './scrollRestoration';

export const createScrollHandler = (
  selectedType: SetType | null,
  setSelectedType: (type: SetType) => void,
  setHasScrolledPastSelector: (value: boolean) => void,
  isScrollingProgrammatically: MutableRefObject<boolean>,
  hasRestoredScrollRef: MutableRefObject<boolean>,
  hasManuallyScrolledAfterRestore: MutableRefObject<boolean>
) => {
  return () => {
    if (isScrollingProgrammatically.current || !hasRestoredScrollRef.current) return;

    if (hasRestoredScrollRef.current && !hasManuallyScrolledAfterRestore.current) {
      hasManuallyScrolledAfterRestore.current = true;
    }

    const pathSelectorElement = document.getElementById("path-selector");
    if (pathSelectorElement && selectedType === null) {
      const rect = pathSelectorElement.getBoundingClientRect();
      if (rect.bottom < window.innerHeight * 0.2) {
        setSelectedType("DAY");
        setHasScrolledPastSelector(true);
      }
    }

    if (typeof window !== 'undefined') {
      saveScrollPosition(window.scrollY);
    }
  };
};

export const createBeforeUnloadHandler = () => {
  return () => {
    if (typeof window !== 'undefined') {
      saveScrollPosition(window.scrollY);
    }
  };
};

