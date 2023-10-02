import Puzzle from '@/puzzle/puzzle';
import { PexelsImage } from '@/utils/pexels';
import { preventDefaultEvents } from '@/utils/preventEvents';
import { Size } from '@/utils/sizes';
import p5 from 'p5';
import { RefObject, WheelEvent, useEffect } from 'react';

type Props = {
  containerRef: RefObject<HTMLElement>;
  onReady: () => void;
  image: PexelsImage;
  size: Size;
  roomCode: string;
};

export default function usePuzzle({ containerRef, onReady, image, size, roomCode }: Props) {
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

    const sketch = (p: any) => {
      p.setup = () => {
        preventDefaultEvents();
        p.createCanvas(width, height);
        p.frameRate(90);

        puzzle = new Puzzle(p, size, image, roomCode);
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
        scrollDelta = event.delta;
        return false;
      };
    };

    new p5(sketch, containerRef.current);

    return () => puzzle?.cleanup();
  }, [containerRef, onReady, image, size, roomCode]);
}
