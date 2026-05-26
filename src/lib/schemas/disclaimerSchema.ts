import * as z from 'zod';

export const disclaimerFormSchema = z.object({
  disclaimerText: z.string().max(500, "Disclaimer text cannot exceed 500 characters."),
});

export type DisclaimerFormData = z.infer<typeof disclaimerFormSchema>; 