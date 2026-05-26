export const calculateScrollTarget = (elementId: string, offset: number = 65): number | null => {
  const element = document.getElementById(elementId);
  if (!element) return null;
  
  const elementTop = element.getBoundingClientRect().top;
  const currentScrollY = window.scrollY;
  return currentScrollY + elementTop - offset;
};

export const scrollToTarget = (targetScrollY: number): void => {
  window.scrollTo({
    top: targetScrollY,
    behavior: 'smooth'
  });
};

export const scrollToElement = (elementId: string, offset: number = 65): boolean => {
  const targetScrollY = calculateScrollTarget(elementId, offset);
  if (targetScrollY === null) return false;
  
  scrollToTarget(targetScrollY);
  return true;
};

export const getScrollPositionFromStorage = (key: string): number | null => {
  if (typeof window === 'undefined') return null;
  
  const savedScrollPos = localStorage.getItem(key);
  if (!savedScrollPos) return null;
  
  const scrollPos = parseInt(savedScrollPos, 10);
  return isNaN(scrollPos) ? null : scrollPos;
};

export const isInSetsSection = (scrollPos: number, viewportHeight: number): boolean => {
  return scrollPos > viewportHeight * 0.5;
}; 