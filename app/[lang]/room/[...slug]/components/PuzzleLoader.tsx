import { puzzleActionsAtom, sizeAtom } from '@/app/atoms';
import { Lang } from '@/language';
import { PexelsImage } from '@/utils/pexels';
import { useAtomValue, useSetAtom } from 'jotai';
import { RefObject, useEffect } from 'react';
import usePuzzle from '../usePuzzle';

type Props = {
  image: PexelsImage;
  roomCode: string;
  onReady: () => void;
  containerRef: RefObject<HTMLDivElement | null>;
  lang: Lang;
};

export default function PuzzleLoader({ image, roomCode, onReady, containerRef, lang }: Props) {
  const size = useAtomValue(sizeAtom);
  const setPuzzleActions = useSetAtom(puzzleActionsAtom);
  const actions = usePuzzle({ containerRef, onReady, image, size, roomCode, lang });

  useEffect(() => {
    setPuzzleActions(actions);
    return () => setPuzzleActions(null);
  }, [actions, setPuzzleActions]);

  return null;
}
