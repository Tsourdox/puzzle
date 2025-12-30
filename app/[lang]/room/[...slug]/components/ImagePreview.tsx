'use client';
import { settingsAtom } from '@/app/atoms';
import { invert } from '@/utils/general';
import { PexelsImage } from '@/utils/pexels';
import { useAtomValue } from 'jotai';
import Image from 'next/image';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

type Props = {
  image: PexelsImage;
};

export default function ImagePreview({ image }: Props) {
  const [fullscreen, setFullscreen] = useState(false);
  const settings = useAtomValue(settingsAtom);

  const aspectRatio = image.width / image.height;
  const size = settings.ui.showLargePreview ? 20 : 10;
  const width = fullscreen
    ? 'calc(100% - 2rem)'
    : `calc(((${size}vw + ${size}vh) / 2) * ${aspectRatio})`;
  const height = fullscreen ? 'calc(100% - 2rem)' : `calc((${size}vw + ${size}vh) / 2)`;

  return (
    <>
      <div
        onClick={() => setFullscreen(invert)}
        className={twMerge(
          'fixed left-0 top-0 z-40 transition-all duration-500 cursor-pointer w-full h-full',
          fullscreen && 'backdrop-blur-lg bg-zinc-950/20',
          !fullscreen && 'pointer-events-none',
        )}
      />
      <div
        style={{ width, height }}
        className="fixed left-4 bottom-4 z-40 transition-all duration-500 cursor-pointer"
        onClick={() => setFullscreen(invert)}
      >
        <div className="relative rounded-lg overflow-hidden w-full h-full">
          <Image
            width={300}
            height={300}
            src={image.src.medium}
            alt={image.alt}
            className={twMerge('absolute w-full h-full object-contain', fullscreen && 'opacity-0')}
          />
          <Image
            width={image.width}
            height={image.height}
            src={image.src.large2x}
            alt={image.alt}
            className={twMerge('absolute w-full h-full object-contain', !fullscreen && 'opacity-0')}
          />
        </div>
      </div>
    </>
  );
}
