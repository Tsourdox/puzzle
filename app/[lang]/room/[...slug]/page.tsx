import { supabase } from '@/utils/supabase';
import { Lang, getTranslation } from '@/language';
import { SearchParams } from '@/utils/general';
import { getPexelsImage } from '@/utils/pexels';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import ImagePreview from './components/ImagePreview';
import PuzzleCanvas from './components/PuzzleCanvas';
import Sidebar from './components/Sidebar';
import PuzzleSelectionModal from './components/PuzzleSelectionModal';
import PuzzleSelectionGrid from '@/app/[lang]/components/PuzzleSelectionGrid';

type Props = {
  params: Promise<{ slug: string[]; lang: Lang }>;
  searchParams: SearchParams;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lang } = await params;
  const [roomCode] = slug;
  const t = getTranslation(lang);

  return {
    title: `Puzzelin - ${t('In Room')} ${roomCode}`,
    description: t(
      'Select pieces and drag and rotate them to solve the puzzle. Invite your friends to help you!',
    ),
  };
}

export default async function RoomPage({ params }: Props) {
  const { slug, lang } = await params;
  const [roomCode, imageId] = slug;

  // If no imageId provided, fetch from Supabase
  let finalImageId = imageId;
  if (!finalImageId) {
    const { data: room } = await supabase
      .from('rooms')
      .select('puzzle_data')
      .eq('room_code', roomCode)
      .single();

    if (room?.puzzle_data?.imageData?.id) {
      finalImageId = room.puzzle_data.imageData.id;
    } else {
      // Room not found, redirect to home page
      redirect(`/${lang}`);
    }
  }

  const image = await getPexelsImage(finalImageId);

  return (
    <div className="flex flex-col flex-1">
      <main
        className="flex flex-col flex-1 bg-cover"
        style={{ backgroundImage: `url('${image.src.medium}')` }}
      >
        <div className="relative flex flex-col flex-1 backdrop-blur-3xl bg-zinc-800/70">
          <PuzzleCanvas image={image} roomCode={roomCode} lang={lang} />
        </div>
      </main>
      <Sidebar lang={lang} roomCode={roomCode} />
      <ImagePreview image={image} />
      <PuzzleSelectionModal>
        <PuzzleSelectionGrid lang={lang} />
      </PuzzleSelectionModal>
    </div>
  );
}
