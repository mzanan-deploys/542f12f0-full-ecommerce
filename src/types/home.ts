import type { SetRow, PageComponent } from './db';
import type { HeroDbRow } from './hero';

export interface AboutContentData {
  text_content: string | null;
  image_urls: (string | null)[] | null;
  image_aspect_ratio?: 'square' | 'portrait' | 'video' | null;
}

export type HomePageItemOrchestrator = 
    | (PageComponent & { item_type: 'page_component' }) 
    | (SetRow & { item_type: 'set'; set_images?: any[]; set_products?: any[] });

export interface HomeProps {
  homepageItemsData: HomePageItemOrchestrator[];
  aboutContentData: AboutContentData | null;
  heroContentData: HeroDbRow | null;
}

export interface UseHomeProps {
  initialSets: SetRow[] | null;
  containerDimensions?: { width: number; height: number };
}

export interface AnimatedWordProps {
  word: string;
  className?: string;
  hoverColor?: string;
  onClick: () => void;
}

export interface DisplaySetsProps {
  homepageItems: (PageComponent & { item_type: 'page_component' } | SetRow & { item_type: 'set' })[];
  primaryType: 'DAY' | 'NIGHT' | null;
}

export interface AnimatedSetRendererProps {
  set: SetRow;
  isHomepageContext: boolean;
  type: 'DAY' | 'NIGHT';
  index: number;
}

export interface AnimatedTextComponentProps {
  pageComponent: PageComponent;
  index: number;
}