'use client';

import React, { useMemo } from 'react';
import type { SetRow, PageComponent, PageComponentContent } from '@/types/db';
import type { SetLayoutType } from '@/lib/schemas/setSchema';
import SingleColumnLayout from '@/components/ecommerce/sets/SetLayouts/SingleColumnLayout';
import SplitSmallLeftLayout from '@/components/ecommerce/sets/SetLayouts/SplitSmallLeftLayout';
import SplitSmallRightLayout from '@/components/ecommerce/sets/SetLayouts/SplitSmallRightLayout';
import StaggeredThreeLayout from '@/components/ecommerce/sets/SetLayouts/StaggeredThreeLayout';
import TwoHorizontalLayout from '@/components/ecommerce/sets/SetLayouts/TwoHorizontalLayout';
import SetLayoutHeader from '@/components/ecommerce/sets/SetLayouts/SetLayoutHeader';
import { useFadeInAnimation } from '@/hooks/useFadeInAnimation';

interface DisplaySetsProps {
  homepageItems: (PageComponent & { item_type: 'page_component' } | SetRow & { item_type: 'set' })[];
  primaryType: 'DAY' | 'NIGHT' | null;
}

const layoutComponents = {
  SPLIT_SMALL_LEFT: SplitSmallLeftLayout,
  SPLIT_SMALL_RIGHT: SplitSmallRightLayout,
  STAGGERED_THREE: StaggeredThreeLayout,
  TWO_HORIZONTAL: TwoHorizontalLayout,
  SINGLE_COLUMN: SingleColumnLayout,
} as const;

const AnimatedSetRenderer: React.FC<{ 
  set: SetRow; 
  isHomepageContext: boolean; 
  type: 'DAY' | 'NIGHT';
  index: number;
}> = ({ set, isHomepageContext }) => {
  const layoutType = (set.layout_type || 'SINGLE_COLUMN') as SetLayoutType;
  const LayoutComponent = layoutComponents[layoutType] || SingleColumnLayout;
  
  return (
    <div className="h-full">
      <LayoutComponent set={set} isHomepageContext={isHomepageContext} />
    </div>
  );
};

const AnimatedTextComponent: React.FC<{ 
  pageComponent: PageComponent; 
  index: number; 
}> = ({ pageComponent, index }) => {
  const content = pageComponent.content as PageComponentContent;
  
  const { elementRef, animationStyles } = useFadeInAnimation<HTMLDivElement>({
    delay: index * 300,
    duration: 800,
    translateY: 30,
    translateX: 0,
  });

  return (
    <div 
      ref={elementRef}
      style={animationStyles}
      className='flex flex-col gap-2'
    >
      {content?.title && <h2 className='text-2xl font-bold'>{content.title}</h2>}
      <p>{content?.text ?? ''}</p>
    </div>
  );
};

const getTypeSpecificClasses = (type: 'DAY' | 'NIGHT') => {
  return type === 'DAY' ? 'text-black' : 'bg-black text-white';
};

const getHeaderPadding = (layoutType: string) => {
  const paddingMap: Record<string, string> = {
    'SPLIT_SMALL_LEFT': 'p-4 md:p-0',
    'SPLIT_SMALL_RIGHT': 'p-4 md:p-0',
    'TWO_HORIZONTAL': 'p-4 md:px-4',
    'STAGGERED_THREE': 'px-4',
    'SINGLE_COLUMN': 'px-4 md:px-0',
  };
  return paddingMap[layoutType] || paddingMap['SINGLE_COLUMN'];
};

const getHeaderGap = (layoutType: string) => {
  return layoutType === 'SINGLE_COLUMN' ? 'gap-6' : 'gap-8';
};

const renderSetItem = (set: SetRow, primaryType: 'DAY' | 'NIGHT') => {
  const shouldShowHeader = !(set.show_title_on_home === false) && set.name;
  const layoutType = set.layout_type || 'SINGLE_COLUMN';

  return (
    <div 
      key={set.id} 
      className={`snap-start sm:min-h-dvh-header md:h-dvh-header w-full max-w-[100vw] overflow-x-hidden ${getTypeSpecificClasses(primaryType)} flex flex-col py-4 md:py-6 ${shouldShowHeader ? getHeaderGap(layoutType) : ''}`} 
      style={{ scrollSnapAlign: 'start' }}
    >
      {shouldShowHeader && (
        <div className={`w-full max-w-[1880px] mx-auto ${getHeaderPadding(layoutType)}`} style={{ scrollSnapAlign: 'none' }}>
          <SetLayoutHeader set={set} isHomepageContext={true} />
        </div>
      )}
      <div className="flex-1 flex flex-col h-full min-h-0" style={{ scrollSnapAlign: 'none' }}>
        <AnimatedSetRenderer set={set} isHomepageContext={true} type={primaryType} index={0} />
      </div>
    </div>
  );
};

const renderPageComponent = (pageComponent: PageComponent, index: number) => (
  <AnimatedTextComponent
    key={pageComponent.id}
    pageComponent={pageComponent}
    index={index}
  />
);

export default function DisplaySets({
  homepageItems,
  primaryType
}: DisplaySetsProps) {

  const primaryItems = useMemo(() => {
    if (!primaryType) return [];
    
    const items: React.JSX.Element[] = [];
    let componentIndex = 0;

    homepageItems.forEach((item) => {
      if (item.item_type === 'page_component') {
        const pageComponent = item as PageComponent;
        if (pageComponent.affiliation === primaryType) {
          items.push(renderPageComponent(pageComponent, componentIndex++));
        }
      } else if (item.item_type === 'set') {
        const set = item as SetRow;
        if (set.type === primaryType && set.is_active) {
          items.push(renderSetItem(set, primaryType));
        }
      }
    });

    return items;
  }, [homepageItems, primaryType]);

  if (!primaryType) return null;

  return <>{primaryItems}</>;
} 