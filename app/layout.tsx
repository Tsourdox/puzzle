import StoreProvider from '@/store/StoreProvider';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';
import './globals.css';

const myFont = localFont({
  src: '../public/fonts/black-ops-one.ttf',
  variable: '--font-primary',
});

export const metadata: Metadata = {
  title: 'Puzzelin - Gratis Online Pussel',
  description: 'Ett online pussel för dig och dina vänner!',
  keywords:
    'pussel, online, vänner, familj, socialt, kul, samarbete, gratis, öppen källkod',
  authors: [{ name: 'David Jensen', url: '' }],
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" className="h-full">
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
