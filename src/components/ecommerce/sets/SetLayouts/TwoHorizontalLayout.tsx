'use client';

import React from 'react';
import type { SetRow, SetImageRow } from '@/types/db';
import SetCard from '@/components/ecommerce/sets/SetCard/SetCard';
import SetLayoutHeader from './SetLayoutHeader';

interface TwoHorizontalLayoutProps {
  set: SetRow & { set_images?: SetImageRow[] };
  isHomepageContext?: boolean;
}

const TwoHorizontalLayout: React.FC<TwoHorizontalLayoutProps> = ({ set, isHomepageContext }) => {
  const sortedImages = set.set_images?.slice().sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity));

  const imageUrl1 = sortedImages?.[0]?.image_url;
  const imageUrl2 = sortedImages?.[1]?.image_url;

  return (
    <div className="flex flex-col h-full px-4 md:px-4 gap-8 max-w-[1880px] mx-auto overflow-hidden">
      {!isHomepageContext && <SetLayoutHeader set={set} isHomepageContext={isHomepageContext} />}

      <div className="relative flex flex-col md:grid md:grid-cols-1 md:grid-rows-2 flex-1 gap-8 min-h-0">
        <div className="w-full md:h-full md:overflow-hidden">
          <SetCard
            set={set}
            imageUrl={imageUrl1}
            altText={`${set.name ?? "Set"} image 1`}
            imageClassName='w-full md:h-full object-cover'
            containerClassName='w-full md:h-full'
            animationDelay={0}
         />
        </div>
        <div className="w-full md:h-full md:overflow-hidden">
          <SetCard
            set={set}
            imageUrl={imageUrl2}
            altText={`${set.name ?? "Set"} image 2`}
            imageClassName='w-full md:h-full object-cover'
            containerClassName='w-full md:h-full'
            animationDelay={200}
          />
        </div>
      </div>
    </div>
  )
};

export default TwoHorizontalLayout; 