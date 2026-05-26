'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categoryFormSchema, type CategoryFormData } from '@/lib/schemas/categorySchema';
import { createCategoryAction, updateCategoryAction } from '@/lib/actions/categoryActions';
import { fetchBasicSizeGuideTemplatesAction } from '@/lib/actions/sizeGuideActions';
import type { BasicSizeGuideTemplate } from '@/types/sizeGuide';
import type { ProductCategoryRow } from '@/types/db';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose, 
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

type ProductCategory = ProductCategoryRow;

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  category?: ProductCategory | null; 
  onSuccess: (category: ProductCategory) => void;
}

export default function CategoryForm({ isOpen, onClose, category, onSuccess }: CategoryFormProps) {
  const [sizeGuides, setSizeGuides] = useState<BasicSizeGuideTemplate[]>([]);
  const [isLoadingSizeGuides, setIsLoadingSizeGuides] = useState(false);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name || '',
      size_guide_id: category?.size_guide_id || undefined,
    },
  });

  useEffect(() => {
    const loadSizeGuides = async () => {
      setIsLoadingSizeGuides(true);
      const { data, error } = await fetchBasicSizeGuideTemplatesAction();
      if (data) {
        setSizeGuides(data);
      }
      if (error) {
        toast.error('Failed to load size guides', { description: error });
      }
      setIsLoadingSizeGuides(false);
    };

    if (isOpen) {
      loadSizeGuides();
      if (category) {
        form.reset({ name: category.name, size_guide_id: category.size_guide_id || undefined });
      } else {
        form.reset({ name: '', size_guide_id: undefined });
      }
    }
  }, [category, form, isOpen]);

  const onSubmit = async (values: CategoryFormData) => {
    let result;
    const { size_guide_id, ...restValues } = values;
    const payload: any = {
      ...restValues,
    };
    
    if (size_guide_id && size_guide_id !== 'none' && size_guide_id !== '') {
      payload.size_guide_id = size_guide_id;
    }

    if (category?.id) {
      result = await updateCategoryAction(category.id, payload);
    } else {
      result = await createCategoryAction(payload);
    }

    if (result.success && result.data) {
      toast.success(category?.id ? "Category Updated" : "Category Created", {
        description: `Category "${result.data.name}" has been saved successfully.`,
      });
      onSuccess(result.data);
      onClose();
    } else {
      let errorMessage = 'Failed to save category due to an unknown error.';
      if (typeof result.error === 'string') {
        errorMessage = result.error;
      } else if (result.error && typeof result.error === 'object') {

        errorMessage = 'Form validation failed. Please check all required fields.';
      }
      toast.error("Category Save Failed", {
        description: errorMessage,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category?.id ? 'Edit Category' : 'Create New Category'}</DialogTitle>
          <DialogDescription>
            {category?.id ? 'Update the details of this category.' : 'Enter details for the new category.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., T-Shirts, Pants, Accessories" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="size_guide_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size Guide (Optional)</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                    value={field.value || 'none'} 
                    disabled={isLoadingSizeGuides}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingSizeGuides ? "Loading guides..." : "Select a size guide"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No size guide</SelectItem>
                      {sizeGuides.map((guide) => (
                        <SelectItem key={guide.id} value={guide.id}>
                          {guide.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={form.formState.isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting || isLoadingSizeGuides}>
                {form.formState.isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  'Save Category'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 