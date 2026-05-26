'use client';

import React, { useCallback, useEffect, useActionState, startTransition } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { sizeGuideTemplateFormSchema, SizeGuideTemplateFormData, SizeGuideTemplate } from '@/lib/schemas/sizeGuideTemplateSchema';
import { createSizeGuideTemplate, updateSizeGuideTemplate } from '@/lib/actions/sizeGuideActions';
import { useCacheStore } from '@/store/cacheStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Trash2, Plus } from 'lucide-react';
import type { ActionResponse } from '@/types/actions';

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

interface SizeGuideTemplateFormProps {
    initialData?: SizeGuideTemplate | null;
}

type FormState = ActionResponse | null;

const generateDefaultRows = (sizes: string[], numHeaders: number): string[][] => {
    if (sizes.length === 0) {
        return [Array(numHeaders).fill('')];
    }
    return sizes.map(size => [
        size, 
        ...Array(numHeaders - 1).fill('')
    ]);
};

const defaultHeaders = ['Size', 'Chest', 'Waist', 'Low Hip', 'Waist circumference', 'Inseam'];
const defaultRows = generateDefaultRows(STANDARD_SIZES, defaultHeaders.length);

const extractGuideData = (initialData: SizeGuideTemplate | null | undefined): { headers: { value: string }[], rows: string[][] } => {
    const defaultData = {
        headers: defaultHeaders.map(h => ({ value: h + ' (cm)' })),
        rows: defaultRows,
    };

    if (!initialData?.guide_data) {
        return defaultData;
    }
    
    const guideData = typeof initialData.guide_data === 'string'
        ? JSON.parse(initialData.guide_data)
        : initialData.guide_data;

    if (Array.isArray(guideData.headers) && Array.isArray(guideData.rows)) {
         return {
            headers: guideData.headers.map((h: string) => ({ value: h })),
            rows: guideData.rows,
        };
    }
    
    if (Array.isArray(guideData.measurements) && guideData.measurements.length > 0) {
        const firstMeasurement = guideData.measurements[0];
        const headers = Object.keys(firstMeasurement);
        const rows = guideData.measurements.map((measurement: Record<string, string>) => 
            headers.map(header => measurement[header])
        );

        return {
            headers: headers.map(h => ({ value: h })),
            rows,
        };
    }

    return defaultData;
};

