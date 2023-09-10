'use client';

import { useRef } from 'react';
import usePuzzle from './utils/usePuzzle';

export default function PuzzleCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  usePuzzle(containerRef);

  return <div ref={containerRef} className="relative flex-1" />;
}
