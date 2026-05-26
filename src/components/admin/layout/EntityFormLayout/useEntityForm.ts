'use client';

import React, { useState, useEffect, useCallback, useRef, startTransition } from 'react';
import { useForm, type UseFormReturn, type FieldValues, type Path, type PathValue, type DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useActionState } from 'react';
import { useAutoSlug } from '@/hooks/useAutoSlug/useAutoSlug';
import { 
    useSensors, 
    useSensor, 
    PointerSensor, 
    KeyboardSensor 
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import { v4 as uuidv4 } from 'uuid';
import type { ActionResponse } from '@/types/actions';
import * as z from 'zod';

interface BaseInitialEntityData {
    id?: string;
    name?: string | null;
    slug?: string | null;
    [key: string]: any; 
}

export type DisplayImageItem = {
    id: string;         
    url: string;        
    isExisting: boolean;
    isMarkedForDelete?: boolean;
    file?: File;         
    position?: number | null; 
};

type EntityFormData = FieldValues; 

type EntityServerAction<TResponseData = any> = 
    (prevState: ActionResponse<TResponseData> | null, formData: FormData) => 
    Promise<ActionResponse<TResponseData>>;

export type InitialImage = {
    id: string;
    image_url: string;
    position?: number | null;
    [key: string]: any; 
};

interface UseEntityFormProps<
    TFormData extends EntityFormData, 
    TResponseData = any,
    TInitialData extends BaseInitialEntityData = BaseInitialEntityData
> {
    schema: z.ZodType<TFormData, any, any>;
    serverAction: EntityServerAction<TResponseData>;
    initialData?: TInitialData | null;
    initialImages?: InitialImage[] | null;
    redirectPathAfterCreate?: string;
    config?: {
        nameFieldName?: keyof TFormData;
        slugFieldName?: keyof TFormData;
        maxImages?: number;
        onSuccess?: () => void;
    };
}

export interface UseEntityFormReturn<TFormData extends FieldValues, TResponseData = any> extends Omit<UseFormReturn<TFormData>, 'handleSubmit'> {
    state: ActionResponse<TResponseData> | null;
    isPending: boolean;
    onSubmit: (data: TFormData) => void;
    displayImages: DisplayImageItem[];
    imageIds: string[];
    handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleMarkDelete: (id: string) => void;
    handleRemoveStaged: (id: string) => void;
    deleteImageIds: string[];
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    handleSlugChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    sensors: ReturnType<typeof useSensors>;
    handleDragEnd: (event: DragEndEvent) => void;
    handleSubmit: UseFormReturn<TFormData>['handleSubmit'];
    baseFormAction: (formData: FormData) => void;
    setInitialImages: (images: InitialImage[]) => void;
    maxImages: number;
}

export function useEntityForm<
    TFormData extends EntityFormData, 
    TResponseData = any,
    TInitialData extends BaseInitialEntityData = BaseInitialEntityData
>({
    schema,
    serverAction,
    initialData,
    initialImages,
    redirectPathAfterCreate,
    config = {},
}: UseEntityFormProps<TFormData, TResponseData, TInitialData>) {

    const { 
        nameFieldName = 'name', 
        slugFieldName = 'slug',
        maxImages = 3,
    } = config;

    const router = useRouter();
    const isUpdate = !!initialData?.id;

    let formDefaultValues: DefaultValues<TFormData>;

    if (isUpdate && initialData) {
        const typeDefaultFromSchema = schema instanceof z.ZodObject && (schema.shape as any).type?._def?.defaultValue !== undefined ? (schema.shape as any).type._def.defaultValue : undefined;
        const layoutTypeDefaultFromSchema = schema instanceof z.ZodObject && (schema.shape as any).layout_type?._def?.defaultValue !== undefined ? (schema.shape as any).layout_type._def.defaultValue : undefined;
        const isActiveDefaultFromSchema = schema instanceof z.ZodObject && (schema.shape as any).is_active?._def?.defaultValue !== undefined ? (schema.shape as any).is_active._def.defaultValue : true;

        formDefaultValues = {
            ...(initialData as any),
            type: initialData.type ?? typeDefaultFromSchema,
            layout_type: initialData.layout_type ?? layoutTypeDefaultFromSchema,
            is_active: initialData.is_active ?? isActiveDefaultFromSchema,
            images: initialData.images ?? [],
        } as unknown as DefaultValues<TFormData>;
    } else {
        const typeDefaultFromSchema = schema instanceof z.ZodObject && (schema.shape as any).type?._def?.defaultValue !== undefined ? (schema.shape as any).type._def.defaultValue : undefined;
        const layoutTypeDefaultFromSchema = schema instanceof z.ZodObject && (schema.shape as any).layout_type?._def?.defaultValue !== undefined ? (schema.shape as any).layout_type._def.defaultValue : undefined;
        const isActiveDefaultFromSchema = schema instanceof z.ZodObject && (schema.shape as any).is_active?._def?.defaultValue !== undefined ? (schema.shape as any).is_active._def.defaultValue : true;

        const defaultName = schema instanceof z.ZodObject && (schema.shape as any).name?._def?.defaultValue !== undefined ? (schema.shape as any).name._def.defaultValue : '';
        const defaultImages = schema instanceof z.ZodObject && (schema.shape as any).images?._def?.defaultValue !== undefined ? (schema.shape as any).images._def.defaultValue : [];
        const defaultDescription = schema instanceof z.ZodObject && (schema.shape as any).description?._def?.defaultValue !== undefined ? (schema.shape as any).description._def.defaultValue : '';

        formDefaultValues = {
            name: defaultName,
            slug: undefined,
            images: defaultImages,
            type: typeDefaultFromSchema,
            layout_type: layoutTypeDefaultFromSchema,
            is_active: isActiveDefaultFromSchema,
            description: defaultDescription,
        } as unknown as DefaultValues<TFormData>;
    }

    const formMethods = useForm<TFormData>({
        resolver: zodResolver(schema),
        defaultValues: formDefaultValues,
        mode: 'onChange',
    });

    const [state, baseFormAction, isPending] = useActionState<ActionResponse<TResponseData> | null, FormData>(
        serverAction,
        null
    );

    const [displayImages, setDisplayImages] = useState<DisplayImageItem[]>(() => {
        const images = initialImages || [];
        const initialDisplay = images
            .sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity))
            .map(img => ({
                id: img.id,
                url: img.image_url,
                isExisting: true,
                isMarkedForDelete: false,
                position: img.position,
            }));

        return initialDisplay;
    });
    const imageIds = React.useMemo(() => displayImages.map((img) => img.id), [displayImages]);

    const [deleteImageIds, setDeleteImageIds] = useState<string[]>([]); 
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const isInitializedRef = useRef(false);

    const displayImagesRef = useRef<DisplayImageItem[]>([]);

    useEffect(() => {
        displayImagesRef.current = displayImages;
    }, [displayImages]);

    useEffect(() => {
        if (!isInitializedRef.current && initialImages) {
            const images = initialImages || [];
            const initialDisplay = images
                .sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity))
                .map(img => ({
                    id: img.id,
                    url: img.image_url,
                    isExisting: true,
                    isMarkedForDelete: false,
                    position: img.position,
                }));
            setDisplayImages(initialDisplay);
            setDeleteImageIds([]);
            isInitializedRef.current = true;
        }
    }, []);

    const setInitialImagesCallback = useCallback((images: InitialImage[]) => {
        const initialDisplay = images
            .sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity))
            .map(img => ({
                id: img.id,
                url: img.image_url,
                isExisting: true,
                isMarkedForDelete: false,
                position: img.position,
            }));
        setDisplayImages(initialDisplay);
        setDeleteImageIds([]);
    }, []);

    const { handleSlugChange } = useAutoSlug<TFormData>({
        watch: formMethods.watch,
        setValue: formMethods.setValue,
        nameFieldName: nameFieldName as Path<TFormData>,
        slugFieldName: slugFieldName as Path<TFormData>,
        initialSlug: initialData?.slug
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = useCallback((event: DragEndEvent) => {
       const { active, over } = event;
       if (over && active.id !== over.id) {
           startTransition(() => {
               let newOrderForRHF: File[] | null = null;

               setDisplayImages((currentDisplayImages) => {
                   const oldIndex = currentDisplayImages.findIndex(item => item.id === active.id);
                   const newIndex = currentDisplayImages.findIndex(item => item.id === over.id);
                   if (oldIndex === -1 || newIndex === -1) return currentDisplayImages;
                   
                   const reorderedDisplayImages = arrayMove(currentDisplayImages, oldIndex, newIndex);

                   const currentFormFiles = formMethods.getValues('images' as Path<TFormData>) as File[] || [];
                   const fileMap = new Map<string, File>();
                   currentFormFiles.forEach(file => {
                       const fileKey = file.name.startsWith('temp-') ? file.name.split('___')[0] : file.name;
                       fileMap.set(fileKey, file);
                   });

                   newOrderForRHF = reorderedDisplayImages
                       .filter(item => !item.isExisting && item.file)
                       .map(item => item.file!)
                       .filter((file): file is File => !!file);

                   return reorderedDisplayImages;
               });
               
               if (newOrderForRHF !== null) {
                   formMethods.setValue('images' as Path<TFormData>, newOrderForRHF as PathValue<TFormData, Path<TFormData>>, { shouldValidate: true, shouldDirty: true });
               }
               formMethods.setValue('imageOrderChanged' as Path<TFormData>, true as PathValue<TFormData, Path<TFormData>>, { shouldDirty: true });
           });
       }
   }, [formMethods]);

    const handleImageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        
        if (!files || files.length === 0) {
            console.log('[ENTITY FORM] No files selected, returning');
            return;
        }

        setDisplayImages(currentImages => {
            const currentVisibleImagesCount = currentImages.filter(img => !img.isMarkedForDelete).length;
            let slotsAvailable = maxImages - currentVisibleImagesCount;

            if (slotsAvailable <= 0) {
                toast.info(`Maximum ${maxImages} images already uploaded.`);
                if (event.target) event.target.value = '';
                return currentImages;
            }

            const newDisplayItems: DisplayImageItem[] = [];
            const newFormFiles: File[] = [];

            for (let i = 0; i < files.length; i++) {
                if (slotsAvailable <= 0) {
                    toast.warning(`Maximum ${maxImages} images allowed. Some files were not added.`);
                    break;
                }
                const file = files[i];
                const tempId = `temp-${uuidv4()}`;
                const renamedFile = new File([file], `${tempId}___${file.name}`, { type: file.type });
                
                newDisplayItems.push({
                    id: tempId,
                    url: URL.createObjectURL(renamedFile),
                    isExisting: false,
                    isMarkedForDelete: false,
                    file: renamedFile
                });
                newFormFiles.push(renamedFile);
                slotsAvailable--;
            }

            if (newFormFiles.length > 0) {
                const currentFormFiles = formMethods.getValues('images' as Path<TFormData>) as File[] || [];

                formMethods.setValue(
                    'images' as Path<TFormData>, 
                    [...currentFormFiles, ...newFormFiles] as PathValue<TFormData, Path<TFormData>>, 
                    { shouldValidate: true, shouldDirty: true } 
                );
            }

            if (event.target) event.target.value = '';
            
            const newImages = [...currentImages, ...newDisplayItems];
            return newImages;
        });
    }, [maxImages, formMethods]);

    const handleRemoveStaged = useCallback((idToRemove: string) => {
        
        let removedFile: File | undefined;
        setDisplayImages(prev => {
            const filtered = prev.filter(item => {
                if (item.id === idToRemove && !item.isExisting) { 
                    if (item.url.startsWith('blob:')) URL.revokeObjectURL(item.url);
                    removedFile = item.file;
                    return false; 
                }
                return true;
            });
            return filtered;
        });

        if (removedFile) {
            const currentFormFiles = (formMethods.getValues('images' as Path<TFormData>) as File[]) || [];
            const updatedFormFiles = currentFormFiles.filter(file => file !== removedFile);
            formMethods.setValue('images' as Path<TFormData>, updatedFormFiles as PathValue<TFormData, Path<TFormData>>, { shouldValidate: true, shouldDirty: true });
        }
    }, [formMethods]);

        const handleMarkDelete = useCallback((idToMark: string) => {
        setDisplayImages(prev => {
            const updated = prev.map(item => 
                item.id === idToMark 
                    ? { ...item, isMarkedForDelete: true }
                    : item
            );
            return updated;
        });

        setDeleteImageIds(prev => {
            if (!prev.includes(idToMark)) {
                return [...prev, idToMark];
            }
            return prev;
        });
        
        formMethods.setValue("imageOrderChanged" as Path<TFormData>, true as PathValue<TFormData, Path<TFormData>>, { shouldDirty: true });

    }, [formMethods]);


    const onSubmit = useCallback((data: TFormData) => {
        const formData = new FormData();
        const clientOnlyFields = ['imageOrderChanged'];

        Object.entries(data).forEach(([key, value]) => {
            if (key === 'images' || clientOnlyFields.includes(key)) return;
            
            if (value instanceof File) {
                 console.warn(`[useEntityForm - onSubmit] Unexpected File object in form data key: ${key}`);
            } else if (Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
            } else if (typeof value === 'boolean') {
                formData.append(key, value ? 'on' : '');
            } else if (value !== null && value !== undefined) {
                formData.append(key, String(value));
            }
        });

        const newImageFiles = (data.images as File[]) || [];
        newImageFiles.forEach((file) => {
            if (file instanceof File) {
                formData.append('images', file, file.name); 
            }
        });
        
        const currentDeleteImageIds = deleteImageIds;
        currentDeleteImageIds.forEach(id => formData.append('deleteImageIds', id));

        const currentDisplayImages = displayImagesRef.current;
        if (currentDisplayImages) {
            const finalImageOrder = currentDisplayImages
                .filter(img => !img.isMarkedForDelete)
                .map(img => img.id);
            formData.append('imageOrder', JSON.stringify(finalImageOrder));
        }

        startTransition(() => {
            baseFormAction(formData);
        });

    }, [baseFormAction, deleteImageIds]);


    useEffect(() => {
       if (state) {
           if (state.success) {
               if (state.message) toast.success(state.message);
               
               if (!isUpdate && state.data) {
                   formMethods.reset(); 
                   setDisplayImages([]);
                   setDeleteImageIds([]);
                   if (fileInputRef.current) fileInputRef.current.value = '';
                   
                   const newEntityId = (state.data as { id?: string })?.id;

                   if (newEntityId && redirectPathAfterCreate && redirectPathAfterCreate.includes('[id]')) {
                       const pathWithId = redirectPathAfterCreate.replace('[id]', newEntityId);
                       router.push(`${pathWithId}#manage-products`);
                       setTimeout(() => router.refresh(), 100);
                   } else if (redirectPathAfterCreate) {
                       router.push(redirectPathAfterCreate);
                       setTimeout(() => router.refresh(), 100);
                   } else {
                        console.warn('Redirect path not specified or new entity ID missing after creation.');
                   }
               } else if (isUpdate && state.data) {
                   const currentValues = formMethods.getValues();
                   const responseData = state.data as any; 
                   const newValues = { ...currentValues, ...responseData } as DefaultValues<TFormData>;                       
                   formMethods.reset(newValues);

                   if (Array.isArray((responseData as any).image_urls)) {
                       const updatedImagesForDisplay: InitialImage[] = (responseData as any).image_urls.map((url: string, index: number) => ({
                           id: url, 
                           image_url: url,
                           position: index 
                       }));
                       setInitialImagesCallback(updatedImagesForDisplay);
                       setDeleteImageIds([]); 
                   }
                   if (fileInputRef.current) fileInputRef.current.value = '';
               } else if (isUpdate && !state.data) {
                   formMethods.reset(formMethods.getValues());
                   if (fileInputRef.current) fileInputRef.current.value = '';
               }
           } else if (state.success === false) { 
               console.error('[BROWSER DEBUG] Form submission failed:', state.error || state.message);
               const generalErrorMessage = state.error || state.message || 'An unknown error occurred.';
               toast.error(generalErrorMessage);

               if (state.error && state.error.trim().startsWith('{')) {
                   try {
                       const fieldErrors = JSON.parse(state.error);
                       Object.entries(fieldErrors).forEach(([fieldName, errors]) => {
                           if (Array.isArray(errors) && errors.length > 0) {
                               formMethods.setError(fieldName as Path<TFormData>, { type: 'server', message: errors[0] as string });
                           }
                       });
                   } catch (e) {
                       console.warn('[Debug] useEntityForm: Attempted to parse state.error as JSON but failed. Displaying general error only.', e, "Raw error string:", state.error);
                   }
               } 
           }
       }
    }, [state, isUpdate, formMethods, router, redirectPathAfterCreate, setDisplayImages, setDeleteImageIds, fileInputRef]);

    useEffect(() => {
        
        return () => {
            displayImages.forEach(item => {
                if (item.url && item.url.startsWith('blob:') && !item.isMarkedForDelete) {
                    URL.revokeObjectURL(item.url);
                }
            });
        };
    }, [displayImages]);


    return {
        ...formMethods, 
        state,          
        isPending,      
        displayImages,      
        imageIds,           
        deleteImageIds,     
        fileInputRef,      
        sensors,
        onSubmit,
        handleImageChange,
        handleMarkDelete,
        handleRemoveStaged,
        handleSlugChange,
        handleDragEnd,
        baseFormAction,
        setInitialImages: setInitialImagesCallback,
        maxImages,
    } as UseEntityFormReturn<TFormData, TResponseData>;
}