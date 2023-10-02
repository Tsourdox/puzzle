import { getLangs } from '@/locales';
import StoreProvider from '@/store/StoreProvider';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';
import './globals.css';

const myFont = localFont({
  src: '../../public/fonts/black-ops-one.ttf',
  variable: '--font-primary',
});

export const metadata: Metadata = {
  title: 'Puzzelin - Ett online pussel för dig och dina vänner!',
  description:
    'Ett gratis och open-source online pussel där vänner och familj kan hjälpas åt och lösa roliga pussel ihop!',
  keywords: 'pussel, online, vänner, familj, socialt, kul, samarbete, gratis, öppen källkod',
  authors: [{ name: 'David Jensen', url: 'https://github.com/Tsourdox' }],
};

export async function generateStaticParams() {
  return getLangs().map((lang) => ({ lang }));
}

export default function RootLayout({
  children,
  params,
}: PropsWithChildren<{ params: { lang: string } }>) {
  return (
    <html lang={params.lang} className="h-full">
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
