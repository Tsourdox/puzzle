import { settingsAtom, showPuzzlePieceActionsAtom } from '@/app/atoms';
import Puzzle from '@/puzzle/puzzle';
import { isMouseOverCanvas } from '@/puzzle/utils/general';
import { settings } from '@/puzzle/utils/settings';
import { PexelsImage } from '@/utils/pexels';
import { preventDefaultEvents } from '@/utils/preventEvents';
import { Size } from '@/utils/sizes';
import { useAtomValue, useSetAtom } from 'jotai';
import p5 from 'p5';
import { RefObject, WheelEvent, useEffect, useRef } from 'react';

type Props = {
  containerRef: RefObject<HTMLElement | null>;
  onReady: () => void;
  image: PexelsImage;
  size: Size;
  roomCode: string;
};

export interface PuzzleActions {
  zoomIn: () => void;
  zoomOut: () => void;
  rotateLeft: () => void;
  rotateRight: () => void;
  stackPieces: () => void;
  explodePieces: () => void;
  reconnectPieces: () => void;
  deselectAll: () => void;
}

export default function usePuzzle({ containerRef, onReady, image, size, roomCode }: Props) {
  const setShowPuzzlePieceActions = useSetAtom(showPuzzlePieceActionsAtom);
  const reactSettings = useAtomValue(settingsAtom);
  const puzzleRef = useRef<Puzzle | null>(null);
  const actionsRef = useRef<PuzzleActions>({
    zoomIn: () => puzzleRef.current?.zoomIn(),
    zoomOut: () => puzzleRef.current?.zoomOut(),
    rotateLeft: () => puzzleRef.current?.rotateLeft(),
    rotateRight: () => puzzleRef.current?.rotateRight(),
    stackPieces: () => puzzleRef.current?.stackPieces(),
    explodePieces: () => puzzleRef.current?.explodePieces(),
    reconnectPieces: () => puzzleRef.current?.reconnectPieces(),
    deselectAll: () => puzzleRef.current?.deselectAll(),
  });

  // Sync React settings to global puzzle settings object
  useEffect(() => {
    Object.assign(settings, reactSettings);
  }, [reactSettings]);

  // useEffect(() => {
  //   document.body.classList.add('overflow-hidden');
  //   return () => document.body.classList.remove('overflow-hidden');
  // }, []);

  useEffect(() => {
    let puzzle: Puzzle;
    let scrollDelta = 0;

    // window.p5 = p5;
    // require('p5/lib/addons/p5.sound');

    if (!containerRef.current) throw Error('Could not mount canvas');
    const { width, height } = containerRef.current.getBoundingClientRect();

    const sketch = (p: p5) => {
      p.setup = () => {
        preventDefaultEvents();
        p.createCanvas(width, height);
        p.frameRate(90);

        puzzle = new Puzzle(p, size, image, roomCode, setShowPuzzlePieceActions);
        puzzleRef.current = puzzle;
        puzzle.tryLoadPuzzle().then((successfullyLoaded) => {
          if (successfullyLoaded) {
            onReady();
            p.loop();
          } else {
            puzzle.generateNewPuzzle().then(() => {
              onReady();
              p.loop();
            });
          }
        });

        p.noLoop();
      };

      p.draw = () => {
        puzzle.update(scrollDelta);
        puzzle.draw();
        scrollDelta = 0;
      };

      p.windowResized = () => {
        const { width, height } = containerRef.current!.getBoundingClientRect();
        p.resizeCanvas(width, height);
      };

      p.mouseWheel = (event: WheelEvent & { delta: number }) => {
        if (isMouseOverCanvas(p)) {
          scrollDelta = event.delta;
          return false;
        }

        return true;
      };
    };

    new p5(sketch, containerRef.current);

    return () => {
      puzzle?.cleanup();
      puzzleRef.current = null;
    };
  }, [containerRef, onReady, image, size, roomCode, setShowPuzzlePieceActions]);

  return actionsRef.current;
}
