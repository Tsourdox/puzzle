import P5 from 'p5';
// import 'p5/lib/addons/p5.sound';
import { RefObject, useEffect } from 'react';
import { globals } from './globals';
import Puzzle from './puzzle/puzzle';

export default function usePuzzle(containerRef: RefObject<HTMLElement>) {
  useEffect(() => {
    if (!containerRef.current) throw Error('Could not mount canvas');
    const { width, height } = containerRef.current.getBoundingClientRect();

    const sketch = (p: P5) => {
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

        // puzzle = new Puzzle(p);
      };

      // The sketch draw method
      p.draw = () => {
        const offset = 10;
        const size = 200;
        p.fill('blue');
        p.rect(offset, offset, size, size);
        p.rect(p.width - offset - size, p.height - offset - size, size, size);

        if (p.mouseIsPressed) {
          p.fill('orange');
          p.circle(p.mouseX, p.mouseY, 30);
        }
        // if (window.innerWidth !== width || window.innerHeight !== height) {
        //   setFullScreenCanvas();
        //   isMobile = windowWidth < 600;
        // }
        // puzzle.update();
        // puzzle.draw();
        // scrollDelta = 0;
      };

      p.windowResized = () => {
        const { width, height } = containerRef.current!.getBoundingClientRect();
        console.log({ width, height });
        p.resizeCanvas(width, height);
      };
    };

    const p5 = new P5(sketch, containerRef.current);
    return () => p5.remove();
  }, [containerRef]);
}
