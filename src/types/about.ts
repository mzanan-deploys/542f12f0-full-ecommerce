export interface AboutSectionProps {
  text?: string | null;
  images?: (string | null)[] | null;
  aspectRatio?: 'square' | 'portrait' | 'video' | null;
}

export interface AboutContentData {
  text_content: string | null;
  image_urls: (string | null)[] | null;
  image_aspect_ratio?: 'square' | 'portrait' | 'video' | null;
}

export interface UploadedImageInfo {
    tempId: string;
    url: string;
    path: string;
} 