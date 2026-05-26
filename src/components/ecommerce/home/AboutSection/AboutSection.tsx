import React from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import SocialLinks from '@/components/ecommerce/layout/SocialLinks/SocialLinks';
import { useAboutSection } from './useAboutSection';
import type { AboutSectionProps } from '@/types/about';

const AboutSection: React.FC<AboutSectionProps> = ({
  text,
  images,
  aspectRatio = 'square',
}) => {
  const {
    validImages,
    itemAspectClass,
    titleAnimation,
    textAnimation,
    carouselAnimation
  } = useAboutSection({ images, aspectRatio });

  return (
    <section className="min-h-dvh-header bg-gradient-to-br from-[#fafafa] via-[#f6f0ff] to-[#eae6ff] py-24 overflow-y-auto">
      <div className="container mx-auto px-12 lg:px-32">

        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10 lg:gap-0">

          {/* LEFT COLUMN */}
          <div>
            {(text || validImages.length > 0) && (
              <h2
                ref={titleAnimation.elementRef}
                style={titleAnimation.animationStyles}
                className="text-4xl font-bold text-black mb-6"
              >
                About Us
              </h2>
            )}

            {text && (
              <>
                <p
                  ref={textAnimation.elementRef}
                  style={textAnimation.animationStyles}
                  className="text-gray-600 text-lg lg:text-xl leading-relaxed whitespace-pre-wrap"
                >
                  {text}
                </p>
                <div style={textAnimation.animationStyles}>
                  <SocialLinks className="mt-6" />
                </div>
              </>
            )}
          </div>

          {/* RIGHT COLUMN - CAROUSEL */}
          {validImages.length > 0 && (
            <div
              ref={carouselAnimation.elementRef}
              style={carouselAnimation.animationStyles}
              className="justify-self-end w-full max-w-md"
            >
              <Carousel opts={{ loop: true }}>
                <CarouselContent>
                  {validImages.map((imageUrl, index) => (
                    <CarouselItem key={imageUrl || index}>
                      <div className={`relative ${itemAspectClass} rounded-xl overflow-hidden`}>
                        <Image
                          src={imageUrl}
                          alt={`About us image ${index + 1}`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                          className="object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {validImages.length > 1 && (
                  <>
                    <CarouselPrevious className="left-3 top-1/2 -translate-y-1/2" />
                    <CarouselNext className="right-3 top-1/2 -translate-y-1/2" />
                  </>
                )}
              </Carousel>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};

export default AboutSection;