import {
  addToastAtom,
  puzzleControlsAtom,
  settingsAtom,
  showPuzzlePieceControlsAtom,
} from '@/app/atoms';
import { Lang, getTranslation } from '@/language';
import Puzzle from '@/puzzle/puzzle';
import { isMouseOverCanvas } from '@/puzzle/utils/general';
import { PexelsImage } from '@/utils/pexels';
import { preventDefaultEvents } from '@/utils/preventEvents';
import { Size } from '@/utils/sizes';
import { useAtomValue, useSetAtom } from 'jotai';
import { usePathname, useRouter } from 'next/navigation';
import p5 from 'p5';
import { RefObject, WheelEvent, useEffect, useRef } from 'react';

const fpsModes = {
  battery: 30,
  balance: 60,
  performance: 90,
} as const;

type Props = {
  containerRef: RefObject<HTMLElement | null>;
  onReady: () => void;
  image: PexelsImage;
  size: Size;
  roomCode: string;
  lang: Lang;
};

export default function usePuzzle({ containerRef, onReady, image, size, roomCode, lang }: Props) {
  const setShowPuzzlePieceControls = useSetAtom(showPuzzlePieceControlsAtom);
  const setPuzzleControls = useSetAtom(puzzleControlsAtom);
  const addToast = useSetAtom(addToastAtom);
  const settings = useAtomValue(settingsAtom);
  const router = useRouter();
  const pathname = usePathname();
  const puzzleRef = useRef<Puzzle | null>(null);

  useEffect(() => {
    if (puzzleRef.current) {
      const { updateSettings, p } = puzzleRef.current;
      updateSettings(settings);
      p.frameRate(fpsModes[settings.puzzle.fpsMode]);
    }
  }, [settings]);

  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => document.body.classList.remove('overflow-hidden');
  }, []);

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
        p.frameRate(fpsModes[settings.puzzle.fpsMode]);

        // Callback for when another player changes the puzzle image
        const handleImageChange = (newImageId: number | string) => {
          // Stop the draw loop immediately to freeze the puzzle and prevent piece snapping
          p.noLoop();

          // Navigate to the new image URL using Next.js router (smooth client-side transition)
          const pathParts = pathname.split('/');
          if (pathParts.length === 4) {
            // Format: /[lang]/room/[code] - add image ID
            router.push(`${pathname}/${newImageId}`);
          } else {
            // Format: /[lang]/room/[code]/[oldImageId] - replace image ID
            pathParts[pathParts.length - 1] = String(newImageId);
            router.push(pathParts.join('/'));
          }
        };

        puzzle = new Puzzle(
          p,
          size,
          image,
          roomCode,
          settings,
          setShowPuzzlePieceControls,
          handleImageChange,
        );
        puzzleRef.current = puzzle;
        setPuzzleControls(puzzle);
        puzzle
          .tryLoadPuzzle()
          .then((successfullyLoaded) => {
            if (successfullyLoaded) {
              onReady();
              p.loop();
            } else {
              return puzzle.generateNewPuzzle().then(() => {
                onReady();
                p.loop();
              });
            }
          })
          .catch((error) => {
            console.error('Failed to initialize puzzle:', error);
            const t = getTranslation(lang);
            addToast({
              message: `${t('Failed to load puzzle')}. ${t('Please try resetting the database or using a different image')}.`,
              type: 'error',
            });
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
      setPuzzleControls(null);
    };
  }, [containerRef, onReady, image, size, roomCode, setShowPuzzlePieceControls, setPuzzleControls]);
}
