import ImagePreview from '@/components/ImagePreview';
import Sidebar from '@/components/Sidebar';
import { Metadata } from 'next';
import PuzzleCanvas from './canvas';

type Props = {
  params: { code: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Puzzelin - In Room ${params.code}`,
    description: 'Solve the puzzle by clicking, scrolling & dragging.',
  };
}

export default function RoomPage() {
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
