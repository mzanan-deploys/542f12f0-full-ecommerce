import { z } from 'zod';

export const SET_TYPES = ["DAY", "NIGHT"] as const;

export type SetType = typeof SET_TYPES[number];

export const SET_LAYOUT_TYPES = [
  "SINGLE_COLUMN",
  "SPLIT_SMALL_LEFT",
  "SPLIT_SMALL_RIGHT",
  "STAGGERED_THREE",
  "TWO_HORIZONTAL",
] as const;
export type SetLayoutType = typeof SET_LAYOUT_TYPES[number];

export const baseSetFormSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }).max(255).default(''),
  slug: z.string()
          .min(3, { message: 'Slug must be at least 3 characters' })
          .max(255)
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Slug can only contain lowercase letters, numbers, and hyphens' })
          .default(''),
  description: z.string().max(1000, { message: 'Description cannot exceed 1000 characters'}).optional(),
  type: z.enum(SET_TYPES, { message: "Set type is required" }).default(SET_TYPES[0]),
  layout_type: z.enum(SET_LAYOUT_TYPES, { message: "Layout type is required" }).default(SET_LAYOUT_TYPES[0]),
  is_active: z.boolean().default(true),
  show_title_on_home: z.boolean().optional().default(false),
  images: z.array(z.any()).default([]),
  imageOrderChanged: z.boolean().optional().default(false),
});

export const createSetFormSchema = baseSetFormSchema.extend({
    images: z.array(z.instanceof(File))
             .min(1, { message: "At least one image is required." })
             .max(3, { message: "Maximum 3 images allowed." })
             .default([]),
});

export const updateSetFormSchema = baseSetFormSchema.extend({
    id: z.string().uuid(),
    images: z.array(z.instanceof(File))
             .max(3, "Maximum of 3 images allowed.")
             .optional()
             .default([]),
});

export type SetFormData = z.infer<typeof baseSetFormSchema> & {
    images?: File[];
};
