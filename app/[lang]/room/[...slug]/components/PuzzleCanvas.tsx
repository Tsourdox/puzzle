'use client';

import { Lang, getTranslation } from '@/language';
import { PexelsImage } from '@/utils/pexels';
import dynamic from 'next/dynamic';
import { useCallback, useRef, useState } from 'react';

type Props = {
  image: PexelsImage;
  roomCode: string;
  lang: Lang;
};

const PuzzleLoader = dynamic(() => import('./PuzzleLoader'), { ssr: false });

export default function PuzzleCanvas({ image, roomCode, lang }: Props) {
  const t = getTranslation(lang);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const onReady = useCallback(() => setIsLoading(false), []);

  return (
    <div ref={containerRef} className="relative flex-1">
      <PuzzleLoader
        image={image}
        roomCode={roomCode}
        onReady={onReady}
        containerRef={containerRef}
      />
      {isLoading && (
        <div className="absolute uppercase z-20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse text-4xl text-transparent bg-clip-text bg-gradient-to-r from-neutral-50 to-neutral-400 text-center">
          {t('Preparing your puzzle')}
        </div>
      )}
    </div>
  );
}
