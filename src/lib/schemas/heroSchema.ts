import { z } from 'zod';

export const HERO_CONTENT_ID = 1; 

export const heroContentFormSchema = z.object({
  id: z.string()
    .refine(val => val === String(HERO_CONTENT_ID), {
        message: `ID must be ${HERO_CONTENT_ID}`,
    }),
  images: z.any()
    .refine((files) => {
        if (!files) return true;
        if (files instanceof File && files.size > 0) return true;
        if (Array.isArray(files) && files.length > 0 && files[0] instanceof File && files[0].size > 0) return true;
        if (typeof FileList !== 'undefined' && files instanceof FileList && files.length > 0 && files[0]?.size > 0) return true;
        return true;
    }, 'Invalid file.')
    .refine((files) => {
        if (!files) return true;
        const fileArray = Array.isArray(files) && files.every(f => f instanceof File) 
                            ? files 
                            : (typeof FileList !== 'undefined' && files instanceof FileList) 
                                ? Array.from(files) 
                                : (files instanceof File ? [files] : []);
        if (fileArray.length === 0) return true; 
        return fileArray.every(file => {
          const isVideo = typeof file.type === 'string' && file.type.startsWith('video/');
          const maxSize = isVideo ? 100 * 1024 * 1024 : 5 * 1024 * 1024;
          return file.size <= maxSize;
        }); 
    }, `Each file must be within size limits.`)
    .refine((files) => {
        if (!files) return true;
        const fileArray = Array.isArray(files) && files.every(f => f instanceof File) 
                            ? files 
                            : (typeof FileList !== 'undefined' && files instanceof FileList) 
                                ? Array.from(files) 
                                : (files instanceof File ? [files] : []);
        if (fileArray.length === 0) return true; 
        const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
        const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg"];
        return fileArray.every(file => ACCEPTED_IMAGE_TYPES.includes(file.type) || ACCEPTED_VIDEO_TYPES.includes(file.type));
    }, "Supported formats: .jpg, .jpeg, .png, .webp, .gif, .mp4, .webm, .ogg.")
    .optional(), 
    image_url: z.string().url().optional().nullable(),
  imageOrderChanged: z.boolean().optional(), 
});

export type HeroContentFormData = z.infer<typeof heroContentFormSchema>; 