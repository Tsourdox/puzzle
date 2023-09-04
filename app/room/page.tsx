import { AppBar } from '@/components/AppBar';
import PuzzleCanvas from '@/components/PuzzleCanvas';

export default function PuzzlePage() {
  return (
    <>
      <main className="relative flex-1 bg-neutral-800">
        <PuzzleCanvas />
      </main>
      <AppBar />
    </>
  );
}