export default function SizeGuideTemplateForm({ initialData }: SizeGuideTemplateFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const cache = useCacheStore();
    const isUpdate = !!initialData?.id;

    const formAction = isUpdate 
        ? updateSizeGuideTemplate.bind(null, initialData!.id)
        : createSizeGuideTemplate;

    const [state, submitAction, isPending] = useActionState<FormState, FormData>(formAction, null);

    const form = useForm<SizeGuideTemplateFormData>({
        resolver: zodResolver(sizeGuideTemplateFormSchema),
        defaultValues: {
            name: initialData?.name ?? '',
            guide_data: extractGuideData(initialData),
        },
         mode: "onChange",
    });

    const { fields: headerFields, append: appendHeader, remove: removeHeader } = useFieldArray({ 
        control: form.control,
        name: "guide_data.headers"
    });

    const { fields: rowFields, append: appendRow, remove: removeRow } = useFieldArray({ 
        control: form.control,
        name: "guide_data.rows"
    });
    
    const handleAddHeader = useCallback(() => {
        const currentHeaders = form.getValues('guide_data.headers') || [];
        const newHeaderName = `New Header ${currentHeaders.length + 1}`;
        appendHeader({ value: newHeaderName });
        const currentRows = form.getValues('guide_data.rows') || [];
        const updatedRows = currentRows.map(row => [...row, '']);
        form.setValue('guide_data.rows', updatedRows, { shouldValidate: true, shouldDirty: true });
    }, [appendHeader, form]);

    const handleRemoveHeader = useCallback((indexToRemove: number) => {
        removeHeader(indexToRemove);
        const currentRows = form.getValues('guide_data.rows') || [];
        const updatedRows = currentRows.map(row => row.filter((_, cellIndex) => cellIndex !== indexToRemove));
        form.setValue('guide_data.rows', updatedRows, { shouldValidate: true, shouldDirty: true });
    }, [removeHeader, form]);

    const handleAddRow = useCallback(() => {
        const currentHeaders = form.getValues('guide_data.headers') || [];
        const newRow = Array(currentHeaders.length).fill('');
        appendRow(newRow);
    }, [appendRow, form]);

    const handleRemoveRow = useCallback((index: number) => {
        removeRow(index);
    }, [removeRow]);

    useEffect(() => {
        if (!state) return;
        if (state.success) {
            toast.success(state.message || (isUpdate ? 'Template updated!' : 'Template created!'));
            const cacheKeyPattern = 'admin-size-guides-';
            const cacheEntries = cache.cache;
            Object.keys(cacheEntries).forEach(key => {
                if (key.startsWith(cacheKeyPattern)) {
                    cache.remove(key);
                }
            });
            queryClient.invalidateQueries({ queryKey: ['adminSizeGuides'] });
            router.push('/admin/size-guides'); 
        } else {
             const errorMessage = state.error 
                ? parseServerError(state.error)
                : state.message || 'An error occurred.';
             toast.error(errorMessage);
        }
    }, [state, isUpdate, router, queryClient, cache]);

    const parseServerError = (error: string | Record<string, any>): string => {
         if (typeof error === 'string') {
            try {
                const parsed = JSON.parse(error);
                return Object.entries(parsed).map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`).join('; ')
            } catch {
                 return error; 
            }
         } else if (error && typeof error === 'object') {
             return JSON.stringify(error);
         }
         return 'An unknown error occurred.';
    };

    const onSubmit = (data: SizeGuideTemplateFormData) => {
        const formData = new FormData();
        formData.append('name', data.name);
        
        const transformedData = {
            headers: data.guide_data.headers.map(h => h.value),
            rows: data.guide_data.rows,
        };

        formData.append('guide_data', JSON.stringify(transformedData)); 
        startTransition(() => {
            submitAction(formData);
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Template Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Template Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Unisex T-Shirt Guide" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Variants & Sizes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {headerFields.map((field, index) => (
                                            <TableHead key={field.id}>
                                                <div className="flex items-center gap-1">
                                                     <FormField
                                                        control={form.control}
                                                        name={`guide_data.headers.${index}.value`}
                                                        render={({ field: headerField }) => (
                                                             <FormItem className="flex-grow">
                                                                <FormControl>
                                                                    <Input {...headerField} className="h-8 text-sm"/>
                                                                </FormControl>
                                                                <FormMessage className="text-xs mt-1" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <Button 
                                                        type="button" 
                                                        variant="ghost" 
                                                        size="icon"
                                                        onClick={() => handleRemoveHeader(index)}
                                                        disabled={headerFields.length <= 1} 
                                                        aria-label="Remove Header"
                                                        className="h-8 w-8"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </TableHead>
                                        ))}
                                        <TableHead className="w-[50px] p-1">
                                             <Button type="button" variant="outline" size="icon" onClick={handleAddHeader} aria-label="Add Header" className="h-8 w-8">
                                                 <Plus className="h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rowFields.map((rowField, rowIndex) => (
                                        <TableRow key={rowField.id}>
                                            {(form.getValues(`guide_data.rows.${rowIndex}`) || []).map((_, cellIndex) => (
                                                <TableCell key={`${rowField.id}-${cellIndex}`}>
                                                     <FormField
                                                        control={form.control}
                                                        name={`guide_data.rows.${rowIndex}.${cellIndex}`}
                                                        render={({ field: cellField }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input {...cellField} className="h-8 text-sm"/>
                                                                </FormControl>
                                                                 <FormMessage className="text-xs mt-1" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                            ))}
                                            <TableCell className="w-[50px] p-1 align-middle">
                                                 <Button 
                                                     type="button" 
                                                     variant="ghost" 
                                                     size="icon"
                                                     onClick={() => handleRemoveRow(rowIndex)}
                                                     disabled={rowFields.length <= 1}
                                                     aria-label="Remove Row"
                                                     className="h-8 w-8"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={handleAddRow} className="mt-4">
                            <Plus className="mr-2 h-4 w-4" /> Add Row
                        </Button>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isPending || !form.formState.isDirty}>
                            {isPending ? 'Saving...' : (isUpdate ? 'Update Template' : 'Create Template')}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
} 