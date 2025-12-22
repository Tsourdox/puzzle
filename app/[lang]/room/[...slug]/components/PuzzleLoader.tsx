import { useAtomValue } from 'jotai';
import { sizeAtom } from '@/app/atoms';
import { PexelsImage } from '@/utils/pexels';
import { RefObject } from 'react';
import usePuzzle from '../usePuzzle';

type Props = {
  image: PexelsImage;
  roomCode: string;
  onReady: () => void;
  containerRef: RefObject<HTMLDivElement | null>;
};

export default function PuzzleLoader({ image, roomCode, onReady, containerRef }: Props) {
  const size = useAtomValue(sizeAtom);
  usePuzzle({ containerRef, onReady, image, size, roomCode });
  return null;
}
