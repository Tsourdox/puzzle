'use client';

import Button from '@/components/Button';
import { getTranslation, Lang } from '@/language';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const lang = (params.lang as Lang) || 'en';
  const t = getTranslation(lang);

  useEffect(() => {
    console.error('Room error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-6">
      <div className="flex flex-col items-center gap-4 max-w-2xl">
        <h1 className="text-4xl font-bold text-purple-400">
          {t('Oops! Something went wrong')}
        </h1>
        <p className="text-xl text-zinc-300 text-center">
          {t(
            "The puzzle encountered an unexpected error. Don't worry, your progress should be saved locally.",
          )}
        </p>
        {error && (
          <details className="mt-4 p-4 bg-zinc-800/50 rounded border border-zinc-700 w-full">
            <summary className="cursor-pointer text-zinc-400 hover:text-zinc-300">
              {t('Technical details')}
            </summary>
            <pre className="mt-2 text-sm text-red-400 overflow-auto">{error.toString()}</pre>
          </details>
        )}
      </div>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="primary">
          {t('Reload Page')}
        </Button>
        <Button onClick={() => (window.location.href = `/${lang}`)} variant="secondary">
          {t('Go Home')}
        </Button>
      </div>
    </div>
  );
}
