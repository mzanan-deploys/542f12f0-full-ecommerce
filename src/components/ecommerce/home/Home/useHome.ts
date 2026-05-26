import { useState, useEffect, useRef, useMemo } from 'react';
import type { SetType } from '@/lib/schemas/setSchema';
import type { HomePageItemOrchestrator } from '@/types/home';
import { useScrollRestorationContext } from '@/components/providers/ScrollRestorationProvider';
import { shouldRestoreScroll, getSavedScrollPosition, restoreScrollToPosition } from '@/lib/helpers/scrollRestoration';
import { createScrollHandler, createBeforeUnloadHandler } from '@/lib/helpers/homeScrollHandlers';

export function useHome(homepageItemsData: HomePageItemOrchestrator[]) {
  const [selectedType, setSelectedType] = useState<SetType | null>(null);
  const [hasScrolledPastSelector, setHasScrolledPastSelector] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  const autoScrollEnabledRef = useRef(false);
  const whiteSectionRef = useRef<HTMLDivElement>(null);
  const blackSectionRef = useRef<HTMLDivElement>(null);
  const isScrollingProgrammatically = useRef(false);
  const hasRestoredScrollRef = useRef(false);
  const hasManuallyScrolledAfterRestore = useRef(false);
  const { isInitialLoadInSession } = useScrollRestorationContext();

  useEffect(() => {
    if (hasRestoredScrollRef.current) return;

    const performRestore = () => {
      if (!shouldRestoreScroll(isInitialLoadInSession)) {
        hasRestoredScrollRef.current = true;
        return;
      }

      const savedPos = getSavedScrollPosition();
      if (savedPos) {
                isScrollingProgrammatically.current = true;
        restoreScrollToPosition(savedPos, () => {
          hasRestoredScrollRef.current = true;
          setTimeout(() => {
            isScrollingProgrammatically.current = false;
          }, 500);
        });
      } else {
        hasRestoredScrollRef.current = true;
      }
    };

    if (typeof window !== 'undefined') {
      if (document.readyState === 'complete') {
        performRestore();
      } else {
        window.addEventListener('load', performRestore, { once: true });
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('load', performRestore);
      }
    };
  }, [isInitialLoadInSession]);

  useEffect(() => {
    const handleScroll = createScrollHandler(
      selectedType,
      setSelectedType,
      setHasScrolledPastSelector,
      isScrollingProgrammatically,
      hasRestoredScrollRef,
      hasManuallyScrolledAfterRestore
    );

    const handleBeforeUnload = createBeforeUnloadHandler();

    window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener("scroll", handleScroll);
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [selectedType, setSelectedType, setHasScrolledPastSelector]);

  useEffect(() => {
    if (shouldAutoScroll && (whiteSectionRef.current || blackSectionRef.current)) {
      const timeoutId = setTimeout(() => {
        isScrollingProgrammatically.current = true;

        const effectiveSelectedType = selectedType || "DAY";
        const targetSection = effectiveSelectedType === "DAY" ? whiteSectionRef.current : blackSectionRef.current;

        if (targetSection) {
          targetSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

          setTimeout(() => {
            isScrollingProgrammatically.current = false;
          }, 1000);
        }

        setShouldAutoScroll(false);
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [shouldAutoScroll, selectedType]);

  const handlePathSelect = (type: SetType) => {
    isScrollingProgrammatically.current = false;
    const wasAlreadySelected = selectedType === type;
    setSelectedType(type);
    setHasScrolledPastSelector(true);
    autoScrollEnabledRef.current = true;
    
    if (wasAlreadySelected) {
      setShouldAutoScroll(true);
    }
  };

  const handleDiagonalAnimationComplete = () => {
    if (autoScrollEnabledRef.current) {
    setShouldAutoScroll(true);
    }
  };

  const processedHomepageItems = useMemo(() => 
    homepageItemsData?.map(item => {
      if (item.item_type === 'set') {
        return {
          ...item,
          set_images: item.set_images || [],
          set_products: item.set_products || []
        };
      }
      return item;
    }) || [],
    [homepageItemsData]
  );

  const effectiveSelectedType = selectedType || "DAY";

  return {
    selectedType,
    hasScrolledPastSelector,
    whiteSectionRef,
    blackSectionRef,
    handlePathSelect,
    handleDiagonalAnimationComplete,
    processedHomepageItems,
    effectiveSelectedType
  };
} 