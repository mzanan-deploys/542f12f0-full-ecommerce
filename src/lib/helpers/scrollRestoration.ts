const SCROLL_POS_KEY = 'homeScrollPos';

export const saveScrollPosition = (position: number) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SCROLL_POS_KEY, String(position));
  }
};

export const getSavedScrollPosition = (): number | null => {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem(SCROLL_POS_KEY);
  if (!saved) return null;
  const pos = parseInt(saved, 10);
  return isNaN(pos) || pos <= 0 ? null : pos;
};

export const shouldRestoreScroll = (isInitialLoadInSession: boolean): boolean => {
  if (typeof window === 'undefined') return false;
  
  const navigationEntries = performance.getEntriesByType("navigation");
  const navigationType = navigationEntries.length > 0 
    ? (navigationEntries[0] as PerformanceNavigationTiming).type 
    : null;

  return navigationType === 'reload' 
    || navigationType === 'back_forward' 
    || !isInitialLoadInSession;
};

export const restoreScrollToPosition = (
  position: number,
  onComplete?: () => void
) => {
  if (typeof window === 'undefined') return;

  setTimeout(() => {
    const targetElement = document.elementFromPoint(window.innerWidth / 2, position);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'auto', block: 'start' });
    } else {
      window.scrollTo({ top: position, behavior: 'auto' });
    }
    onComplete?.();
  }, 200);
};

