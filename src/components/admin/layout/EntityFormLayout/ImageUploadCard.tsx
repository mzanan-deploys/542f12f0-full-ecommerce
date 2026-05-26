import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';

export interface ImageUploadCardProps {
    image: any;
    aspectRatio?: 'square' | 'portrait' | 'video' | null;
    onMarkOrRemove: (id: string, isExisting: boolean) => void;
    disabled: boolean;
}

export function ImageUploadCard({ image, aspectRatio, onMarkOrRemove, disabled }: ImageUploadCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: image.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const imageSrc = image.image_url || (image.file && URL.createObjectURL(image.file));

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="cursor-pointer"
        >
            <CardContent className="p-4">
                <div className={`bg-gray-100 rounded flex items-center justify-center ${
                    aspectRatio === 'square' ? 'aspect-square' :
                    aspectRatio === 'portrait' ? 'aspect-[3/4]' :
                    aspectRatio === 'video' ? 'aspect-video' :
                    'aspect-square'
                }`}>
                    {imageSrc ? (
                        <Image
                            src={imageSrc}
                            alt="Preview"
                            width={200}
                            height={200}
                            className="w-full h-full object-cover rounded"
                        />
                    ) : (
                        <span className="text-sm text-gray-500">Image</span>
                    )}
                </div>
                <button
                    onClick={() => onMarkOrRemove(image.id, !!image.image_url)}
                    disabled={disabled}
                    className="mt-2 text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                    {image.isMarkedForDelete ? 'Restore' : 'Remove'}
                </button>
            </CardContent>
        </Card>
    );
} 