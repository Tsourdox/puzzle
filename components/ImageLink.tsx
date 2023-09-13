'use client';

import { globals } from '@/app/room/[code]/utils/globals';
import { TrashIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Button from './Button';

interface Props {
  src: string;
  srcHiRes: string;
  canBeDeleted?: boolean;
}

export default function ImageLink({ src, srcHiRes, canBeDeleted }: Props) {
  const [isActive, setIsActive] = useState(false);
  const [size, setSize] = useState('S');
  const randomRoom = Math.random().toString().slice(4, 8);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  useEffect(() => {
    globals.size = size;
  }, [size]);

  return (
    <div
      className="w-56 md:w-80 relative aspect-square flex-none rounded-3xl overflow-hidden"
      onPointerEnter={() => setIsActive(true)}
      onPointerLeave={() => setIsActive(false)}
    >
      <Image
        src={src}
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
          <section className="flex gap-1 md:gap-2">
            {['XS', 'S', 'M', 'L', 'XL'].map((sizeLabel) => (
              <div
                key={sizeLabel}
                className={twMerge(
                  'rounded-full backdrop-blur-lg px-2 md:px-3 md:py-1 cursor-pointer bg-neutral-500/20 active:bg-purple-900/50 hover:bg-purple-800/40',
                  size === sizeLabel && 'bg-purple-800/60',
                )}
                onClick={() => {
                  history.replaceState(
                    { ...history.state },
                    '',
                    pathname + '?' + createQueryString('size', sizeLabel),
                  );
                  setSize(sizeLabel);
                  // router.push('', { scroll: false });
                }}
              >
                {sizeLabel}
              </div>
            ))}
          </section>
          <Link
            href={{
              pathname: `room/${randomRoom}`,
              query: searchParams.toString(),
            }}
            onClick={() => {
              globals.imageSrc = srcHiRes;
              globals.imageSmallSrc = src;
            }}
          >
            <Button className="text-sm md:text-base">Börja Pussla</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
