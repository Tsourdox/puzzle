import { useStoreState } from '@/store/StoreProvider';
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
  const { size } = useStoreState();
  usePuzzle({ containerRef, onReady, image, size, roomCode });
  return null;
}
