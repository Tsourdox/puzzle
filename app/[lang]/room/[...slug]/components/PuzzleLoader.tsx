import { useAtomValue, useSetAtom } from 'jotai';
import { sizeAtom, puzzleActionsAtom } from '@/app/atoms';
import { PexelsImage } from '@/utils/pexels';
import { RefObject, useEffect } from 'react';
import usePuzzle from '../usePuzzle';

type Props = {
  image: PexelsImage;
  roomCode: string;
  onReady: () => void;
  containerRef: RefObject<HTMLDivElement | null>;
};

export default function PuzzleLoader({ image, roomCode, onReady, containerRef }: Props) {
  const size = useAtomValue(sizeAtom);
  const setPuzzleActions = useSetAtom(puzzleActionsAtom);
  const actions = usePuzzle({ containerRef, onReady, image, size, roomCode });

  useEffect(() => {
    setPuzzleActions(actions);
    return () => setPuzzleActions(null);
  }, [actions, setPuzzleActions]);

  return null;
}
