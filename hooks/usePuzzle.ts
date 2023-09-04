import P5 from 'p5';
import { RefObject, useEffect } from 'react';

export default function usePuzzle(containerRef: RefObject<HTMLElement>) {
  useEffect(() => {
    if (!containerRef.current) throw Error('Could not mount canvas');
    const { width, height } = containerRef.current.getBoundingClientRect();

    const sketch = (p: P5) => {
      // The sketch setup method
      p.setup = () => {
        p.createCanvas(width, height);
      };

      // The sketch draw method
      p.draw = () => {
        const offset = 10;
        const size = 200;
        p.rect(offset, offset, size, size);
        p.rect(p.width - offset - size, p.height - offset - size, size, size);
        p.fill('orange');
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
