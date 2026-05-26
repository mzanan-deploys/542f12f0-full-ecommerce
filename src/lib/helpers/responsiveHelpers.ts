export interface EffectiveDimensions {
  width: number;
  height: number;
}

export const getEffectiveDimensions = (
  containerDimensions?: { width: number; height: number },
  isClient: boolean = false
): EffectiveDimensions => {
  const defaultWidth = isClient && typeof window !== 'undefined' ? window.innerWidth : 1024;
  const defaultHeight = isClient && typeof window !== 'undefined' ? window.innerHeight : 768;

  return {
    width: containerDimensions?.width || defaultWidth,
    height: containerDimensions?.height || defaultHeight
  };
};

export const getCurrentViewportDimensions = (): EffectiveDimensions => {
  if (typeof window === 'undefined') {
    return { width: 1024, height: 768 };
  }
  
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}; 