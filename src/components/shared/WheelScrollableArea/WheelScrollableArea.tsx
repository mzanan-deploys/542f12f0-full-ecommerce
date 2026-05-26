"use client";

import React, { useRef, useEffect } from 'react';
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/utils/cn";
import { useWheelHorizontalScroll } from '@/hooks/useWheelHorizontalScroll';

const ScrollBar = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

interface WheelScrollableAreaProps extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  children: React.ReactNode;
  scrollMultiplier?: number;
  getViewportRef?: (ref: HTMLDivElement | null) => void;
}

export const WheelScrollableArea = React.forwardRef<
  HTMLDivElement,
  WheelScrollableAreaProps
>(({ className, children, scrollMultiplier, getViewportRef, ...props }, ref) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  useWheelHorizontalScroll(viewportRef, { enabled: true, scrollMultiplier });

  useEffect(() => {
    if (getViewportRef && viewportRef.current) {
      getViewportRef(viewportRef.current);
    }
  }, [getViewportRef]);

  return (
    <ScrollAreaPrimitive.Root
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        className="h-full w-full rounded-[inherit]"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar orientation="horizontal" />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
});
WheelScrollableArea.displayName = "WheelScrollableArea"; 