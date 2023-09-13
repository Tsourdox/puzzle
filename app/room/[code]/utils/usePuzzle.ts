import P5 from 'p5';
// import 'p5/lib/addons/p5.sound';
import { RefObject, useEffect } from 'react';
import Puzzle from '../../../../puzzle/puzzle';
import { globals } from './globals';

export default function usePuzzle(
  containerRef: RefObject<HTMLElement>,
  onReady: () => void,
) {
  useEffect(() => {
    if (!containerRef.current) throw Error('Could not mount canvas');
    const { width, height } = containerRef.current.getBoundingClientRect();

    const sketch = (p: P5) => {
      let puzzle: Puzzle;

      function setSoundVolumes() {
        globals.sounds.snaps[0].setVolume(0.8);
        globals.sounds.snaps[1].setVolume(0.1);
        globals.sounds.snaps[2].setVolume(0.5);
        globals.sounds.snaps[3].setVolume(0.1);
        globals.sounds.aboutToPuzzelin.setVolume(0.5);
        globals.sounds.puzzelin.setVolume(0.5);
      }

      function getPiecesCountFromSize(size: string) {
        switch (size) {
          case 'XS':
            return 4;
          case 'S':
            return 8;
          case 'M':
            return 12;
          case 'L':
            return 20;
          case 'XL':
          default:
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

      p.preload = () => {
        // music = {
        //   dreaming: p.loadSound('../assets/music/dreaming-big.mp3'),
        //   love: p.loadSound('../assets/music/love-in-the-air.mp3'),
        //   journey: p.loadSound('../assets/music/the-journey.mp3'),
        // };
        // sounds = {
        //   snaps: [
        //     p.loadSound('../assets/sounds/snap/snap0.wav'),
        //     p.loadSound('../assets/sounds/snap/snap1.wav'),
        //     p.loadSound('../assets/sounds/snap/snap2.wav'),
        //     p.loadSound('../assets/sounds/snap/snap3.wav'),
        //   ],
        //   aboutToPuzzelin: p.loadSound(
        //     '../assets/sounds/about-to-puzzelin.m4a',
        //   ),
        //   puzzelin: p.loadSound('../assets/sounds/puzzelin.m4a'),
        // };
        globals.fonts = {
          primary: p.loadFont('/fonts/black-ops-one.ttf'),
          icons: p.loadFont('/fonts/font-awesome.otf'),
        };
      };

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
        });
      };

      // The sketch draw method
      p.draw = () => {
        puzzle.update();
        puzzle.draw();
        globals.scrollDelta = 0;
      };

      p.windowResized = () => {
        const { width, height } = containerRef.current!.getBoundingClientRect();
        globals.isMobile = p.windowWidth < 600;
        p.resizeCanvas(width, height);
      };

      p.mouseWheel = (event: any) => {
        globals.scrollDelta = event.delta;
        return false;
      };
    };

    const canvas = new P5(sketch, containerRef.current);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
      canvas.remove();
    };
  }, [containerRef, onReady]);
}
