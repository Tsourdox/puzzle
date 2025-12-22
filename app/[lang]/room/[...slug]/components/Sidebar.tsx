'use client';
import { AppBar } from '@/components/AppBar';
import Button from '@/components/Button';
import SocialLinks from '@/components/SocialLinks';
import { getTranslation } from '@/language';
import { PropsWithLang } from '@/utils/general';
import {
  ArrowPathRoundedSquareIcon,
  CheckIcon,
  ClipboardDocumentIcon,
  Cog8ToothIcon,
  PuzzlePieceIcon,
  UserGroupIcon,
} from '@heroicons/react/20/solid';
import Link from 'next/link';
import { useState } from 'react';

interface SidebarProps extends PropsWithLang {
  roomCode: string;
}

export default function Sidebar({ lang, roomCode }: SidebarProps) {
  const t = getTranslation(lang);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const roomUrl = typeof window !== 'undefined' ? `${window.location.origin}/${lang}/room/${roomCode}` : '';

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <AppBar className="flex flex-col gap-4">
      <header className="border-b-1 px-4 border-zinc-700/50 mt-2 mb-4 ">
        <h1 className="text-center text-transparent bg-clip-text bg-gradient-to-l from-purple-700 to-purple-100">
          Puzzelin
        </h1>
      </header>
      <section className="flex-1 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="text-sm text-zinc-400 text-center">{t('Room code')}</div>
          <div className="flex items-center gap-2 bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
            <code className="flex-1 text-center text-2xl font-mono tracking-wider text-purple-300">
              {roomCode}
            </code>
            <button
              onClick={copyRoomCode}
              className="p-2 hover:bg-zinc-700/50 rounded transition-colors"
              title={t('Copy room code')}
            >
              {copiedCode ? (
                <CheckIcon width={20} height={20} className="text-green-400" />
              ) : (
                <ClipboardDocumentIcon width={20} height={20} className="text-zinc-400" />
              )}
            </button>
          </div>
        </div>

        <Link href="/" className="flex flex-col">
          <Button variant="secondary" icon={<PuzzlePieceIcon width={24} height={24} />}>
            {t('New puzzle')}
          </Button>
        </Link>

        <Button
          variant="secondary"
          icon={copiedLink ? <CheckIcon width={24} height={24} /> : <UserGroupIcon width={24} height={24} />}
          onClick={copyRoomLink}
        >
          {copiedLink ? t('Link copied!') : t('Invite friends')}
        </Button>

        <Button
          disabled
          disabledText={t('Coming soon')}
          variant="secondary"
          icon={<ArrowPathRoundedSquareIcon width={24} height={24} />}
        >
          {t('Change room')}
        </Button>
        <Button
          disabled
          disabledText={t('Coming soon')}
          variant="secondary"
          icon={<Cog8ToothIcon width={24} height={24} />}
        >
          {t('Settings')}
        </Button>
      </section>
      <footer className="flex justify-between">
        <SocialLinks className="text-sm flex flex-col" />
        {/* <ShareLink /> */}
      </footer>
    </AppBar>
  );
}
