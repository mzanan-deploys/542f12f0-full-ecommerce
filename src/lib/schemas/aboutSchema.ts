import { z } from 'zod';

export const aboutFormSchema = z.object({
  text_content: z.string().min(1, 'Section text is required'),
  images: z.array(z.any())
            .max(4, 'You can upload up to 4 images')
            .optional(),
  image_aspect_ratio: z.enum(['square', 'portrait', 'video']),
});

export type AboutFormData = z.infer<typeof aboutFormSchema>; 