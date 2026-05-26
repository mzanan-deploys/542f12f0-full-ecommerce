import { z } from 'zod';
import { MAX_FILE_SIZE } from '@/lib/constants/images';
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const productFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  slug: z.string().min(3, { message: "Slug must be at least 3 characters." })
           .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "Slug must be lowercase alphanumeric with hyphens only." }),
  description: z.string().nullish(),
  price: z.preprocess(
      (val) => typeof val === 'string' ? parseFloat(val.replace(',', '.')) : val,
      z.number({ message: 'Price must be a number.' })
       .positive({ message: "Price must be a positive number." })
  ),
  is_active: z.boolean().default(true),
  images: z.preprocess(
      (val) => (val instanceof FormData ? (val.getAll('images') as unknown[]) : val),
      z.array(z.instanceof(File))
          .refine((files) => files.every(file => file.size <= MAX_FILE_SIZE), `Each file must be 5MB or less.`)
          .refine(
              (files) => files.every(file => ACCEPTED_IMAGE_TYPES.includes(file.type)),
              "Only .jpg, .jpeg, .png, .webp and .gif formats are supported."
          )
  ).optional(),

  category_id: z.string().uuid({ message: "Product category is required." }),
  stock_quantity: z.preprocess(
      (val) => (typeof val === 'string' && val.trim() !== '' ? parseInt(val, 10) : typeof val === 'number' ? val : undefined),
      z.number({ message: 'Stock quantity must be a number.' })
       .int({ message: "Stock quantity must be an integer." })
       .nonnegative({ message: "Stock quantity cannot be negative." })
       .default(0)
  ),
  selected_size_names: z.array(z.string()).optional(),

  setIds: z.array(z.string()).optional(),
});


export const updateProductSchema = productFormSchema.omit({ images: true }).extend({
    images: z.preprocess(
      (val) => (val instanceof FormData ? (val.getAll('images') as unknown[]) : val),
      z.array(z.instanceof(File))
          .refine((files) => files.every(file => file.size <= MAX_FILE_SIZE), `Each file must be 5MB or less.`)
          .refine(
              (files) => files.every(file => ACCEPTED_IMAGE_TYPES.includes(file.type)),
              "Only .jpg, .jpeg, .png, .webp and .gif formats are supported."
          )
    ).optional(),
});


export const createProductSchema = productFormSchema.extend({
    images: z.preprocess(
      (val) => (val instanceof FormData ? (val.getAll('images') as unknown[]) : val),
       z.array(z.instanceof(File))
        .min(1, 'At least one product image is required.')
        .refine((files) => files.every(file => file.size <= MAX_FILE_SIZE), `Each file must be 5MB or less.`)
        .refine(
            (files) => files.every(file => ACCEPTED_IMAGE_TYPES.includes(file.type)),
            "Only .jpg, .jpeg, .png, .webp and .gif formats are supported."
        )
    ),
});



export type ProductFormData = z.infer<typeof productFormSchema>;

export type ValidatedProductFormData = Omit<ProductFormData, 'images'> & {
    category_id: string;
    stock_quantity: number;
    selected_size_names: string[];
    images?: File[];
};

export type UpdateProductFormData = z.infer<typeof updateProductSchema>; 