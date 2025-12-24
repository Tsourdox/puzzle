'use client';

import { PexelsImage } from '@/utils/pexels';
import Image from 'next/image';
import { ComponentProps, useState } from 'react';
import ImageCardModal from './ImageCardModal';

type Props = ComponentProps<'div'> & {
  image: PexelsImage;
};

export default function ImageCardContainer({ image, children, ...props }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = () => {
    // Open modal on touch devices OR small screens (even with mouse)
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    const isSmallScreen = window.innerWidth < 768;
    if (isTouchDevice || isSmallScreen) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div
        className="group w-28 sm:w-36 md:w-80 relative aspect-square flex-none rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer"
        onClick={handleCardClick}
        {...props}
      >
        <Image
          src={image.src.medium}
          alt={image.alt}
          width={300}
          height={300}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 md:group-hover:scale-110"
        />

        <div className="hidden md:flex absolute invisible group-hover:visible top-0 left-0 w-full h-full backdrop-blur-sm bg-black/10 flex-col justify-center items-center gap-4 transition-opacity duration-200">
          {children}
        </div>
      </div>

      <ImageCardModal image={image} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {children}
      </ImageCardModal>
    </>
  );
}
