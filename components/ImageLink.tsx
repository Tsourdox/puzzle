'use client';

import { TrashIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Button from './Button';

interface Props {
  imageSrc: string;
  canBeDeleted?: boolean;
}

export default function ImageLink({ imageSrc, canBeDeleted }: Props) {
  const [isActive, setIsActive] = useState(false);
  const [size, setSize] = useState('S');

  return (
    <div
      className="w-80 relative aspect-square flex-none rounded-3xl overflow-hidden"
      onPointerEnter={() => setIsActive(true)}
      onPointerLeave={() => setIsActive(false)}
    >
      <Image
        src={imageSrc}
        alt=""
        width={300}
        height={300}
        className="w-full h-full object-cover"
      />
      {isActive && (
        <div className="absolute top-0 left-0 w-full h-full backdrop-blur-sm bg-black/10 flex flex-col justify-center items-center gap-4">
          {canBeDeleted && (
            <TrashIcon
              width={20}
              height={20}
              className="absolute top-6 right-6 cursor-pointer drop-shadow-lg"
            />
          )}
          <h2 className="text-xl drop-shadow-lg">Välj storlek</h2>
          <section className="flex gap-2">
            <div
              className={twMerge(
                'rounded-full backdrop-blur-lg px-3 py-1 cursor-pointer bg-neutral-500/20 active:bg-purple-900/50 hover:bg-purple-800/40',
                size === 'XS' && 'bg-purple-800/60',
              )}
              onClick={() => setSize('XS')}
            >
              XS
            </div>
            <div
              className={twMerge(
                'rounded-full backdrop-blur-lg px-3 py-1 cursor-pointer bg-neutral-500/20 active:bg-purple-900/50 hover:bg-purple-800/40',
                size === 'S' && 'bg-purple-800/60',
              )}
              onClick={() => setSize('S')}
            >
              S
            </div>
            <div
              className={twMerge(
                'rounded-full backdrop-blur-lg px-3 py-1 cursor-pointer bg-neutral-500/20 active:bg-purple-900/50 hover:bg-purple-800/40',
                size === 'M' && 'bg-purple-800/60',
              )}
              onClick={() => setSize('M')}
            >
              M
            </div>
            <div
              className={twMerge(
                'rounded-full backdrop-blur-lg px-3 py-1 cursor-pointer bg-neutral-500/20 active:bg-purple-900/50 hover:bg-purple-800/40',
                size === 'LG' && 'bg-purple-800/60',
              )}
              onClick={() => setSize('LG')}
            >
              L
            </div>
            <div
              className={twMerge(
                'rounded-full backdrop-blur-lg px-3 py-1 cursor-pointer bg-neutral-500/20 active:bg-purple-900/50 hover:bg-purple-800/40',
                size === 'XL' && 'bg-purple-800/60',
              )}
              onClick={() => setSize('XL')}
            >
              XL
            </div>
          </section>
          <Link href={'room/' + Math.random().toString().slice(4, 8)}>
            <Button>Börja Pussla</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
