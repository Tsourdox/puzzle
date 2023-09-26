import { PexelsImage } from '@/utils/pexels';
import { Size, sizes } from '@/utils/sizes';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import ImageCardContainer from './ImageCardContainer';
import StartPuzzleButton from './StartPuzzleButton';

interface Props {
  image: PexelsImage;
  size: Size;
}

export default function CardContentNewPuzzle({ image, size }: Props) {
  return (
    <ImageCardContainer image={image}>
      <h2 className="text-xl drop-shadow-lg">Välj storlek</h2>
      <section className="flex gap-1 md:gap-2">
        {sizes.map((sizeLabel) => (
          <Link
            shallow
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
    </ImageCardContainer>
  );
}
