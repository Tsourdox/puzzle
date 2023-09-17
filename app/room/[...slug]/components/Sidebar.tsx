import {
  ArrowPathRoundedSquareIcon,
  Cog8ToothIcon,
  PuzzlePieceIcon,
  UserGroupIcon,
} from '@heroicons/react/20/solid';
import Link from 'next/link';
import { AppBar } from '../../../../components/AppBar';
import Button from '../../../../components/Button';
import SocialLinks from '../../../../components/SocialLinks';

export default function Sidebar() {
  return (
    <AppBar className="flex flex-col gap-4">
      <header className="border-b-2 px-4 border-neutral-700/50 mb-4 ">
        <h1 className="text-transparent bg-clip-text bg-gradient-to-l from-purple-700 to-purple-100">
          Puzzelin
        </h1>
      </header>
      <section className="flex-1 flex flex-col gap-6">
        <Link href="/" className="flex flex-col">
          <Button variant="secondary" icon={<PuzzlePieceIcon width={24} height={24} />}>
            Nytt Puzzel
          </Button>
        </Link>

        <Button disabled variant="secondary" icon={<UserGroupIcon width={24} height={24} />}>
          Bjud in vänner
        </Button>
        <Button
          disabled
          variant="secondary"
          icon={<ArrowPathRoundedSquareIcon width={24} height={24} />}
        >
          Byt rum
        </Button>
        <Button disabled variant="secondary" icon={<Cog8ToothIcon width={24} height={24} />}>
          Inställningar
        </Button>
      </section>
      <footer className="flex justify-between">
        <SocialLinks className="text-sm flex flex-col" />
        {/* <ShareLink /> */}
      </footer>
    </AppBar>
  );
}
