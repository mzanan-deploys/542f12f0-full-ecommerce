'use client';

import React from 'react';
import type { SetRow } from '@/types/db';
import SetCard from '@/components/ecommerce/sets/SetCard/SetCard';

type SetImageRow = {
  id: string;
  image_url: string;
  alt_text?: string | null;
  position?: number | null;
  set_id: string;
};

interface SingleColumnLayoutProps {
  set: SetRow & {
    set_images?: SetImageRow[];
  };
  isHomepageContext?: boolean;
}

const SingleColumnLayout: React.FC<SingleColumnLayoutProps> = ({ set }) => {
  const imageUrl = set.set_images?.[0]?.image_url;

  return (
    <div className="flex flex-col h-full w-full max-w-[1880px] mx-auto px-4 md:px-8 overflow-hidden">
      <div className="relative w-full flex-1 flex justify-center items-center min-h-0">
        <SetCard
          set={set}
          imageUrl={imageUrl}
          altText={`${set.name ?? 'Set'} image`}
          imageClassName="w-full aspect-[9/14] md:h-full object-cover"
          containerClassName="w-full md:h-full"
          animationDelay={0}
        />
      </div>
    </div>
  );
};

export default SingleColumnLayout;