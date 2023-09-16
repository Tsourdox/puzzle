import type Puzzle from '@/puzzle/puzzle';
import { Size } from '@/utils/sizes';
import { RefObject, useEffect } from 'react';
import { globals } from './globals';

export default function usePuzzle(
  containerRef: RefObject<HTMLElement>,
  onReady: () => void,
) {
  useEffect(() => {
    let puzzle: Puzzle;

    (async () => {
      // NextJS SSR crashes when importing p5 - dynamic import solves it.
      const { default: p5 } = await import('p5');
      const { default: Puzzle } = await import('@/puzzle/puzzle');

      if (!containerRef.current) throw Error('Could not mount canvas');
      const { width, height } = containerRef.current.getBoundingClientRect();

      const sketch = (p: p5) => {
        function getPiecesCountFromSize(size: Size) {
          switch (size) {
            case 'xs':
              return 4;
            case 's':
              return 8;
            case 'm':
              return 12;
            case 'l':
              return 20;
            case 'xl':
              return 30;
          }
        }

        function getThemeFromCSS() {
          const rootStyle = getComputedStyle(document.documentElement);
          globals.theme = {
            primary: rootStyle.getPropertyValue('--primary'),
            darkened: rootStyle.getPropertyValue('--darkened'),
            neutral: rootStyle.getPropertyValue('--neutral'),
            background: rootStyle.getPropertyValue('--background'),
            backdrop: rootStyle.getPropertyValue('--backdrop'),
            darkdrop: rootStyle.getPropertyValue('--darkdrop'),
          };
        }

        function preventDefaultEvents() {
          // Prevent context menu when right clicking
          document.oncontextmenu = () => false;
          // Prenent magnifying glass
          document
            .querySelector('canvas')
            ?.addEventListener('touchstart', (e) => e.preventDefault());
        }

        // The sketch setup method
        p.setup = () => {
          p.createCanvas(width, height);
          p.frameRate(120);
          preventDefaultEvents();
          getThemeFromCSS();
          // setSoundVolumes();
          globals.isMobile = p.windowWidth < 600;

          puzzle = new Puzzle(p);
          const xy = getPiecesCountFromSize(globals.size);
          puzzle.generateNewPuzzle(globals.imageSrc, xy, xy).then(() => {
            onReady();
            p.loop();
          });
          p.noLoop();
        };

        // The sketch draw method
        p.draw = () => {
          puzzle.update();
          puzzle.draw();
          globals.scrollDelta = 0;
        };

        p.windowResized = () => {
          const { width, height } =
            containerRef.current!.getBoundingClientRect();
          globals.isMobile = p.windowWidth < 600;
          p.resizeCanvas(width, height);
        };

        p.mouseWheel = (event: any) => {
          globals.scrollDelta = event.delta;
          return false;
        };
      };

      new p5(sketch, containerRef.current);
      document.body.style.overflow = 'hidden';
    })();
    return () => {
      document.body.style.overflow = 'unset';
      puzzle.releaseCanvas();
    };
  }, [containerRef, onReady]);
}
