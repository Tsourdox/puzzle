'use client';
import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
} from '@heroicons/react/20/solid';
import { twMerge } from 'tailwind-merge';
import { PropsWithClassName } from './utils';

type Props = PropsWithClassName & {
  isOpen: boolean;
  onToggle: () => void;
};

export function AppBar({ isOpen, className, onToggle, children }: Props) {
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
        onClick={onToggle}
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
