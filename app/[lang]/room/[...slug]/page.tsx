import { Lang, getTranslation } from '@/language';
import { getPexelsImage } from '@/utils/pexels';
import { SearchParams } from '@/utils/searchParams';
import { Metadata } from 'next';
import ImagePreview from './components/ImagePreview';
import PuzzleCanvas from './components/PuzzleCanvas';
import Sidebar from './components/Sidebar';

type Props = {
  params: { slug: string[]; lang: Lang };
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
