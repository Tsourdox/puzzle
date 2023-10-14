import { getLangs, getTranslation } from '@/language';
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
  const t = getTranslation(params.lang);
  return {
    title: `Puzzelin - ${t('An online puzzle for you and your friends!')}`,
    description: t(
      'A free and open-source online puzzle where friends and family can help each other and solve fun puzzles together!',
    ),
    keywords: t('puzzle, online, friends, family, social, fun, collaboration, free, open source'),
    authors: [{ name: 'David Jensen', url: 'https://github.com/Tsourdox' }],
    viewport: 'width=device-width, initial-scale=1.0, viewport-fit=cover',
  };
}

export async function generateStaticParams() {
  return getLangs().map((lang) => ({ lang }));
}

export default function RootLayout({ children, params }: PropsWithLangParam) {
  return (
    <html lang={params.lang} className="h-full bg-black">
      <body
        className={twMerge(
          myFont.className,
          'relative min-h-full flex flex-col',
          'bg-gradient-to-bl from-[#210034] via-20% via-neutral-950 to-100% to-[#110024]',
        )}
      >
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
