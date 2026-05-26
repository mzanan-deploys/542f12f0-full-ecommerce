import { z } from 'zod';

export const categoryFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  size_guide_id: z.string().uuid('Please select a size guide'),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>; 