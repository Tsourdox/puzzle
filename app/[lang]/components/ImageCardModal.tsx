'use client';

import { PexelsImage } from '@/utils/pexels';
import { XMarkIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';
import { ReactNode, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

interface Props {
  image: PexelsImage;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function ImageCardModal({ image, isOpen, onClose, children }: Props) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Trigger animation after mount
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      document.body.style.overflow = 'unset';
      setIsAnimating(false);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={twMerge(
        'fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm transition-colors duration-300 p-4',
        isAnimating ? 'bg-black/80' : 'bg-black/0',
      )}
    >
      <div
        className={twMerge(
          'relative w-full max-w-2xl max-h-full flex flex-col transition-all duration-300 ease-out',
          isAnimating ? 'scale-100 opacity-100' : 'scale-75 opacity-0',
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors active:scale-95"
          aria-label="Close"
        >
          <XMarkIcon className="w-7 h-7 text-white" />
        </button>

        <div className="relative w-full aspect-square rounded-3xl overflow-hidden mb-6 shadow-2xl">
          <Image
            src={image.src.large}
            alt={image.alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
            priority
          />
        </div>

        <div className="flex flex-col items-center gap-6 text-white pb-4 px-4 scale-125 sm:scale-110 origin-top">
          {children}
        </div>
      </div>
    </div>
  );
}
