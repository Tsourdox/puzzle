import ToastContainer from '@/components/ToastContainer';
import { getTranslation } from '@/language';
import { Provider as JotaiProvider } from 'jotai';
import HomePage from './home/HomePage';
import { PathnameContext } from './navigation';
import type { Page } from './pages';
import RoomPage from './room/RoomPage';

type Props = {
  page: Page;
  pathname: string;
};

export default function App({ page, pathname }: Props) {
  return (
    <JotaiProvider>
      <PathnameContext value={pathname}>
        {page.name === 'home' && <HomePage {...page} />}
        {page.name === 'room' && <RoomPage {...page} />}
        {page.name === 'notFound' && <NotFound {...page} />}
        <ToastContainer />
      </PathnameContext>
    </JotaiProvider>
  );
}

function NotFound({ lang }: { lang: Page['lang'] }) {
  const t = getTranslation(lang);
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-6xl text-purple-400">404</h1>
      <a href={`/${lang}`} className="text-xl text-zinc-300 underline font-sans">
        {t('Go Home')}
      </a>
    </div>
  );
}
