'use client';

import React from 'react';
import { UseFormSetValue, FieldErrors } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { cn } from "@/lib/utils/cn";
import { type AboutFormData } from '@/lib/schemas/aboutSchema';

export type AspectRatioValue = 'square' | 'video' | 'portrait';

interface AboutImageLayoutSelectorProps {
  selectedAspectRatio: AspectRatioValue;
  setValue: UseFormSetValue<AboutFormData>;
  errors: FieldErrors<AboutFormData>;
  isPending?: boolean;
}

export function AboutImageLayoutSelector({
  selectedAspectRatio,
  setValue,
  errors,
  isPending = false,
}: AboutImageLayoutSelectorProps) {
  const handleClick = (ratio: AspectRatioValue) => {
    if (isPending) return;
    setValue('image_aspect_ratio', ratio, { shouldDirty: true });
  };

  return (
    <div>
      <Label>Image Layout</Label>
      <div className="grid grid-cols-3 gap-4 mt-2">
        <div 
          onClick={() => handleClick('square')}
          className={cn(
            "group flex flex-col items-center justify-center space-y-3 rounded-md border-2 p-4 cursor-pointer transition-all",
            "border-muted bg-popover",
            selectedAspectRatio === 'square' 
              ? "border-primary bg-accent text-accent-foreground shadow-lg" 
              : "hover:bg-accent hover:text-accent-foreground hover:shadow-md",
            isPending && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className={cn(
            "preview-element border border-dashed rounded-sm w-16 h-16",
            selectedAspectRatio === 'square' ? "bg-accent-foreground" : "bg-muted/50 group-hover:bg-accent-foreground"
          )}></div>
          <span className="text-sm font-medium">Square</span>
        </div>
        <div 
          onClick={() => handleClick('video')}
          className={cn(
            "group flex flex-col items-center justify-center space-y-3 rounded-md border-2 p-4 cursor-pointer transition-all",
            "border-muted bg-popover",
            selectedAspectRatio === 'video' 
              ? "border-primary bg-accent text-accent-foreground shadow-lg" 
              : "hover:bg-accent hover:text-accent-foreground hover:shadow-md",
            isPending && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className={cn(
            "preview-element border border-dashed rounded-sm w-24 h-[54px]",
            selectedAspectRatio === 'video' ? "bg-accent-foreground" : "bg-muted/50 group-hover:bg-accent-foreground"
          )}></div>
          <span className="text-sm font-medium">Horizontal</span>
        </div>
        <div 
          onClick={() => handleClick('portrait')}
          className={cn(
            "group flex flex-col items-center justify-center space-y-3 rounded-md border-2 p-4 cursor-pointer transition-all",
            "border-muted bg-popover",
            selectedAspectRatio === 'portrait' 
              ? "border-primary bg-accent text-accent-foreground shadow-lg" 
              : "hover:bg-accent hover:text-accent-foreground hover:shadow-md",
            isPending && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className={cn(
            "preview-element border border-dashed rounded-sm w-[54px] h-24",
            selectedAspectRatio === 'portrait' ? "bg-accent-foreground" : "bg-muted/50 group-hover:bg-accent-foreground"
          )}></div>
          <span className="text-sm font-medium">Vertical</span>
        </div>
      </div>
      {errors.image_aspect_ratio && (
        <p className="text-sm font-medium text-destructive mt-1">
          {errors.image_aspect_ratio.message?.toString()}
        </p>
      )}
    </div>
  );
} 