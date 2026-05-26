import React from 'react';
import { useMemo, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useEntityForm, type InitialImage } from '@/components/admin/layout/EntityFormLayout/useEntityForm';
import { heroContentFormSchema, type HeroContentFormData, HERO_CONTENT_ID } from '@/lib/schemas/heroSchema';
import { useHeroContent } from '@/lib/queries/heroQueries';
import { wrappedUpsertHeroContentAction } from '@/lib/helpers/heroHelpers';
import { deleteHeroImageAction } from '@/lib/actions/deleteHeroImageAction';
import { toast } from 'sonner';
import type { HeroDbRow } from '@/types/hero';

export function useHeroSettings(initialDataFromProps: HeroDbRow | null) {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const {
    data: heroDataFromQuery,
    error: heroError,
  } = useHeroContent(); 

  const initialEntityImages: InitialImage[] = useMemo(() => {
    const imageUrl = heroDataFromQuery?.image_url ?? initialDataFromProps?.image_url;
    return imageUrl
      ? [{ id: `hero-image-${HERO_CONTENT_ID}`, image_url: imageUrl, position: 0 }]
      : [];
  }, [heroDataFromQuery?.image_url, initialDataFromProps?.image_url]);

  const currentHeroData = heroDataFromQuery ?? initialDataFromProps;

  const initialData = useMemo(() => {
    return currentHeroData
      ? { 
          id: String(currentHeroData.id),
          image_url: currentHeroData.image_url,
          updated_at: currentHeroData.updated_at,
          title: currentHeroData.title || '',
          subtitle: currentHeroData.subtitle || '',
        } 
      : { 
          id: String(HERO_CONTENT_ID), 
          image_url: null,
          updated_at: '',
          title: '',
          subtitle: '',
        };
  }, [currentHeroData]);

  const formHookResult = useEntityForm<HeroContentFormData, Omit<HeroDbRow, 'id'> & { id: string }, Omit<HeroDbRow, 'id'> & { id: string }>({
    schema: heroContentFormSchema,
    serverAction: wrappedUpsertHeroContentAction, 
    initialData,
    initialImages: initialEntityImages,
    config: {
      maxImages: 1,
    },
  });

  const { 
    register,
    handleSubmit,
    onSubmit,
    state: formActionState, 
    sensors, 
    handleDragEnd, 
    fileInputRef,
  } = formHookResult;

  const [isUploading, setIsUploading] = useState(false);

  const handleHeroImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      console.log('[HERO UI] No files selected');
      return;
    }

    const file = files[0];

    setIsUploading(true);

    const formData = new FormData();
    formData.append('id', String(HERO_CONTENT_ID));
    formData.append('images', file, file.name);
    if (currentHeroData?.image_url) {
      formData.append('current_image_url', currentHeroData.image_url);
    }

    try {
      const result = await wrappedUpsertHeroContentAction(null, formData);

      if (result.success) {
        toast.success(result.message || 'Hero image uploaded');
        queryClient.invalidateQueries({ queryKey: ['heroContent', HERO_CONTENT_ID] });
      } else {
        toast.error(result.error || result.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('[HERO UI] Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      if (event.target) event.target.value = '';
    }
  }, [currentHeroData, queryClient]);

  const handleDeleteHeroImage = useCallback(async () => {
    setIsDeleting(true);
    
    try {
      const result = await deleteHeroImageAction();
      
      if (result.success) {
        toast.success(result.message || 'Hero image deleted');
        await queryClient.invalidateQueries({ queryKey: ['heroContent', HERO_CONTENT_ID] });
        await queryClient.refetchQueries({ queryKey: ['heroContent', HERO_CONTENT_ID] });
      } else {
        toast.error(result.error || 'Failed to delete image');
      }
    } catch (error) {
      console.error('[HERO UI] Delete error:', error);
      toast.error('Failed to delete image');
    } finally {
      setIsDeleting(false);
    }
  }, [queryClient]);

  const displayImages = useMemo(() => {
    if (isUploading) {
      return [{
        id: 'uploading',
        url: '',
        isExisting: false,
        isMarkedForDelete: false,
      }];
    }
    
    if (isDeleting) {
      return [];
    }
    
    const imageUrl = heroDataFromQuery?.image_url ?? initialDataFromProps?.image_url;
    
    return imageUrl
      ? [{
          id: `hero-image-${HERO_CONTENT_ID}`,
          url: imageUrl,
          isExisting: true,
          isMarkedForDelete: false,
        }]
      : [];
  }, [heroDataFromQuery?.image_url, initialDataFromProps?.image_url, isUploading, isDeleting]);

  const imageIds = useMemo(() => displayImages.map(img => img.id), [displayImages]);

  return {
    formHookResult,
    currentHeroData,
    register,
    handleSubmit,
    onSubmit,
    isPending: isUploading || isDeleting,
    formActionState,
    displayImages,
    imageIds,
    sensors,
    handleDragEnd,
    handleImageChange: handleHeroImageUpload,
    handleMarkDelete: handleDeleteHeroImage,
    handleRemoveStaged: handleDeleteHeroImage,
    fileInputRef,
    heroError,
    isDeleting,
    isUploading
  };
} 