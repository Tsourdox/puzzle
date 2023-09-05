'use client';

import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import Button from './Button';

interface Props {
  imageSrc: string;
}

export default function ImageLink({ imageSrc }: Props) {
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
          <section className="flex gap-2">
            <div
              className={clsx(
                'rounded-full px-3 py-1 cursor-pointer active:bg-purple-900 hover:bg-purple-800',
                size === 'XS' ? 'bg-purple-950' : 'bg-neutral-500',
              )}
              onClick={() => setSize('XS')}
            >
              XS
            </div>
            <div
              className={clsx(
                'rounded-full px-3 py-1 cursor-pointer active:bg-purple-900 hover:bg-purple-800',
                size === 'S' ? 'bg-purple-950' : 'bg-neutral-500',
              )}
              onClick={() => setSize('S')}
            >
              S
            </div>
            <div
              className={clsx(
                'rounded-full px-3 py-1 cursor-pointer active:bg-purple-900 hover:bg-purple-800',
                size === 'M' ? 'bg-purple-950' : 'bg-neutral-500',
              )}
              onClick={() => setSize('M')}
            >
              M
            </div>
            <div
              className={clsx(
                'rounded-full px-3 py-1 cursor-pointer active:bg-purple-900 hover:bg-purple-800',
                size === 'LG' ? 'bg-purple-950' : 'bg-neutral-500',
              )}
              onClick={() => setSize('LG')}
            >
              LG
            </div>
            <div
              className={clsx(
                'rounded-full px-3 py-1 cursor-pointer active:bg-purple-900 hover:bg-purple-800',
                size === 'XL' ? 'bg-purple-950' : 'bg-neutral-500',
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
