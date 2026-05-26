'use client';

import React from 'react';
import { EntityFormLayout } from '@/components/admin/layout/EntityFormLayout/EntityFormLayout';
import { HERO_CONTENT_ID } from '@/lib/schemas/heroSchema';
import { useHeroSettings } from './useHeroSettings';
import type { HeroDbRow } from '@/types/hero';

export default function HeroSettingsForm({ initialData }: { initialData: HeroDbRow | null }) {
  const {
    formHookResult,
    currentHeroData,
    register,
    onSubmit,
    isPending,
    displayImages,
    imageIds,
    sensors,
    handleDragEnd,
    handleImageChange,
    handleMarkDelete,
    handleRemoveStaged,
    fileInputRef,
  } = useHeroSettings(initialData);

  return (
    <EntityFormLayout
      formMethods={formHookResult}
      onSubmit={onSubmit}
      isPending={isPending}
      displayImages={displayImages}
      imageIds={imageIds}
      sensors={sensors}
      handleDragEnd={handleDragEnd}
      handleImageChange={handleImageChange}
      handleMarkDelete={handleMarkDelete}
      handleRemoveStaged={handleRemoveStaged}
      fileInputRef={fileInputRef}
      entityName="Hero Content"
      isUpdate={!!initialData} 
      maxImages={1}
      imageAspectRatio="video"
      hideSubmitButton={true}
    >
      <input type="hidden" {...register('id')} value={String(HERO_CONTENT_ID)} />
      {(currentHeroData?.image_url) && (
         <input type="hidden" name="current_image_url" value={currentHeroData.image_url} />
      )}
    </EntityFormLayout>
  );
} 