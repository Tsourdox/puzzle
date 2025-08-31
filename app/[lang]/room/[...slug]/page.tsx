import { Lang, getTranslation } from '@/language';
import { SearchParams } from '@/utils/general';
import { getPexelsImage } from '@/utils/pexels';
import { Metadata } from 'next';
import ImagePreview from './components/ImagePreview';
import PuzzleCanvas from './components/PuzzleCanvas';
import Sidebar from './components/Sidebar';

type Props = {
  params: Promise<{ slug: string[]; lang: Lang }>;
  searchParams: SearchParams;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lang } = await params;
  const [roomCode] = slug;
  const t = getTranslation(lang);

  return {
    title: `Puzzelin - ${t('In Room')} ${roomCode}`,
    description: t(
      'Select pieces and drag and rotate them to solve the puzzle. Invite your friends to help you!',
    ),
  };
}

export default async function RoomPage({ params }: Props) {
  const { slug, lang } = await params;
  const [roomCode, imageId] = slug;

  const image = await getPexelsImage(imageId);

  return (
    <div className="flex flex-col flex-1">
      <main
        className="flex flex-col flex-1 bg-cover"
        style={{ backgroundImage: `url('${image.src.medium}')` }}
      >
        <div className="relative flex flex-col flex-1 backdrop-blur-3xl bg-zinc-800/70">
          <PuzzleCanvas image={image} roomCode={roomCode} lang={lang} />
        </div>
      </main>
      <Sidebar lang={lang} />
      <ImagePreview image={image} />
    </div>
  );
}
