'use client';

import { useStoreDispatch, useStoreState } from '@/store/StoreProvider';
import { sizes } from '@/utils/sizes';
import { twMerge } from 'tailwind-merge';

export default function SizeButtons() {
  const store = useStoreState();
  const dispatch = useStoreDispatch();

  return (
    <section className="flex gap-1 md:gap-2">
      {sizes.map((size) => (
        <button
          key={size}
          onClick={() => dispatch({ type: 'SET_SIZE', payload: size })}
          className={twMerge(
            'rounded-full backdrop-blur-lg uppercase px-2 md:px-3 md:py-1 cursor-pointer bg-zinc-500/20 active:bg-purple-900/50 hover:bg-purple-800/40',
            size === store.size && 'bg-purple-800/60',
          )}
        >
          {size}
        </button>
      ))}
    </section>
  );
}
