import { Locale, getTranslation } from '@/locales';
import { getPexelsImage } from '@/utils/pexels';
import { SearchParams } from '@/utils/searchParams';
import { Metadata } from 'next';
import ImagePreview from './components/ImagePreview';
import PuzzleCanvas from './components/PuzzleCanvas';
import Sidebar from './components/Sidebar';

type Props = {
  params: { slug: string[]; lang: Locale };
  searchParams: SearchParams;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [roomCode] = params.slug;
  const t = getTranslation(params.lang);

  return {
    title: `Puzzelin - In Room ${roomCode}`,
    description: 'Solve the puzzle by clicking, scrolling & dragging.',
  };
}

export default async function RoomPage({ params }: Props) {
  const t = getTranslation(params.lang);
  const [roomCode, imageId] = params.slug;

  const image = await getPexelsImage(imageId);

  return (
    <div className="flex flex-col flex-1">
      <main
        className="flex flex-col flex-1 bg-cover"
        style={{ backgroundImage: `url('${image.src.medium}')` }}
      >
        <div className="relative flex flex-col flex-1 backdrop-blur-3xl bg-neutral-800/70">
          <PuzzleCanvas image={image} roomCode={roomCode} />
        </div>
      </main>
      <Sidebar t={t} />
      <ImagePreview image={image} />
    </div>
  );
}
