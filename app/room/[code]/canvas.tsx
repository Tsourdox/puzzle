'use client';

import { useCallback, useRef, useState } from 'react';
import { globals } from './utils/globals';
import usePuzzle from './utils/usePuzzle';

export default function PuzzleCanvas() {
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleReady = useCallback(() => setIsLoading(false), []);
  usePuzzle(containerRef, handleReady);

  return (
    <div
      className="relative flex flex-col flex-1 bg-cover"
      style={{ backgroundImage: `url('${globals.imageSmallSrc}')` }}
    >
      <div
        ref={containerRef}
        className="relative flex-1 backdrop-blur-3xl bg-neutral-800/70"
      />
      {isLoading && (
        <div className="absolute z-20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse text-4xl text-transparent bg-clip-text bg-gradient-to-r from-neutral-50 to-neutral-400">
          Skapar ditt pussel
        </div>
      )}
    </div>
  );
}
