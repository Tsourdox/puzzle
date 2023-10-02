'use client';
import { invert } from '@/utils/general';
import { PexelsImage } from '@/utils/pexels';
import Image from 'next/image';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

type Props = {
  image: PexelsImage;
};

export default function ImagePreview({ image }: Props) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <aside
      onClick={() => setFullscreen(invert)}
      className={twMerge(
        'fixed left-0 bottom-0 p-6 w-60 h-40 z-50 transition-all duration-500 cursor-pointer',
        fullscreen && 'w-full h-full backdrop-blur-lg',
      )}
    >
      <div
        className={twMerge(
          'relative w-full h-full rounded-lg overflow-hidden',
          !fullscreen && 'backdrop-blur-lg bg-neutral-950/20',
        )}
      >
        <Image
          width={300}
          height={300}
          src={image.src.medium}
          alt={image.alt}
          className={twMerge(
            'absolute w-full h-full object-cover transition-opacity',
            fullscreen && 'opacity-0',
          )}
        />
        <Image
          width={image.width}
          height={image.height}
          src={image.src.large2x}
          alt={image.alt}
          className={twMerge(
            'absolute w-full h-full object-contain transition-opacity',
            !fullscreen && 'opacity-0',
          )}
        />
      </div>
    </aside>
  );
}
