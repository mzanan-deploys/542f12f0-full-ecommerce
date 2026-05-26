'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { XCircle } from 'lucide-react';
import { DndContext, closestCenter, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import type { UseFormReturn } from 'react-hook-form';
import { SortableImageItem } from '@/components/admin/shared/SortableImageItem';

export type DisplayImageItem = {
    id: string;
    url: string;
    isExisting: boolean;
    isMarkedForDelete?: boolean;
    file?: File;
    position?: number | null;
};

interface ImageUploadSectionProps {
    form: UseFormReturn<any>;
    displayImages: DisplayImageItem[];
    imageIds: string[];
    handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleMarkOrRemove: (id: string, isExisting: boolean) => void;
    sensors: ReturnType<typeof useSensors>;
    handleDragEnd: (event: DragEndEvent) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    isPending: boolean;
    entityName?: string;
    aspectRatio?: 'square' | 'portrait' | 'video'
    maxImages?: number;
}

export function ImageUploadSection({
    form,
    displayImages,
    sensors,
    fileInputRef,
    isPending,
    entityName = "item",
    aspectRatio,
    handleMarkOrRemove,
    handleImageChange,
    handleDragEnd,
    maxImages
}: ImageUploadSectionProps) {
    const [hasMounted, setHasMounted] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isPending) {
            setProgress(0);
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) return prev;
                    return prev + 10;
                });
            }, 500);
        } else {
            setProgress(100);
        }
        return () => clearInterval(interval);
    }, [isPending]);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    const imagesToRender = displayImages.filter(img => !img.isMarkedForDelete);
    const imageIdsToRender = imagesToRender.map(img => img.id);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{aspectRatio === 'video' ? 'Media' : 'Images'}</CardTitle>
                {form.formState.errors.images?.message && (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.images.message as string}</p>
                )}
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex items-center gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        multiple={maxImages !== 1}
                        accept={aspectRatio === 'video' ? 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/ogg' : 'image/jpeg,image/png,image/webp,image/gif'}
                        style={{ display: 'none' }}
                        id={`file-upload-${entityName}`}
                        disabled={isPending}
                    />
                    <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isPending}
                    >
                        {isPending ? 'Uploading...' : `Upload ${maxImages === 1 ? (aspectRatio === 'video' ? 'Media' : 'Image') : (aspectRatio === 'video' ? 'Media' : 'Images')}`}
                    </Button>
                    {imagesToRender.length > 0 && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                displayImages.forEach(img => {
                                    if (!img.isMarkedForDelete) {
                                        handleMarkOrRemove(img.id, img.isExisting);
                                    }
                                });
                            }}
                            className="text-destructive hover:text-destructive"
                            disabled={isPending}
                        >
                            <XCircle className="mr-1 h-4 w-4" /> {imagesToRender.length > 1 ? 'Remove all' : 'Remove'}
                        </Button>
                    )}
                </div>

                {isPending && imagesToRender.length > 0 && imagesToRender[0].id === 'uploading' && (
                    <div className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed rounded-lg">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-2"></div>
                        <p className="text-sm text-muted-foreground font-medium">Uploading media...</p>
                        <Progress value={progress} className="w-[60%]" />
                    </div>
                )}

                {!isPending && imagesToRender.length === 0 && maxImages !== 1 && (
                    <p className="text-sm text-destructive mt-2">
                        Images are required.
                    </p>
                )}

                {hasMounted && imagesToRender.length > 0 && imagesToRender[0].id !== 'uploading' && (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={imageIdsToRender} strategy={rectSortingStrategy}>
                            <div className={`flex gap-4 ${aspectRatio === 'video' ? 'flex-col' : 'flex-wrap'}`}>
                                {imagesToRender.map((item, _index) => (
                                    <SortableImageItem
                                        key={item.id}
                                        item={item}
                                        onRemove={() => handleMarkOrRemove(item.id, item.isExisting)}
                                        isPending={isPending}
                                        aspectRatio={aspectRatio}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </CardContent>
        </Card>
    );
} 