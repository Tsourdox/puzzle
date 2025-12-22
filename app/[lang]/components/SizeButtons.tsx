'use client';

import { useAtom } from 'jotai';
import { sizeAtom } from '@/app/atoms';
import { sizes } from '@/utils/sizes';
import { twMerge } from 'tailwind-merge';

export default function SizeButtons() {
  const [currentSize, setSize] = useAtom(sizeAtom);

  return (
    <section className="flex gap-2 md:gap-2">
      {sizes.map((size) => (
        <button
          key={size}
          onClick={() => setSize(size)}
          className={twMerge(
            'rounded-full backdrop-blur-lg uppercase px-4 py-2 md:px-3 md:py-1 text-base md:text-sm cursor-pointer bg-zinc-500/20 active:bg-purple-900/50 hover:bg-purple-800/40 min-w-[3rem] font-semibold',
            size === currentSize && 'bg-purple-800/60',
          )}
        >
          {size}
        </button>
      ))}
    </section>
  );
}
