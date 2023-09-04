import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const myFont = localFont({
  src: '../public/fonts/black-ops-one.ttf',
  variable: '--font-primary',
});

export const metadata: Metadata = {
  title: 'Puzzelin',
  description: 'Ett online pussel för dig och dina vänner!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={myFont.className}>{children}</body>
    </html>
  );
}
