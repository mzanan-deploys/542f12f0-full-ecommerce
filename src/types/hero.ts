import type { ActionResponse } from '@/types/actions';

export interface HeroDbRow {
  id: number;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  updated_at: string;
}

export interface HeroSettingsProps {
  initialData: HeroDbRow | null;
}

export interface HeroWrappedActionState extends ActionResponse<Omit<HeroDbRow, 'id'> & { id: string }> {}

export interface HeroFormData {
  id: string;
  image_url: string | null;
  updated_at: string;
}