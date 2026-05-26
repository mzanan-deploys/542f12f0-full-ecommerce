import React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import type { ImageItem } from '@/types/product'; 
import type { ProductFormData } from '@/lib/schemas/productSchema';
import type { UseFormSetValue } from 'react-hook-form';

interface UseProductImageManagementProps {
    initialImages?: { id: string; image_url: string }[];
    setValue?: UseFormSetValue<ProductFormData>; 
}

export function useProductImageManagement({ initialImages, setValue }: UseProductImageManagementProps) {
    const [allImages, setAllImages] = useState<ImageItem[]>([]);

    useEffect(() => {
        const newInitialItems: ImageItem[] = initialImages?.map((img, index) => ({
            id: img.id,
            url: img.image_url,
            isExisting: true,
            isMarkedForDelete: false,
            originalIndex: index,
        })) ?? [];

        setAllImages(prevImages => {
            const stagedImages = prevImages.filter(p => !p.isExisting && p.file);
            
            return [...newInitialItems, ...stagedImages];
        });
    }, [initialImages]);

    const imageIds = useMemo(() => allImages.map(img => img.id), [allImages]);

    const handleImageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && setValue) {
            const files = Array.from(event.target.files);
            const newStagedItems: ImageItem[] = [];
            const filesToUploadForHookForm: File[] = [];

            files.forEach(file => {
                const previewUrl = URL.createObjectURL(file);
                const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                const renamedFile = new File([file], `${tempId}___${file.name}`, { type: file.type });

                newStagedItems.push({
                    id: tempId,
                    url: previewUrl,
                    file: renamedFile,
                    isExisting: false,
                });
                filesToUploadForHookForm.push(renamedFile);
            });

            let updatedAllImagesState: ImageItem[] = [];
            setAllImages(prev => {
                updatedAllImagesState = [...prev, ...newStagedItems];
                return updatedAllImagesState;
            });
            
            setValue('images', 
                     updatedAllImagesState
                        .filter(img => !img.isExisting && img.file)
                        .map(img => img.file as File),
                     { shouldDirty: true });

            if (event.target) event.target.value = "";
        }
    }, [setValue, allImages]);

    const handleRemoveStagedFile = useCallback((idToRemove: string) => {
        setAllImages(prev => {
            const fileToRemove = prev.find(img => img.id === idToRemove && !img.isExisting);
            if (fileToRemove && fileToRemove.url.startsWith('blob:')) {
                URL.revokeObjectURL(fileToRemove.url);
            }
            return prev.filter(img => img.id !== idToRemove);
        });
    }, []);

    const handleMarkDelete = useCallback((idToMark: string) => {
        setAllImages(prev =>
            prev.map(img =>
                img.id === idToMark && img.isExisting
                    ? { ...img, isMarkedForDelete: !img.isMarkedForDelete }
                    : img
            )
        );
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            let newItems: ImageItem[] = [];
            setAllImages((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                newItems = arrayMove(items, oldIndex, newIndex);
                return newItems;
            });
            
            if (setValue) {
                const currentFiles = newItems
                   .filter(img => !img.isExisting && img.file)
                   .map(img => img.file as File);
                setValue('images', currentFiles, { shouldDirty: true });
            }
        }
    }, [setValue]);

    return {
        allImages,
        imageIds,
        setAllImages, 
        handleImageChange,
        handleRemoveStagedFile,
        handleMarkDelete,
        sensors,
        handleDragEnd,
    };
} 