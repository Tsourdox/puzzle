'use client';
import {
  ArrowPathRoundedSquareIcon,
  Cog8ToothIcon,
  PuzzlePieceIcon,
  UserGroupIcon,
} from '@heroicons/react/20/solid';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AppBar } from './AppBar';
import Button from './Button';
import ShareLink from './ShareLink';
import SocialLinks from './SocialLinks';

export default function Sidebar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = (cb?: () => void) => () => {
    setIsOpen((o) => !o);
    if (cb) cb();
  };

  return (
    <AppBar
      isOpen={isOpen}
      onToggle={toggleSidebar()}
      className="flex flex-col gap-4"
    >
      <header className="border-b-2 px-4 border-neutral-700/50 mb-4 ">
        <h1 className="text-transparent bg-clip-text bg-gradient-to-l from-purple-700 to-purple-100">
          Puzzelin
        </h1>
      </header>
      <section className="grow flex flex-col gap-6">
        <Button
          onClick={toggleSidebar(() => {
            if (window.history.length) {
              router.back();
            } else {
              router.push('/');
            }
          })}
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
  );
}
