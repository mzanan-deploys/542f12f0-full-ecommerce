'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useProductForm } from './useProductForm';
import type { ProductFormProps } from '@/types/product';
import { MultipleSelector, type Option } from '@/components/ui/multiple-selector';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from 'lucide-react';
import { ImageUploadSection } from '@/components/admin/shared/ImageUploadSection';

export function ProductForm({ initialData, availableSets }: ProductFormProps) {
    const router = useRouter();
    const formHookResult = useProductForm({ initialData });

    const {
        form,
        isPending,
        serverError,
        handleSlugChange,
        onSubmit,
        categories,
        isLoadingCategories,
        availableSizesFromGuide,
        isLoadingSizesFromGuide,
        allImages,
        imageIds,
        handleImageChange,
        handleRemoveStagedFile,
        handleMarkDelete,
        sensors,
        handleDragEnd,
        fileInputRef,
    } = formHookResult;

    const setOptions: Option[] = useMemo(() => {
        return availableSets?.map(set => ({
            label: set.label,
            value: set.value,
            group: set.group
        })) ?? [];
    }, [availableSets]);

    const displayImages = allImages.map(img => ({
        id: img.id,
        url: img.url,
        isExisting: img.isExisting,
        isMarkedForDelete: img.isMarkedForDelete,
        file: img.file,
        position: null,
    }));

    const handleMarkOrRemove = (id: string, isExisting: boolean) => {
        if (isExisting) {
            handleMarkDelete(id);
        } else {
            handleRemoveStagedFile(id);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {serverError && (
                    <p className="text-sm font-medium text-destructive text-center py-4">
                        {serverError}
                    </p>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product Name</FormLabel>
                                    <FormControl><Input placeholder="Cool T-Shirt" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Slug</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="cool-t-shirt"
                                            {...field}
                                            onChange={handleSlugChange}
                                        />
                                    </FormControl>
                                    <FormDescription>Unique identifier for the URL.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl><Textarea placeholder="Describe the product..." {...field} value={field.value ?? ''} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="text" 
                                            inputMode="decimal"
                                            placeholder="99.99" 
                                            {...field}
                                            value={field.value ?? ''} 
                                            onChange={(e) => {
                                                let val = e.target.value;
                                                val = val.replace(/[^0-9.]/g, ''); 
                                                const parts = val.split('.');
                                                if (parts.length > 2) {
                                                    val = parts[0] + '.' + parts.slice(1).join('');
                                                }
                                                field.onChange(val);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <ImageUploadSection
                    form={form}
                    displayImages={displayImages}
                    imageIds={imageIds}
                    handleImageChange={handleImageChange}
                    handleMarkOrRemove={handleMarkOrRemove}
                    sensors={sensors}
                    handleDragEnd={handleDragEnd}
                    fileInputRef={fileInputRef}
                    isPending={isPending}
                    entityName="Product"
                    aspectRatio="square"
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Category, Stock & Sizes</CardTitle>
                        {form.formState.errors.selected_size_names?.message && (
                             <p className="text-sm font-medium text-destructive">{form.formState.errors.selected_size_names.message}</p>
                        )}
                         {form.formState.errors.category_id?.message && (
                             <p className="text-sm font-medium text-destructive">{form.formState.errors.category_id.message}</p>
                        )}
                         {form.formState.errors.stock_quantity?.message && (
                             <p className="text-sm font-medium text-destructive">{form.formState.errors.stock_quantity.message}</p>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="category_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product Category <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCategories || isPending}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {isLoadingCategories && <div className="flex items-center justify-center p-2"><Loader2 className="h-4 w-4 animate-spin" /></div>}
                                            {!isLoadingCategories && categories.length === 0 && (
                                                <div className="p-2 text-sm text-muted-foreground text-center">No categories found. Please create one first.</div>
                                            )}
                                            {categories.map(category => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="stock_quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Shared Stock Quantity <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="number" 
                                            inputMode="numeric" 
                                            placeholder="0" 
                                            {...field} 
                                            value={field.value ?? ''} 
                                            onChange={e => field.onChange(e.target.value === '' ? 0 : parseInt(e.target.value, 10))}
                                            min="0"
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormDescription>Total stock available for all selected sizes of this product.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {form.watch('category_id') && (
                            <div className="space-y-2 pt-4 border-t">
                                <FormLabel>Available Sizes for Selected Category</FormLabel>
                                {isLoadingSizesFromGuide && <div className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading sizes...</div>}
                                {!isLoadingSizesFromGuide && availableSizesFromGuide.length === 0 && <FormDescription>No sizes defined for the selected category's size guide. You can set a size guide for the category in the <strong>Product Categories</strong> section.</FormDescription>}
                                {!isLoadingSizesFromGuide && availableSizesFromGuide.length > 0 && <FormDescription>Select which sizes to offer for this product. The size guide will be automatically inherited from the category.</FormDescription>}
                                
                                <FormField
                                    control={form.control}
                                    name="selected_size_names"
                                    render={() => (
                                        <FormItem className="space-y-3">
                                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                                {availableSizesFromGuide.map((sizeName) => (
                                                    <FormField
                                                        key={sizeName}
                                                        control={form.control}
                                                        name="selected_size_names"
                                                        render={({ field }) => {
                                                            return (
                                                                <FormItem
                                                                    key={sizeName}
                                                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                                                                >
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.includes(sizeName)}
                                                                            onCheckedChange={(checked) => {
                                                                                return checked
                                                                                    ? field.onChange([...(field.value || []), sizeName])
                                                                                    : field.onChange(
                                                                                        (field.value || []).filter(
                                                                                            (value) => value !== sizeName
                                                                                        )
                                                                                    );
                                                                            }}
                                                                            disabled={isPending}
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal">
                                                                        {sizeName}
                                                                    </FormLabel>
                                                                </FormItem>
                                                            );
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Settings & Associations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        <FormField
                            control={form.control}
                            name="setIds"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Associated Sets</FormLabel>
                                    <FormControl>
                                        <MultipleSelector
                                            value={setOptions.filter(option => field.value?.includes(option.value))}
                                            onChange={options => field.onChange(options.map(option => option.value))}
                                            defaultOptions={setOptions}
                                            options={setOptions}
                                            placeholder="Select sets this product belongs to..."
                                            emptyIndicator={<p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">No sets found.</p>}
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormDescription>Associate this product with one or more sets (e.g., Collections, Campaigns).</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="is_active"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Active</FormLabel>
                                        <FormDescription>Is this product available for customers?</FormDescription>
                                    </div>
                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={isPending} /></FormControl>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>Cancel</Button>
                    <Button type="submit" disabled={isPending} className="min-w-[120px]">
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (initialData?.id ? 'Save Changes' : 'Create Product')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}