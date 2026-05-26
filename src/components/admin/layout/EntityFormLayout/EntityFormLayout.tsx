'use client';

import React, { useCallback } from 'react';
import { type UseFormReturn, type FieldValues } from 'react-hook-form';
import { Form } from "@/components/ui/form";
import { ActionButton } from '@/components/admin/buttons/ActionButton/ActionButton';
import { ImageUploadSection, type DisplayImageItem as ImageUploadDisplayItem } from '@/components/admin/shared/ImageUploadSection';
import type { DisplayImageItem as EntityFormDisplayImageItem } from '@/components/admin/layout/EntityFormLayout/useEntityForm';

interface EntityFormLayoutProps<TFormData extends FieldValues> {
    formMethods: UseFormReturn<TFormData>;
    isPending: boolean;
    displayImages: EntityFormDisplayImageItem[];
    imageIds: string[];
    sensors: any;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    entityName?: string;
    isUpdate?: boolean;
    children: React.ReactNode; 
    afterImageUploadSection?: React.ReactNode;
    maxImages?: number;
    extraDisableCondition?: boolean;
    imageAspectRatio?: 'square' | 'portrait' | 'video';
    hideSubmitButton?: boolean;
    onSubmit: (data: TFormData) => void;
    handleDragEnd: (event: any) => void;
    handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleMarkDelete: (id: string) => void;
    handleRemoveStaged: (id: string) => void;
}

export function EntityFormLayout<TFormData extends FieldValues & { images?: any }> ({
    formMethods,
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
    entityName = 'Item',
    isUpdate = false,
    children,
    afterImageUploadSection,
    maxImages,
    extraDisableCondition = false,
    imageAspectRatio,
    hideSubmitButton = false
}: EntityFormLayoutProps<TFormData>) {

    const { handleSubmit, formState } = formMethods;

    const hasRequiredImages = displayImages.filter(img => !img.isMarkedForDelete).length > 0;

    const handleImageMarkOrRemove = useCallback((id: string, isExisting: boolean) => {
        if (isExisting) {
            handleMarkDelete(id);
        } else {
            handleRemoveStaged(id);
        }
    }, [handleMarkDelete, handleRemoveStaged]);

    return (
        <Form {...formMethods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {formState.errors.root?.serverError?.message && (
                    <p className="text-sm font-medium text-destructive text-center py-4">
                        {formState.errors.root.serverError.message as string}
                    </p>
                )}
                {children}
                
                <ImageUploadSection
                    form={formMethods}
                    displayImages={displayImages as ImageUploadDisplayItem[]}
                    imageIds={imageIds}
                    handleImageChange={handleImageChange}
                    handleMarkOrRemove={handleImageMarkOrRemove}
                    sensors={sensors}
                    handleDragEnd={handleDragEnd}
                    fileInputRef={fileInputRef}
                    isPending={isPending}
                    entityName={entityName}
                    aspectRatio={imageAspectRatio}
                    maxImages={maxImages}
                />

                {afterImageUploadSection}

                {/* Common Submit Button - Conditionally render */}
                {!hideSubmitButton && (
                    <div className="flex justify-end pt-8">
                        <ActionButton
                            type="submit"
                            isLoading={isPending}
                            disabled={isPending || extraDisableCondition || !formState.isValid}
                            isDirty={formState.isDirty}
                            isValid={formState.isValid}
                            hasRequiredImages={hasRequiredImages}
                            loadingText={isUpdate ? `Updating ${entityName}...` : `Creating ${entityName}...`}
                        >
                            {isUpdate ? 'Save Changes' : `Create ${entityName}`}
                        </ActionButton>
                    </div>
                )}
            </form>
        </Form>
    );
} 