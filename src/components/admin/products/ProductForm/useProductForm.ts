import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProductFormData, productFormSchema } from '@/lib/schemas/productSchema';
import { fetchSizesFromSizeGuideAction } from '@/lib/actions/sizeGuideActions';
import { useProductImageManagement } from './useProductImageManagement';

import type { ProductImageRow } from '@/types/db';
import { useAutoSlug } from '@/hooks/useAutoSlug/useAutoSlug';
import { useCreateProduct, useUpdateProduct } from '@/lib/queries/productQueries.client';
import { fetchCategoriesAction } from '@/lib/actions/categoryActions';
import type { ProductCategoryRow } from '@/types/category';
import type { UseProductFormProps } from '@/types/admin';

export function useProductForm({ initialData }: UseProductFormProps) {
    const router = useRouter();
    
    const createProductMutation = useCreateProduct();
    const updateProductMutation = useUpdateProduct(initialData?.id || '');

    const [serverError, setServerError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null); 

    const [categories, setCategories] = useState<ProductCategoryRow[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);
    
    const [availableSizesFromGuide, setAvailableSizesFromGuide] = useState<string[]>([]);
    const [isLoadingSizesFromGuide, setIsLoadingSizesFromGuide] = useState<boolean>(false);

    const form = useForm<ProductFormData>({
        resolver: zodResolver(productFormSchema) as Resolver<ProductFormData>,
        defaultValues: {
            name: initialData?.name || "",
            slug: initialData?.slug || "",
            description: initialData?.description || "",
            price: initialData?.price != null ? initialData.price : 0,
            is_active: initialData?.is_active ?? true,
            images: [],
            setIds: initialData?.currentSetIds || [],
            category_id: initialData?.category_id || undefined,

            stock_quantity: (initialData?.stock_quantity != null && !isNaN(Number(initialData.stock_quantity))) ? Number(initialData.stock_quantity) : 0,
            selected_size_names: initialData?.selected_size_names || [],
        },
    });

    useEffect(() => {
        const loadCategories = async () => {
            setIsLoadingCategories(true);
            const result = await fetchCategoriesAction();
            if (result.data) {
                setCategories(result.data);
                if (initialData?.category_id) {
                    const selectedCategory = result.data.find(cat => cat.id === initialData.category_id);
                    if (selectedCategory?.size_guide_id) {
                        loadSizesForGuide(selectedCategory.size_guide_id, false);
                    }
                }
            } else {
                console.error("Failed to fetch product categories:", result.error);
            }
            setIsLoadingCategories(false);
        };
        loadCategories();
    }, [initialData?.category_id]);

    const loadSizesForGuide = useCallback(async (sizeGuideId: string | null | undefined, forceSelectAll: boolean = false) => {
        if (!sizeGuideId) {
            setAvailableSizesFromGuide([]);
            if (!initialData?.id) {
                form.setValue('selected_size_names', []);
            }
            return;
        }
        
        setIsLoadingSizesFromGuide(true);
        setAvailableSizesFromGuide([]);
        
        const result = await fetchSizesFromSizeGuideAction(sizeGuideId);
        if (result.data) {
            setAvailableSizesFromGuide(result.data);

            if (!initialData?.id || forceSelectAll) {
                form.setValue('selected_size_names', result.data);
            } else {
                const currentSelected = form.getValues('selected_size_names') || [];
                const reconciled = currentSelected.filter((s) => result.data!.includes(s));
                if (reconciled.length !== currentSelected.length || reconciled.length === 0) {
                    form.setValue('selected_size_names', reconciled.length > 0 ? reconciled : result.data);
                }
            }

        } else {
            console.error(`Failed to fetch sizes for size guide ${sizeGuideId}:`, result.error);
        }
        setIsLoadingSizesFromGuide(false);
    }, [form, initialData?.id]);

    const [previousCategoryId, setPreviousCategoryId] = useState<string | null>(initialData?.category_id || null);

    const watchedCategoryId = form.watch('category_id');
    useEffect(() => {
        
        if (watchedCategoryId) {
            const selectedCategory = categories.find(cat => cat.id === watchedCategoryId);
            
            const categoryChanged = initialData?.id && previousCategoryId && watchedCategoryId !== previousCategoryId;
            
            loadSizesForGuide(selectedCategory?.size_guide_id, categoryChanged || false);
            setPreviousCategoryId(watchedCategoryId);
        } else {
            loadSizesForGuide(null, false);
            setPreviousCategoryId(null);
        }
    }, [watchedCategoryId, categories, loadSizesForGuide, initialData?.id, previousCategoryId]);

    const { handleSlugChange } = useAutoSlug({
        watch: form.watch,
        setValue: form.setValue,
        nameFieldName: 'name',
        slugFieldName: 'slug',
        initialSlug: initialData?.slug
    });

    const memoizedInitialImages = useMemo(() => {
        return initialData?.images?.map((img: ProductImageRow) => ({
            id: img.id,
            image_url: img.image_url,
        })) || [];
    }, [initialData?.images]);

    const imageManagement = useProductImageManagement({
        setValue: form.setValue,
        initialImages: memoizedInitialImages as { id: string; image_url: string }[],
    });

    const { allImages } = imageManagement;

    const onSubmit = useCallback(async (data: ProductFormData) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                if (key === 'images' && Array.isArray(value)) {
                    value.forEach(file => formData.append('images', file as File));
                } else if (key === 'setIds' && Array.isArray(value)) {
                    formData.append(key, JSON.stringify(value));
                } else if (key === 'selected_size_names' && Array.isArray(value)) {
                    formData.append(key, JSON.stringify(value));
                } else if (Array.isArray(value)) {
                    value.forEach(item => formData.append(key, String(item)));
                 } else {
                     formData.append(key, String(value));
                 }
            }
        });
        
        if (initialData?.id) {
            const imagesToDelete = allImages.filter(img => img.isExisting && img.isMarkedForDelete);
            imagesToDelete.forEach(img => formData.append('deleteImageIds', img.id));

            const finalImageOrder = allImages
                .filter(img => !img.isMarkedForDelete)
                .map(img => img.id);
            formData.append('imageOrder', JSON.stringify(finalImageOrder));
        } else {
            const finalImageOrder = allImages
                .filter(img => img.file)
                .map(img => img.id);
            formData.append('imageOrder', JSON.stringify(finalImageOrder));
        }

        if (initialData?.id) {
            formData.append('id', initialData.id);
        }
        
        if (!formData.has('is_active') && form.getValues('is_active') !== undefined) {
             formData.append('is_active', String(form.getValues('is_active')));
        } else if (!formData.has('is_active')) {
            formData.append('is_active', 'true');
        }

        if (initialData?.id) {
            updateProductMutation.mutate(formData);
        } else {
            createProductMutation.mutate(formData);
        }
    }, [initialData?.id, createProductMutation, updateProductMutation, allImages, form]);

    useEffect(() => {
        const mutationState = initialData?.id ? updateProductMutation : createProductMutation;
        if (mutationState.data?.success) {
            router.push('/admin/products');
            setServerError(null); 
        }
        if (mutationState.data?.error) {
            setServerError(mutationState.data.error as string);
        }
        if (mutationState.error) { 
            setServerError(mutationState.error.message || 'Failed to save product due to validation or database error.');
        }
    }, [createProductMutation.data, updateProductMutation.data, createProductMutation.error, updateProductMutation.error, router, initialData?.id]);

    const isPending = createProductMutation.isPending || updateProductMutation.isPending;

    return {
        form,
        onSubmit,
        isPending,
        serverError,
        fileInputRef,
        ...imageManagement,

        handleSlugChange,
        categories,
        isLoadingCategories,
        availableSizesFromGuide,
        isLoadingSizesFromGuide,
    };
} 