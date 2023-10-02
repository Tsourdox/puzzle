'use client';

import { Lang, getTranslation } from '@/language';
import { useStoreState } from '@/store/StoreProvider';
import { PexelsImage } from '@/utils/pexels';
import { useCallback, useRef, useState } from 'react';
import usePuzzle from '../usePuzzle';

type Props = {
  image: PexelsImage;
  roomCode: string;
  lang: Lang;
};

export default function PuzzleCanvas({ image, roomCode, lang }: Props) {
  const t = getTranslation(lang);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const onReady = useCallback(() => setIsLoading(false), []);
  const { size } = useStoreState();

  usePuzzle({ containerRef, onReady, image, size, roomCode });

  return (
    <div ref={containerRef} className="relative flex-1">
      {isLoading && (
        <div className="absolute uppercase z-20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse text-4xl text-transparent bg-clip-text bg-gradient-to-r from-neutral-50 to-neutral-400 text-center">
          {t('Preparing your puzzle')}
        </div>
      )}
    </div>
  );
}
