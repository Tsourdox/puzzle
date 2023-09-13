'use client';
import { globals } from '@/app/room/[code]/utils/globals';
import ColorThief from 'colorthief';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { invert } from './utils';

export default function ImagePreview() {
  const [fullscreen, setFullscreen] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('');
  const [palette, setPalette] = useState<string[]>([]);

  useEffect(() => {
    if (!globals.imageSrc) return;
    const colorThief = new ColorThief();
    const img = document.createElement('img');
    img.src = globals.imageSrc;
    img.crossOrigin = 'Anonymous';
    img.addEventListener('load', function () {
      const toRGB = ([r, g, b]: [number, number, number]) =>
        `rgb(${r},${g},${b})`;

      setPrimaryColor(toRGB(colorThief.getColor(img)));
      setPalette(colorThief.getPalette(img).map(toRGB));
    });
  }, []);

  return (
    <>
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
            !fullscreen && 'backdrop-blur-lg bg-purple-950/20',
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
        </div>
      </aside>
      <div className="fixed bottom-0 left-72 z-50 flex p-2 gap-2 flex-wrap">
        {[primaryColor, ...palette].map((c) => (
          <span
            key={c}
            className="w-10 h-10 rounded-full"
            style={{ background: c }}
          />
        ))}
      </div>
    </>
  );
}
