'use client';

import React from 'react';
import { useAboutForm } from './useAboutForm';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { ActionButton } from '@/components/admin/buttons/ActionButton/ActionButton';
import { AboutSectionText } from '@/components/admin/about/AboutSectionText/AboutSectionText';
import { AboutImageLayoutSelector } from '@/components/admin/about/AboutImageLayoutSelector/AboutImageLayoutSelector';
import { ImageUploadSection } from '@/components/admin/shared/ImageUploadSection';

export default function AboutForm() {
  const {
    entityFormHook,
    selectedAspectRatio,
    imagesChanged,
    hasAtLeastOneImage,
    isSaveDisabled,
    handleImageMarkOrRemove
  } = useAboutForm();

  const {
    handleSubmit,
    formState,
    register,
    onSubmit,
    isPending,
    state,
    setValue,
    displayImages,
    imageIds,
    handleImageChange,
    sensors,
    handleDragEnd,
    fileInputRef,
  } = entityFormHook;

  return (
    <div className="container mx-auto space-y-6">
      
      <Card className="shadow-lg rounded-md border bg-background">
        <Form {...entityFormHook}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="font-bold">About Text</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-6 overflow-y-auto p-6">
              {state?.error && (
                <p className="text-sm font-medium text-destructive">
                  {typeof state.error === 'string' ? state.error : JSON.stringify(state.error)}
                </p>
              )}
              {formState.errors.root?.serverError && (
                <p className="text-sm font-medium text-destructive mt-4">
                  {formState.errors.root.serverError.message}
                </p>
              )}

              <AboutSectionText
                register={register}
                errors={formState.errors}
                isPending={isPending}
              />

              <AboutImageLayoutSelector
                selectedAspectRatio={selectedAspectRatio}
                setValue={setValue}
                errors={formState.errors}
                isPending={isPending}
              />

              <ImageUploadSection
                form={entityFormHook}
                displayImages={displayImages}
                imageIds={imageIds}
                handleImageChange={handleImageChange}
                handleMarkOrRemove={handleImageMarkOrRemove}
                sensors={sensors}
                handleDragEnd={handleDragEnd}
                fileInputRef={fileInputRef}
                isPending={isPending}
                entityName="About"
                aspectRatio={selectedAspectRatio}
              />

            </CardContent>
            <CardFooter className="flex justify-end pt-6 border-t mt-auto">
              <div className="flex justify-end">
                <ActionButton
                  type="submit"
                  isLoading={isPending}
                  disabled={isSaveDisabled}
                  isDirty={formState.isDirty || imagesChanged}
                  isValid={formState.isValid}
                  hasRequiredImages={hasAtLeastOneImage}
                  loadingText="Saving About..."
                >
                  Save Changes
                </ActionButton>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
} 