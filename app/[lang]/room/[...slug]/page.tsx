import { Lang, getTranslation } from '@/language';
import { getPexelsImage } from '@/utils/pexels';
import { SearchParams } from '@/utils/searchParams';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import ImagePreview from './components/ImagePreview';
import Sidebar from './components/Sidebar';

const PuzzleCanvas = dynamic(() => import('./components/PuzzleCanvas'));

type Props = {
  params: { slug: string[]; lang: Lang };
  searchParams: SearchParams;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [roomCode] = params.slug;
  const t = getTranslation(params.lang);

  return {
    title: `Puzzelin - ${t('In Room')} ${roomCode}`,
    description: t(
      'Select pieces and drag and rotate them to solve the puzzle. Invite your friends to help you!',
    ),
  };
}

export default async function RoomPage({ params }: Props) {
  const [roomCode, imageId] = params.slug;
  console.log('RoomPage', roomCode);

  const image = await getPexelsImage(imageId);

  return (
    <div className="flex flex-col flex-1">
      <main
        className="flex flex-col flex-1 bg-cover"
        style={{ backgroundImage: `url('${image.src.medium}')` }}
      >
        <div className="relative flex flex-col flex-1 backdrop-blur-3xl bg-neutral-800/70">
          <PuzzleCanvas image={image} roomCode={roomCode} lang={params.lang} />
        </div>
      </main>
      <Sidebar lang={params.lang} />
      <ImagePreview image={image} />
    </div>
  );
}
