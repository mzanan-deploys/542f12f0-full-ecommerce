'use client';

import React, { forwardRef } from 'react';
import Image from 'next/image';
import { LazyVideo } from '@/components/LazyVideo/LazyVideo';

interface HeroImageProps {
  imageUrl: string | null | undefined;
  posterUrl?: string;
  isLoading?: boolean;
}

const isVideoUrl = (url: string) => /\.(mp4|webm|ogg)$/i.test(url);

const HeroImage = forwardRef<HTMLDivElement, HeroImageProps>(({ imageUrl, posterUrl, isLoading }, ref) => {
  if (isLoading && !imageUrl) {
    return (
      <div className="h-dvh w-full bg-gray-200 animate-pulse snap-start"></div>
    );
  }
  return (
    <div ref={ref} className="h-dvh bg-black snap-start">
      <section className='relative h-full w-full'>
        {imageUrl && (isVideoUrl(imageUrl) ? (
          <LazyVideo
            src={imageUrl}
            poster={posterUrl}
            className='h-full w-full object-cover'
          />
        ) : (
          <Image
            src={imageUrl}
            alt='Hero background image'
            fill
            priority
            className='object-cover'
          />
        ))}
      </section>
    </div>
  );
});

HeroImage.displayName = 'HeroImage';

export default HeroImage;