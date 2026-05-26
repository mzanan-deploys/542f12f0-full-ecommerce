'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { type AboutFormData, aboutFormSchema } from '@/lib/schemas/aboutSchema';
import { useEntityForm, type InitialImage } from '@/components/admin/layout/EntityFormLayout/useEntityForm';
import { fetchAboutContentAction, saveAboutContentAction } from '@/lib/actions/aboutActions';
import type { AspectRatioValue, UseAboutFormReturn } from '@/types/admin';

export function useAboutForm(): UseAboutFormReturn {
    const initialLoadedImageUrlsRef = useRef<string[]>([]);

    const entityFormHook = useEntityForm<AboutFormData, any, { text_content?: string | null; image_aspect_ratio?: AspectRatioValue }>({
        schema: aboutFormSchema,
        initialData: { text_content: '', image_aspect_ratio: 'square' },
        initialImages: [],
        config: { maxImages: 4, nameFieldName: 'text_content' },
        serverAction: async (_prev, formData) => saveAboutContentAction(formData),
    });

    const {
        state: entityFormState,
        setValue,      
        setInitialImages, 
        watch,         
        handleMarkDelete, 
        handleRemoveStaged,
        reset,
    } = entityFormHook; 
    
    const selectedAspectRatio = watch('image_aspect_ratio') || 'square';
    const newStagedFiles = (watch('images') as File[] | undefined || []) as File[];

    const loadData = useCallback(async () => {
        const result = await fetchAboutContentAction();
        if (result.data) {
            setValue('text_content', result.data.text_content || '');
            setValue('image_aspect_ratio', result.data.image_aspect_ratio || 'square');
            initialLoadedImageUrlsRef.current = result.data.image_urls?.filter((url): url is string => typeof url === 'string') || [];
            const imagesToSet: InitialImage[] = initialLoadedImageUrlsRef.current.map((url: string, index: number): InitialImage => ({
                id: url,
                image_url: url,
                position: index,
            }));
            setInitialImages(imagesToSet);
            reset({
                text_content: result.data.text_content || '',
                image_aspect_ratio: result.data.image_aspect_ratio || 'square',
                images: []
            } as AboutFormData, {
                keepDirty: false,
                keepErrors: false,
            });
        } else if (result.error) {
            console.error("Error loading about content:", result.error);
        }
    }, [setValue, setInitialImages, reset]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        if (entityFormState?.success) {
            loadData();
        }
    }, [entityFormState, loadData]);

    const currentImagesToDisplayFiltered = useMemo(() => {
        return entityFormHook.displayImages.filter(img => !img.isMarkedForDelete);
    }, [entityFormHook.displayImages]);
    
    const imagesChanged = useMemo(() => {
        if (currentImagesToDisplayFiltered.length !== initialLoadedImageUrlsRef.current.length) return true;
        if (newStagedFiles.length > 0) return true; 
        const currentUrls = currentImagesToDisplayFiltered.map(img => img.url).sort();
        const initialUrls = [...initialLoadedImageUrlsRef.current].sort();
        return !currentUrls.every((url, index) => url === initialUrls[index]);
    }, [currentImagesToDisplayFiltered, newStagedFiles]);

    const hasAtLeastOneImage = useMemo(() => {
        return currentImagesToDisplayFiltered.length > 0 || newStagedFiles.length > 0;
    }, [currentImagesToDisplayFiltered, newStagedFiles]);

    const isSaveDisabledBoolean = entityFormHook.isPending || (!entityFormHook.formState.isDirty && !imagesChanged) || !hasAtLeastOneImage;

    const handleImageMarkOrRemoveCallback = useCallback((id: string, isExisting: boolean) => {
        if (isExisting) {
            handleMarkDelete(id); 
        } else {
            handleRemoveStaged(id); 
        }
    }, [handleMarkDelete, handleRemoveStaged]); 

    return {
        entityFormHook, 
        selectedAspectRatio,
        newStagedFiles,
        currentImagesToDisplay: currentImagesToDisplayFiltered, 
        imagesChanged,
        hasAtLeastOneImage,
        isSaveDisabled: isSaveDisabledBoolean,
        handleImageMarkOrRemove: handleImageMarkOrRemoveCallback,
    };
} 