'use client';
import { globals } from '@/app/room/[code]/utils/globals';
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
      <div
        className={twMerge(
          'w-full h-full rounded-lg',
          !fullscreen && 'backdrop-blur-lg bg-neutral-950/20',
        )}
      >
        {globals.imageSrc && (
          <img
            className={twMerge(
              'w-full h-full object-cover rounded-lg',
              fullscreen && 'object-contain',
            )}
            src={globals.imageSrc}
            alt="Puzzle preview"
          />
        )}
      </div>
    </aside>
  );
}
