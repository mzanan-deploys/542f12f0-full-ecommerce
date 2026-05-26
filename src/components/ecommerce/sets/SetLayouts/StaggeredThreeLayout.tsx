'use client';

import React from 'react';
import type { SetRow, SetImageRow } from '@/types/db';
import SetCard from '@/components/ecommerce/sets/SetCard/SetCard';
import SetLayoutHeader from './SetLayoutHeader';

interface StaggeredThreeLayoutProps {
  set: SetRow & { set_images?: SetImageRow[] };
  isHomepageContext?: boolean;
}

const StaggeredThreeLayout: React.FC<StaggeredThreeLayoutProps> = ({ set, isHomepageContext }) => {
  const sortedImages = set.set_images?.slice().sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity));

  const imageUrl1 = sortedImages?.[0]?.image_url;
  const imageUrl2 = sortedImages?.[1]?.image_url;
  const imageUrl3 = sortedImages?.[2]?.image_url;

      return (
        <div className="flex flex-col h-full px-4 gap-8 max-w-[1880px] mx-auto overflow-hidden">
            {!isHomepageContext && <SetLayoutHeader set={set} isHomepageContext={isHomepageContext} />}

      <div className="relative flex flex-col md:flex-row md:justify-center flex-1 gap-8 2xl:gap-0 min-h-0">
        <div className="flex flex-col w-full items-center md:self-start">
          <SetCard
            set={set}
            imageUrl={imageUrl1}
            altText={`${set.name ?? "Set"} image 1`}
            imageClassName='w-full md:max-w-[450px]'
            containerClassName='w-full flex flex-col items-end'
            animationDelay={0}
         />
        </div>
        <div className="flex flex-col w-full items-center md:self-center">
          <SetCard
            set={set}
            imageUrl={imageUrl2}
            altText={`${set.name ?? "Set"} image 2`}
            imageClassName='w-full md:max-w-[450px]'
            containerClassName='w-full flex flex-col items-center'
            animationDelay={200}
          />
        </div>
        <div className="flex flex-col w-full items-center md:self-end">
          <SetCard
            set={set}
            imageUrl={imageUrl3}
            altText={`${set.name ?? "Set"} image 3`}
            imageClassName='w-full md:max-w-[450px]'
            containerClassName='w-full flex flex-col items-start'
            animationDelay={400}
          />
        </div>
      </div>
    </div>
  )
};

export default StaggeredThreeLayout; 
