import StoreProvider from '@/store/StoreProvider';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { twMerge } from 'tailwind-merge';
import './globals.css';

const myFont = localFont({
  src: '../public/fonts/black-ops-one.ttf',
  variable: '--font-primary',
});

export const metadata: Metadata = {
  title: 'Puzzelin - Ett Online Pussel',
  description: 'Ett online pussel för dig och dina vänner!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={twMerge(
          myFont.className,
          'bg-gradient-to-bl from-[#210034] via-20% via-neutral-950 to-100% to-[#110024]',
        )}
      >
        <StoreProvider>
          <div className="relative flex h-full">
            <main className="flex flex-col flex-1">{children}</main>
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
