import { Lang, getTranslation } from '@/language';
import { PexelsImage } from '@/utils/pexelsImage';
import { Size } from '@/utils/sizes';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';

type Props = {
  image: PexelsImage;
  roomCode: string;
  lang: Lang;
  size: Size;
};

// p5 only runs in the browser, so it's loaded after hydration
const PuzzleLoader = lazy(() => import('./PuzzleLoader'));

export default function PuzzleCanvas({ image, roomCode, lang, size }: Props) {
  const t = getTranslation(lang);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const onReady = useCallback(() => setIsLoading(false), []);

  useEffect(() => setIsMounted(true), []);

  return (
    <div ref={containerRef} className="relative flex-1">
      {isMounted && (
        <Suspense>
          <PuzzleLoader
            image={image}
            roomCode={roomCode}
            size={size}
            onReady={onReady}
            containerRef={containerRef}
            lang={lang}
          />
        </Suspense>
      )}
      {isLoading && (
        <div className="absolute uppercase z-20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse text-4xl text-transparent bg-clip-text bg-linear-to-r from-zinc-50 to-zinc-400 text-center">
          {t('Preparing your puzzle')}
        </div>
      )}
    </div>
  );
}
