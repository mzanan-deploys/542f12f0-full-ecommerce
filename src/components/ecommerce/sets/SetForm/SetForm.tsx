'use client';

import React from 'react';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createSetAction } from '@/lib/actions/sets/createSetAction';
import { updateSetAction } from '@/lib/actions/sets/updateSetAction';
import { useSetForm } from '@/components/ecommerce/sets/SetForm/useSetForm';
import type { SetFormProps } from '@/types/sets';
import type { SetFormServerAction } from '@/types/sets';
import { SET_LAYOUT_TYPES, type SetLayoutType } from '@/lib/schemas/setSchema';
import { Label } from "@/components/ui/label";
import SingleColumnPreview from '@/components/admin/layout-previews/LayoutPreviews/SingleColumnPreview';
import SplitSmallLeftPreview from '@/components/admin/layout-previews/LayoutPreviews/SplitSmallLeftPreview';
import SplitSmallRightPreview from '@/components/admin/layout-previews/LayoutPreviews/SplitSmallRightPreview';
import StaggeredThreePreview from '@/components/admin/layout-previews/LayoutPreviews/StaggeredThreePreview';
import TwoHorizontalPreview from '@/components/admin/layout-previews/LayoutPreviews/TwoHorizontalPreview';
import { cn } from '@/lib/utils/cn';
import { AlertCircle } from 'lucide-react';
import { EntityFormLayout } from '@/components/admin/layout/EntityFormLayout/EntityFormLayout';
import { validateSetImages } from '@/lib/helpers/setImageValidation';

const setLayoutPreviews: Record<SetLayoutType, { name: string; Preview: React.ComponentType }> = {
  SINGLE_COLUMN: { name: 'Single Column', Preview: SingleColumnPreview },
  SPLIT_SMALL_LEFT: { name: 'Split (Sm Left)', Preview: SplitSmallLeftPreview },
  SPLIT_SMALL_RIGHT: { name: 'Split (Sm Right)', Preview: SplitSmallRightPreview },
  STAGGERED_THREE: { name: 'Staggered Three', Preview: StaggeredThreePreview },
  TWO_HORIZONTAL: { name: 'Two Horizontal', Preview: TwoHorizontalPreview },
};

export const SetForm = ({ set }: SetFormProps) => {
  const serverAction: SetFormServerAction = set
    ? (updateSetAction.bind(null, set.id) as SetFormServerAction)
    : (createSetAction as SetFormServerAction);

  const formHookResult = useSetForm(serverAction, set);

  const {
    control,
    handleSlugChange,
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
    watch,
  } = formHookResult;

  const isUpdate = !!set?.id;
  const watchedLayoutType = watch('layout_type');

  const imageValidationError = React.useMemo(
    () => validateSetImages(displayImages, watchedLayoutType, isUpdate),
    [displayImages, watchedLayoutType, isUpdate]
  );

  const hasImageValidationError = !!imageValidationError;

  const isActiveField = (
    <FormField
      control={control}
      name="is_active"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-8">
          <div className="space-y-0.5">
            <FormLabel className="text-base">Active</FormLabel>
          </div>
          <FormControl>
            <Switch
              checked={!!field.value}
              onCheckedChange={field.onChange}
              id="is_active_switch"
              disabled={isPending}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );

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
      entityName="Set"
      isUpdate={isUpdate}
      imageAspectRatio={watchedLayoutType === 'TWO_HORIZONTAL' ? 'video' : 'portrait'}
      extraDisableCondition={hasImageValidationError}
      afterImageUploadSection={isActiveField}
    >
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="Set name" {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Slug <span className="text-red-500">*</span></FormLabel>
            <FormDescription>
              Auto-generated from name, or enter a custom one.
            </FormDescription>
            <FormControl>
              <Input
                placeholder="custom-set-slug"
                {...field}
                value={field.value ?? ''}
                onChange={handleSlugChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="type"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Set Type <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                name={field.name}
                className="flex flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-4"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="DAY" id="type-day" />
                  </FormControl>
                  <FormLabel htmlFor="type-day" className="font-normal">
                    Day
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="NIGHT" id="type-night" />
                  </FormControl>
                  <FormLabel htmlFor="type-night" className="font-normal">
                    Night
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Detailed description of the set"
                className="resize-none"
                {...field}
                value={field.value ?? ''}
                onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="show_title_on_home"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">
                Show Name & Description on Homepage
              </FormLabel>
              <FormDescription>
                If enabled, the set's name and description will be shown on the homepage.
                They will always be shown on the set's individual page if provided.
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="layout_type"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Layout Type <span className="text-red-500">*</span></FormLabel>
            <FormDescription>Select the visual layout for the set images.</FormDescription>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2"
              >
                {SET_LAYOUT_TYPES.map((layoutType) => {
                  const layoutData = setLayoutPreviews[layoutType];
                  if (!layoutData) return null;
                  return (
                    <Label
                      key={layoutType}
                      htmlFor={layoutType}
                      className={cn(
                        "group flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 cursor-pointer",
                        "hover:bg-accent hover:text-accent-foreground",
                        "has-[:checked]:border-primary has-[:checked]:bg-accent has-[:checked]:text-accent-foreground",
                        "has-[:checked]:[&_.preview-element]:bg-accent-foreground"
                      )}
                    >
                      <RadioGroupItem value={layoutType} id={layoutType} className="sr-only" />
                      <layoutData.Preview />
                      <span className="mt-2 text-sm font-medium">{layoutData.name}</span>
                    </Label>
                  );
                })}
              </RadioGroup>
            </FormControl>
            {imageValidationError && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> {imageValidationError}
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </EntityFormLayout>
  );
}; 