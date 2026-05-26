'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { RotateCw } from 'lucide-react';

interface InfiniteScrollListProps {
  children: React.ReactNode;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  className?: string;
  threshold?: number;
}

export function InfiniteScrollList({
  children,
  hasMore,
  isLoading,
  onLoadMore,
  className = '',
  threshold = 100
}: InfiniteScrollListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom < threshold) {
      onLoadMore();
    }
  }, [isLoading, hasMore, onLoadMore, threshold]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (!loadingRef.current || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadingRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div ref={containerRef} className={`overflow-y-auto ${className}`}>
      {children}
      
      {hasMore && (
        <div ref={loadingRef} className="flex items-center justify-center p-4">
          {isLoading && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <RotateCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading more...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 