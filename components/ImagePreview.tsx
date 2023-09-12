'use client';
import { globals } from '@/app/room/[code]/utils/globals';
import Image from 'next/image';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { invert } from './utils';

export default function ImagePreview() {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <aside
      onClick={() => setFullscreen(invert)}
      className={twMerge(
        'fixed left-0 bottom-0 p-6 w-64 h-44 z-50 transition-all duration-500 cursor-pointer',
        fullscreen && 'w-full h-full backdrop-blur-lg',
      )}
    >
      <Image
        className={twMerge(
          'w-full h-full object-cover rounded-lg',
          fullscreen && 'object-contain',
        )}
        width={1200}
        height={900}
        src={globals.imageSrc}
        alt="Puzzle preview"
      />
    </aside>
  );
}
