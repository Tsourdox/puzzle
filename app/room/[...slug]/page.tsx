import ImagePreview from '@/app/room/[...slug]/components/ImagePreview';
import Sidebar from '@/app/room/[...slug]/components/Sidebar';
import { getPexelsImage } from '@/utils/pexels';
import { SearchParams, parseEnum } from '@/utils/searchParams';
import { SizeEnum } from '@/utils/sizes';
import { Metadata } from 'next';
import PuzzleCanvas from './components/PuzzleCanvas';

type Props = {
  params: { slug: string[] };
  searchParams: SearchParams;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [roomCode] = params.slug;

  return {
    title: `Puzzelin - In Room ${roomCode}`,
    description: 'Solve the puzzle by clicking, scrolling & dragging.',
  };
}

export default async function RoomPage({ params, searchParams }: Props) {
  const [roomCode, imageId] = params.slug;
  const size = parseEnum(searchParams.size, SizeEnum, 'xs');

  const image = await getPexelsImage(imageId);

  return (
    <div className="flex flex-col flex-1">
      <main
        className="flex flex-col flex-1 bg-cover"
        style={{ backgroundImage: `url('${image.src.medium}')` }}
      >
        <div className="relative flex flex-col flex-1 backdrop-blur-3xl bg-neutral-800/70">
          <PuzzleCanvas image={image} size={size} roomCode={roomCode} />
        </div>
      </main>
      <Sidebar />
      <ImagePreview image={image} />
    </div>
  );
}
