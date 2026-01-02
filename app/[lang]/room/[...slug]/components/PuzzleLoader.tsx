import { sizeAtom } from '@/app/atoms';
import { Lang } from '@/language';
import { PexelsImage } from '@/utils/pexels';
import { useAtomValue } from 'jotai';
import { RefObject } from 'react';
import usePuzzle from '../usePuzzle';

type Props = {
  image: PexelsImage;
  roomCode: string;
  onReady: () => void;
  containerRef: RefObject<HTMLDivElement | null>;
  lang: Lang;
};

/**
 * Wrapper component for usePuzzle hook.
 * Must be dynamically imported with ssr: false to prevent P5.js from running on the server.
 */
export default function PuzzleLoader({ image, roomCode, onReady, containerRef, lang }: Props) {
  const size = useAtomValue(sizeAtom);
  usePuzzle({ containerRef, onReady, image, size, roomCode, lang });
  return null;
}
