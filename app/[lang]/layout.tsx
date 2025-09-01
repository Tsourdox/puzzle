import { getLangs, getTranslation, Lang } from '@/language';
import StoreProvider from '@/store/StoreProvider';
import { PropsWithLangParam } from '@/utils/general';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { twMerge } from 'tailwind-merge';
import './globals.css';

const myFont = localFont({
  src: '../../public/fonts/black-ops-one.ttf',
  variable: '--font-primary',
});

export async function generateMetadata({ params }: PropsWithLangParam): Promise<Metadata> {
  const { lang } = await params;
  const t = getTranslation(lang as Lang);
  return {
    title: `Puzzelin - ${t('An online puzzle for you and your friends!')}`,
    description: t(
      'A free and open-source online puzzle where friends and family can help each other and solve fun puzzles together!',
    ),
    keywords: t('puzzle, online, friends, family, social, fun, collaboration, free, open source'),
    authors: [{ name: 'David Jensen', url: 'https://github.com/Tsourdox' }],
  };
}

export async function generateStaticParams() {
  return getLangs().map((lang) => ({ lang }));
}

export default async function RootLayout({ children, params }: PropsWithLangParam) {
  const { lang } = await params;
  return (
    <html lang={lang} className="h-full">
      <body
        className={twMerge(
          myFont.className,
          'relative min-h-full flex flex-col text-zinc-100 bg-zinc-950',
        )}
      >
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
