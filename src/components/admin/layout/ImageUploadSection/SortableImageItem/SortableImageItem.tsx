'use client';

import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical } from 'lucide-react';
import Image from 'next/image';
import type { DisplayImageItem } from '@/components/admin/layout/EntityFormLayout/useEntityForm';

interface SortableImageItemProps {
  item: DisplayImageItem;
  onRemove: (id: string) => void;
  isPending: boolean;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
}

export const SortableImageItem: React.FC<SortableImageItemProps> = ({ 
  item, 
  onRemove, 
  isPending,
  aspectRatio = 'square'
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const {
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: item.id,
    disabled: isPending
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const aspectRatioClass = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]'
  }[aspectRatio];

  const handleRemove = () => {
    if (!isPending) {
      onRemove(item.id);
    }
  };

  if (!mounted) {
    return (
      <div className={`relative group ${aspectRatioClass} bg-muted rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/25`}>
        <Card className="h-full border-0 shadow-none">
          <div className="relative h-full w-full">
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-muted-foreground text-sm">Loading...</div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${aspectRatioClass} bg-muted rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors ${
        item.isMarkedForDelete ? 'opacity-50' : ''
      }`}
    >
      <Card className="h-full border-0 shadow-none">
        <div className="relative h-full w-full">
          {item.url && (
            <Image
              src={item.url}
              alt={`Image ${item.position ?? 0}`}
              fill
              className={`object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
          
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-muted-foreground text-sm">Loading...</div>
            </div>
          )}

          <div
            className="absolute bottom-1 left-1 p-0.5 bg-black/40 hover:bg-black/60 text-white rounded cursor-grab active:cursor-grabbing"
            {...listeners}
          >
            <GripVertical size={14} />
          </div>

          <Button
            variant="destructive"
            size="sm"
            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
            disabled={isPending}
          >
            <Trash2 size={12} />
          </Button>

          {item.isMarkedForDelete && (
            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
              <span className="text-red-700 font-medium bg-white/90 px-2 py-1 rounded text-xs">
                Will be removed
              </span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}; 