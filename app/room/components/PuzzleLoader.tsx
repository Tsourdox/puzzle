import { Lang } from '@/language';
import { PexelsImage } from '@/utils/pexelsImage';
import { Size } from '@/utils/sizes';
import { RefObject } from 'react';
import usePuzzle from '../usePuzzle';

type Props = {
  image: PexelsImage;
  roomCode: string;
  size: Size;
  onReady: () => void;
  containerRef: RefObject<HTMLDivElement | null>;
  lang: Lang;
};

/** Wrapper for the usePuzzle hook, so p5 is only loaded in the browser (see PuzzleCanvas) */
export default function PuzzleLoader({
  image,
  roomCode,
  size,
  onReady,
  containerRef,
  lang,
}: Props) {
  usePuzzle({ containerRef, onReady, image, size, roomCode, lang });
  return null;
}
