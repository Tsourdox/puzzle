import { AppBar } from '@/components/AppBar';
import Button from '@/components/Button';
import ShareLink from '@/components/ShareLink';
import SocialLinks from '@/components/SocialLinks';
import {
  ArrowPathRoundedSquareIcon,
  Cog8ToothIcon,
  PuzzlePieceIcon,
  UserGroupIcon,
} from '@heroicons/react/20/solid';
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
        <div className="relative flex h-full">
          <main className="flex flex-col flex-1 bg-neutral-800">
            {children}
          </main>
          <AppBar className="flex flex-col gap-4">
            <header className="border-b-2 px-4 border-neutral-700/50 mb-4 ">
              <h1 className="text-transparent bg-clip-text bg-gradient-to-l from-purple-700 to-purple-100">
                Puzzelin
              </h1>
            </header>
            <section className="grow flex flex-col gap-6">
              <Button
                variant="secondary"
                icon={<PuzzlePieceIcon width={24} height={24} />}
              >
                Nytt Puzzel
              </Button>
              <Button
                variant="secondary"
                icon={<UserGroupIcon width={24} height={24} />}
              >
                Bjud in vänner
              </Button>
              <Button
                variant="secondary"
                icon={<ArrowPathRoundedSquareIcon width={24} height={24} />}
              >
                Byt rum
              </Button>
              <Button
                variant="secondary"
                icon={<Cog8ToothIcon width={24} height={24} />}
              >
                Inställningar
              </Button>
            </section>
            <footer className="flex justify-between">
              <SocialLinks className="text-sm flex flex-col" />
              <ShareLink />
            </footer>
          </AppBar>
        </div>
      </body>
    </html>
  );
}
