'use client';
import { invert } from '@/utils/general';
import { PexelsImage } from '@/utils/pexels';
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
        'fixed left-0 bottom-0 p-6 w-64 h-44 z-50 transition-all duration-500 cursor-pointer',
        fullscreen && 'w-full h-full backdrop-blur-lg',
      )}
    >
      <div
        className={twMerge(
          'w-full h-full rounded-lg',
          !fullscreen && 'backdrop-blur-lg bg-neutral-950/20',
        )}
      >
        <img
          className={twMerge(
            'w-full h-full object-cover rounded-lg',
            fullscreen && 'object-contain',
          )}
          src={fullscreen ? image.src.large2x : image.src.medium}
          alt="Puzzle preview"
        />
      </div>
    </aside>
  );
}
