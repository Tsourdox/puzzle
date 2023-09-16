'use client';
import { Size } from '@/utils/sizes';
import { useRouter } from 'next/navigation';
import Button from '../../components/Button';
import { globals } from '../room/[code]/utils/globals';
import { PexelsImage } from './SlideshowRow';

interface Props {
  size: Size;
  image: PexelsImage;
}

export default function StartPuzzleButton({ size, image }: Props) {
  const router = useRouter();
  const randomRoom = Math.random().toString().slice(4, 8);

  const startPuzzle = () => {
    globals.imageSrc = image.src.large2x;
    globals.imageSmallSrc = image.src.medium;
    globals.size = size;
    router.push(`/room/${randomRoom}?size=${size}`);
  };

  return (
    <Button className="text-sm md:text-base" onClick={startPuzzle}>
      Börja Pussla
    </Button>
  );
}
