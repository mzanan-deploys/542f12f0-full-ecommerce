import { useMemo } from 'react';
import { type UseFormReturn } from 'react-hook-form';
import { useEntityForm } from '@/components/admin/layout/EntityFormLayout/useEntityForm'; 
import { createSetFormSchema, updateSetFormSchema, type SetFormData } from '@/lib/schemas/setSchema';
import type { SetRow } from '@/types/db';
import type { SetFormServerAction, AdminCreateUpdateActionResponse } from '@/types/sets';
import type { UseSetFormReturn } from '@/types/ecommerce';

type SetWithImages = SetRow & { set_images: any[] };


export function useSetForm(serverAction: SetFormServerAction, initialData?: SetWithImages | null): UseSetFormReturn {

    const initialImages = useMemo(() => {
        const images = (initialData?.set_images || [])
            .map((img: any) => ({
                id: img.id,
                image_url: img.image_url,
                position: img.position,
            }));

        return images;
    }, [initialData?.set_images]);

    const schema = initialData ? updateSetFormSchema : createSetFormSchema;

    const entityFormResult = useEntityForm<SetFormData, SetRow, SetWithImages>({
        schema: schema as any, 
        serverAction: serverAction as any,
        initialData,
        initialImages: initialImages,
        config: {
            nameFieldName: 'name',
            slugFieldName: 'slug',
            maxImages: 3,
        },
        redirectPathAfterCreate: initialData ? undefined : "/admin/sets/[id]/edit",
    });

    const { 
        state: genericState, 
        onSubmit: entityOnSubmit,   
        maxImages,
        ...restOfForm 
    } = entityFormResult;

    const specificState = genericState as AdminCreateUpdateActionResponse | null;

    return {
        ...(restOfForm as unknown as Omit<UseFormReturn<SetFormData>, 'handleSubmit' | 'reset'>),
        state: specificState,
        isPending: restOfForm.isPending,
        onSubmit: entityOnSubmit as (data: SetFormData) => void, 
        displayImages: restOfForm.displayImages,
        imageIds: restOfForm.imageIds,
        handleImageChange: restOfForm.handleImageChange,
        handleMarkDelete: restOfForm.handleMarkDelete,
        handleRemoveStaged: restOfForm.handleRemoveStaged,
        deleteImageIds: restOfForm.deleteImageIds,
        fileInputRef: restOfForm.fileInputRef,
        handleSlugChange: restOfForm.handleSlugChange,
        sensors: restOfForm.sensors,
        handleDragEnd: restOfForm.handleDragEnd,
        handleSubmit: restOfForm.handleSubmit,
        reset: restOfForm.reset,
        maxImages,
    } as unknown as UseSetFormReturn;
} 