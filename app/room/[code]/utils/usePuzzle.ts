import P5 from 'p5';
// import 'p5/lib/addons/p5.sound';
import { RefObject, useEffect } from 'react';
import Puzzle from '../puzzle/puzzle';
import { globals } from './globals';

export default function usePuzzle(containerRef: RefObject<HTMLElement>) {
  useEffect(() => {
    if (!containerRef.current) throw Error('Could not mount canvas');
    const { width, height } = containerRef.current.getBoundingClientRect();

    const sketch = (canvas: P5) => {
      let puzzle: Puzzle;

      function setSoundVolumes() {
        sounds.snaps[0].setVolume(0.8);
        sounds.snaps[1].setVolume(0.1);
        sounds.snaps[2].setVolume(0.5);
        sounds.snaps[3].setVolume(0.1);
        sounds.aboutToPuzzelin.setVolume(0.5);
        sounds.puzzelin.setVolume(0.5);
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

      canvas.preload = () => {
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
          primary: canvas.loadFont('/fonts/black-ops-one.ttf'),
          icons: canvas.loadFont('/fonts/font-awesome.otf'),
        };
      };

      // The sketch setup method
      canvas.setup = () => {
        canvas.createCanvas(width, height);
        canvas.frameRate(120);
        preventDefaultEvents();
        getThemeFromCSS();
        // setSoundVolumes();
        globals.isMobile = canvas.windowWidth < 600;

        puzzle = new Puzzle(canvas);
      };

      // The sketch draw method
      canvas.draw = () => {
        // if (window.innerWidth !== width || window.innerHeight !== height) {
        //   setFullScreenCanvas();
        //   isMobile = windowWidth < 600;
        // }
        puzzle.update();
        puzzle.draw();
        // scrollDelta = 0;
      };

      canvas.windowResized = () => {
        const { width, height } = containerRef.current!.getBoundingClientRect();
        canvas.resizeCanvas(width, height);
      };
    };

    const canvas = new P5(sketch, containerRef.current);
    return () => canvas.remove();
  }, [containerRef]);
}
