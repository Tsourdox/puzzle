'use client';
import PuzzleButtons from '@/app/[lang]/room/[...slug]/components/PuzzleButtons';
import { PropsWithClassName, invert } from '@/utils/general';
import { ArrowLeftCircleIcon, ArrowRightCircleIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Button from './Button';

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
      <div className="absolute top-6 -left-20 flex flex-col gap-2 items-center">
        <Button
          className="p-1"
          variant="secondary"
          icon={
            isOpen ? (
              <ArrowRightCircleIcon width={50} height={50} />
            ) : (
              <ArrowLeftCircleIcon width={50} height={50} />
            )
          }
          onClick={() => setIsOpen(invert)}
        />

        <PuzzleButtons isHidden={isOpen} />
      </div>
      {children}
    </aside>
  );
}
