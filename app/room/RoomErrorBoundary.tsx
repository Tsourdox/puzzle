import Button from '@/components/Button';
import { getTranslation, Lang } from '@/language';
import { Component, ReactNode } from 'react';

type Props = { lang: Lang; children: ReactNode };
type State = { error?: Error };

export default class RoomErrorBoundary extends Component<Props, State> {
  state: State = {};

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('Room error:', error);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const { lang } = this.props;
    const t = getTranslation(lang);

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-6">
        <div className="flex flex-col items-center gap-4 max-w-2xl">
          <h1 className="text-4xl font-bold text-purple-400">{t('Oops! Something went wrong')}</h1>
          <p className="text-xl text-zinc-300 text-center">
            {t(
              "The puzzle encountered an unexpected error. Don't worry, your progress should be saved locally.",
            )}
          </p>
          <details className="mt-4 p-4 bg-zinc-800/50 rounded border border-zinc-700 w-full">
            <summary className="cursor-pointer text-zinc-400 hover:text-zinc-300">
              {t('Technical details')}
            </summary>
            <pre className="mt-2 text-sm text-red-400 overflow-auto">{error.toString()}</pre>
          </details>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => window.location.reload()} variant="primary">
            {t('Reload Page')}
          </Button>
          <Button onClick={() => (window.location.href = `/${lang}`)} variant="secondary">
            {t('Go Home')}
          </Button>
        </div>
      </div>
    );
  }
}
