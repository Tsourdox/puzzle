'use client';
import { PropsWithClassName, invert } from '@/utils/general';
import { ArrowLeftCircleIcon, ArrowRightCircleIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

type Props = PropsWithClassName;

export function AppBar({ className, children }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside
      onClick={(e) => e.stopPropagation()}
      className={twMerge(
        'fixed right-0 h-full z-40 transition-transform duration-500 flex flex-col p-6 text-5xl uppercase text-neutral-100 backdrop-blur-lg bg-neutral-800/60',
        !isOpen && 'translate-x-full',
        className,
      )}
    >
      <i
        className="absolute cursor-pointer top-6 -left-20 backdrop-blur-lg shadow-2xl shadow-black/50 rounded-full active:scale-90 p-1"
        onClick={() => setIsOpen(invert)}
      >
        {isOpen ? (
          <ArrowRightCircleIcon width={50} height={50} />
        ) : (
          <ArrowLeftCircleIcon width={50} height={50} />
        )}
      </i>
      {children}
    </aside>
  );
}
