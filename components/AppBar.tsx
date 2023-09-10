'use client';
import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
} from '@heroicons/react/20/solid';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { PropsWithClassName } from './utils';

export function AppBar(props: PropsWithClassName) {
  const [isClosed, setIsOpen] = useState(true);

  return (
    <aside
      onClick={(e) => e.stopPropagation()}
      className={twMerge(
        'fixed right-0 h-full z-50 transition-transform duration-500 flex flex-col p-6 text-5xl uppercase text-neutral-100 backdrop-blur-lg shadow-2xl shadow-black/30 bg-gradient-to-bl from-[#210034]/10 via-10% via-neutral-950 to-100% to-[#110024]/20',
        isClosed && 'translate-x-full',
        props.className,
      )}
    >
      <i
        className="absolute cursor-pointer top-6 -left-20 backdrop-blur-lg shadow-2xl shadow-black/50 rounded-full active:scale-90 p-1"
        onClick={() => setIsOpen((o) => !o)}
      >
        {isClosed ? (
          <ArrowLeftCircleIcon width={50} height={50} />
        ) : (
          <ArrowRightCircleIcon width={50} height={50} />
        )}
      </i>
      {props.children}
    </aside>
  );
}
