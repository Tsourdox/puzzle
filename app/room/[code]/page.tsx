import ImagePreview from '@/app/room/[code]/components/ImagePreview';
import Sidebar from '@/app/room/[code]/components/Sidebar';
import { SearchParams, parseEnum } from '@/utils/searchParams';
import { SizeEnum } from '@/utils/sizes';
import { Metadata } from 'next';
import PuzzleCanvas from './canvas';

type Props = {
  params: { code: string };
  searchParams: SearchParams;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Puzzelin - In Room ${params.code}`,
    description: 'Solve the puzzle by clicking, scrolling & dragging.',
  };
}

export default function RoomPage({ searchParams }: Props) {
  const size = parseEnum(searchParams.size, SizeEnum, 'm');

  return (
    <div className="flex flex-col flex-1">
      <main className="flex flex-col flex-1">
        <PuzzleCanvas />
      </main>
      <Sidebar />
      <ImagePreview />
    </div>
  );
}
