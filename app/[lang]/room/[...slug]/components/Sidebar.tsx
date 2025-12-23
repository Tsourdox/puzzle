import { AppBar } from '@/components/AppBar';
import Button from '@/components/Button';
import SocialLinks from '@/components/SocialLinks';
import { getTranslation } from '@/language';
import { PropsWithLang } from '@/utils/general';
import { ArrowPathRoundedSquareIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import InviteFriendsButton from './InviteFriendsButton';
import NewPuzzleButton from './NewPuzzleButton';
import RoomCodeDisplay from './RoomCodeDisplay';
import SettingsButton from './SettingsButton';

interface SidebarProps extends PropsWithLang {
  roomCode: string;
}

export default function Sidebar({ lang, roomCode }: SidebarProps) {
  const t = getTranslation(lang);

  return (
    <AppBar className="flex flex-col gap-4">
      <header className="border-b px-4 border-zinc-700/50 mt-2">
        <Link href={`/${lang}`}>
          <h1 className="text-center text-transparent bg-clip-text bg-linear-to-l from-purple-700 to-purple-100 cursor-pointer hover:opacity-80 transition-opacity">
            Puzzelin
          </h1>
        </Link>
        <RoomCodeDisplay roomCode={roomCode} lang={lang} />
      </header>
      <section className="flex-1 flex flex-col gap-6">
        <NewPuzzleButton lang={lang} />
        <InviteFriendsButton roomCode={roomCode} lang={lang} />

        <Button
          disabled
          disabledText={t('Coming soon')}
          variant="secondary"
          icon={<ArrowPathRoundedSquareIcon width={24} height={24} />}
        >
          {t('Change room')}
        </Button>
        <SettingsButton lang={lang} />
      </section>
      <footer className="flex justify-between">
        <SocialLinks className="text-sm flex flex-col" />
        {/* <ShareLink /> */}
      </footer>
    </AppBar>
  );
}
