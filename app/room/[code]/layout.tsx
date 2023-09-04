import { AppBar } from '@/components/AppBar';
import type { Metadata } from 'next';

type Props = {
  params: { code: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Puzzelin - In Room ${params.code}`,
    description: 'Solve the puzzle by clicking, scrolling & dragging.',
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <main className="flex flex-col flex-1 bg-neutral-800">{children}</main>
      <AppBar />
    </div>
  );
}
