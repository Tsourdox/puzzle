'use client';

import { useRef } from 'react';
import { globals } from './utils/globals';
import usePuzzle from './utils/usePuzzle';

export default function PuzzleCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  usePuzzle(containerRef);

  return (
    <div
      className="flex flex-col flex-1 bg-cover"
      style={{ backgroundImage: `url('${globals.imageSrc}')` }}
    >
      <div
        ref={containerRef}
        className="relative flex-1 backdrop-blur-3xl bg-neutral-800/70"
      />
    </div>
  );
}
