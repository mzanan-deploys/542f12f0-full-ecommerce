'use client';

import React from 'react';
import type { PublicSetListItem } from '@/types/sets';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { useFadeInAnimation } from '@/hooks/useFadeInAnimation';

interface SetCardProps {
  set: Pick<PublicSetListItem, 'slug' | 'name'>;
  imageUrl: string | null | undefined;
  altText?: string;
  containerClassName?: string;
  imageClassName?: string;
  showTitleOverlay?: boolean;
  isPriority?: boolean;
  animationDelay?: number;
}

const SetCard: React.FC<SetCardProps> = ({
  set,
  imageUrl,
  altText,
  containerClassName,
  imageClassName,
  isPriority = false,
  animationDelay = 0,
}) => {
  const defaultAltText = `${set.name ?? 'Set'} image`;

  const { elementRef, animationStyles } = useFadeInAnimation<HTMLDivElement>({
    delay: animationDelay,
    duration: 800,
    translateY: 30,
    translateX: 0,
  });

  const hasHeightConstraint = containerClassName?.includes('h-full') || containerClassName?.includes('max-h-full');
  const hasAspectRatioInClassName = imageClassName?.includes('aspect-');
  const shouldUseAspectRatio = !hasHeightConstraint || hasAspectRatioInClassName;

  return (
    <div
      ref={elementRef}
      className={cn('group w-full', containerClassName)}
      style={animationStyles}
    >
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-lg',
          shouldUseAspectRatio && !hasAspectRatioInClassName && 'aspect-[9/14]',
          !shouldUseAspectRatio && !hasAspectRatioInClassName && 'h-full',
          imageClassName
        )}
      >
        <Link
          href={`/set/${set.slug}`}
          prefetch={true}
          className="block w-full h-full relative"
        >
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={altText ?? defaultAltText}
              fill
              priority={isPriority}
              sizes="(max-width: 540px) 100vw, 540px"
              className={cn(
                "transition-transform duration-300 ease-in-out group-hover:scale-105 rounded-lg",
                imageClassName?.includes('object-contain') ? 'object-contain' : 'object-cover object-center'
              )}
              loading={isPriority ? 'eager' : 'lazy'}
            />
          )}
        </Link>
      </div>
    </div>
  );
};

export default SetCard;