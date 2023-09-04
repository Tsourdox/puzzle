'use client';

import usePuzzle from '@/hooks/usePuzzle';
import { useRef } from 'react';

export default function PuzzleCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  usePuzzle(containerRef);

  return <div ref={containerRef} className="relative flex-1" />;
}
