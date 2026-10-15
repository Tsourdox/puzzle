import { Lang } from '@/language';
import { PexelsImage } from '@/utils/pexelsImage';
import { Size } from '@/utils/sizes';
import PuzzleSelectionGrid from '../components/PuzzleSelectionGrid';
import ImagePreview from './components/ImagePreview';
import PuzzleCanvas from './components/PuzzleCanvas';
import PuzzleSelectionModal from './components/PuzzleSelectionModal';
import SettingsModal from './components/SettingsModal';
import Sidebar from './components/Sidebar';
import RoomErrorBoundary from './RoomErrorBoundary';
import useGallery from './useGallery';

type Props = {
  lang: Lang;
  roomCode: string;
  image: PexelsImage;
  size: Size;
};

export default function RoomPage({ lang, roomCode, image, size }: Props) {
  return (
    <RoomErrorBoundary lang={lang}>
      <div className="flex flex-col flex-1">
        <main
          className="flex flex-col flex-1 bg-cover"
          style={{ backgroundImage: `url('${image.src.medium}')` }}
        >
          <div className="relative flex flex-col flex-1 backdrop-blur-3xl bg-zinc-800/70">
            <PuzzleCanvas image={image} roomCode={roomCode} lang={lang} size={size} />
          </div>
        </main>
        <Sidebar lang={lang} roomCode={roomCode} />
        <ImagePreview image={image} />
        <PuzzleSelectionModal>
          <Gallery lang={lang} />
        </PuzzleSelectionModal>
        <SettingsModal lang={lang} />
      </div>
    </RoomErrorBoundary>
  );
}

/** Only fetched once the "new puzzle" modal opens */
function Gallery({ lang }: { lang: Lang }) {
  const rows = useGallery();
  return <PuzzleSelectionGrid lang={lang} rows={rows} />;
}
