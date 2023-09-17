import { PexelsImage } from '@/utils/pexels';
import { Size, sizes } from '@/utils/sizes';
import { TrashIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import StartPuzzleButton from './StartPuzzleButton';

interface Props {
  image: PexelsImage;
  canBeDeleted?: boolean;
  size: Size;
}

export default function ImageCard({ image, canBeDeleted, size }: Props) {
  return (
    <div className="group w-56 md:w-80 relative aspect-square flex-none rounded-3xl overflow-hidden">
      <Image
        src={image.src.medium}
        alt=""
        width={300}
        height={300}
        className="w-full h-full object-cover"
      />

      <div className="absolute invisible group-hover:visible top-0 left-0 w-full h-full backdrop-blur-sm bg-black/10 flex flex-col justify-center items-center gap-4">
        {canBeDeleted && (
          <TrashIcon
            width={20}
            height={20}
            className="absolute top-6 right-6 cursor-pointer drop-shadow-lg"
          />
        )}
        <h2 className="text-xl drop-shadow-lg">Välj storlek</h2>
        <section className="flex gap-1 md:gap-2">
          {sizes.map((sizeLabel) => (
            <Link
              replace
              href={{ search: `?size=${sizeLabel}` }}
              scroll={false}
              key={sizeLabel}
              className={twMerge(
                'rounded-full backdrop-blur-lg uppercase px-2 md:px-3 md:py-1 cursor-pointer bg-neutral-500/20 active:bg-purple-900/50 hover:bg-purple-800/40',
                size === sizeLabel && 'bg-purple-800/60',
              )}
            >
              {sizeLabel}
            </Link>
          ))}
        </section>
        <StartPuzzleButton size={size} image={image}>
          Börja Pussla
        </StartPuzzleButton>
      </div>
    </div>
  );
}
