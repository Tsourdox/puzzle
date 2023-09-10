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
  return <PuzzleCanvas />;
}
