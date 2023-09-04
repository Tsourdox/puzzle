import clsx from 'clsx';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
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
      <body className={clsx(myFont.className, 'bg-neutral-950')}>
        {children}
      </body>
    </html>
  );
}
