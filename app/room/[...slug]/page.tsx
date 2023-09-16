import ImagePreview from '@/app/room/[...slug]/components/ImagePreview';
import Sidebar from '@/app/room/[...slug]/components/Sidebar';
import { getPexelsImage } from '@/utils/pexels';
import { SearchParams, parseEnum } from '@/utils/searchParams';
import { SizeEnum } from '@/utils/sizes';
import { Metadata } from 'next';
import PuzzleCanvas from './canvas';

type Props = {
  params: { slug: string[] };
  searchParams: SearchParams;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [code] = params.slug;

  return {
    title: `Puzzelin - In Room ${code}`,
    description: 'Solve the puzzle by clicking, scrolling & dragging.',
  };
}

export default async function RoomPage({ params, searchParams }: Props) {
  const [code, imageId] = params.slug;
  const size = parseEnum(searchParams.size, SizeEnum, 'xs');

  const image = await getPexelsImage(imageId);

  return (
    <div className="flex flex-col flex-1">
      <main className="flex flex-col flex-1">
        <PuzzleCanvas image={image} size={size} />
      </main>
      <Sidebar />
      <ImagePreview image={image} />
    </div>
  );
}
