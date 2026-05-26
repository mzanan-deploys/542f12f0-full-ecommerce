'use client';

import React from 'react';
import Image from 'next/image';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, Trash2, GripVertical } from 'lucide-react';
import type { DisplayImageItem } from './ImageUploadSection'; 

interface SortableImageItemProps {
    item: DisplayImageItem;
    onRemove: () => void;
    isPending: boolean;
    aspectRatio?: 'square' | 'portrait' | 'video';
}

export const SortableImageItem = ({ 
    item, 
    onRemove, 
    isPending, 
    aspectRatio = 'square'
}: SortableImageItemProps) => {
    const { 
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : undefined,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none',
    };

    let buttonTitle = "Remove image";
    let ButtonIcon = Trash2;

    if (item.isExisting) {
        if (item.isMarkedForDelete) {
            buttonTitle = "Undo mark for deletion";
            ButtonIcon = X; 
        } else {
            buttonTitle = "Mark for deletion";
        }
    } else {
        buttonTitle = "Remove staged image";
    }

    const isVideo = aspectRatio === 'video' && (
        (typeof item.file?.type === 'string' && item.file.type.startsWith('video/')) ||
        (typeof item.url === 'string' && /\.(mp4|webm|ogg)$/i.test(item.url))
    );

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative group border rounded-md overflow-hidden bg-muted ${aspectRatio === 'portrait' ? 'w-48 aspect-[9/16]' : aspectRatio === 'video' ? 'w-96 aspect-video' : 'w-48 aspect-square'}`}
        >
            {isVideo ? (
                <video
                    key={`${item.id}-${item.url}-video`}
                    src={item.url}
                    className={`h-full w-full object-cover ${item.isMarkedForDelete ? 'opacity-30' : ''}`}
                    controls
                    muted
                    playsInline
                    loop
                />
            ) : (
            <Image
                key={`${item.id}-${item.url}`}
                src={item.url} 
                alt={item.file?.name ?? `Image ${item.id}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" 
                className={`object-cover ${item.isMarkedForDelete ? 'opacity-30' : ''}`}
                unoptimized={!item.isExisting}
            />
            )}
            {!item.isMarkedForDelete && (
                <button
                    {...attributes}
                    {...listeners}
                    type="button"
                    className="absolute bottom-1 left-1 p-0.5 bg-black/40 hover:bg-black/60 text-white rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                    aria-label="Drag to reorder"
                    disabled={isPending}
                >
                    <GripVertical className="h-4 w-4" />
                </button>
            )}
            <button
                type="button"
                onClick={onRemove}
                className={`absolute top-1 right-1 p-1 rounded-full text-white transition-colors 
                            ${item.isExisting && item.isMarkedForDelete 
                                ? 'bg-yellow-500 hover:bg-yellow-600' 
                                : 'bg-red-600 hover:bg-red-700'
                            } 
                            opacity-0 group-hover:opacity-100 focus:opacity-100 z-10`}
                title={buttonTitle}
                disabled={isPending}
            >
                <ButtonIcon className="h-4 w-4" />
            </button>
            {item.isExisting && item.isMarkedForDelete && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-xs font-semibold p-1 text-center">
                    MARKED FOR DELETION
                </div>
            )}
        </div>
    );
}; 