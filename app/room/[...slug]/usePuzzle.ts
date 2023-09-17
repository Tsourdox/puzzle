import type Puzzle from '@/puzzle/puzzle';
import { PexelsImage } from '@/utils/pexels';
import { preventDefaultEvents } from '@/utils/preventEvents';
import { Size, getPiecesCountFromSize } from '@/utils/sizes';
import { RefObject, WheelEvent, useEffect } from 'react';

type Props = {
  containerRef: RefObject<HTMLElement>;
  onReady: () => void;
  image: PexelsImage;
  size: Size;
};

export default function usePuzzle({ containerRef, onReady, image, size }: Props) {
  useEffect(() => {
    let puzzle: Puzzle;
    let scrollDelta = 0;

    (async () => {
      // NextJS SSR crashes when importing p5 - dynamic import solves it.
      const { default: p5 } = await import('p5');
      const { default: Puzzle } = await import('@/puzzle/puzzle');
      // window.p5 = p5;
      // require('p5/lib/addons/p5.sound');

      if (!containerRef.current) throw Error('Could not mount canvas');
      const { width, height } = containerRef.current.getBoundingClientRect();

      const sketch = (p: p5) => {
        p.setup = () => {
          preventDefaultEvents();
          p.createCanvas(width, height);
          p.frameRate(90);

          puzzle = new Puzzle(p);
          const xy = getPiecesCountFromSize(size);
          puzzle.generateNewPuzzle(image.src.large2x, xy, xy).then(() => {
            onReady();
            p.loop();
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
    })();
    return () => puzzle.releaseCanvas();
  }, [containerRef, onReady, image, size]);
}
