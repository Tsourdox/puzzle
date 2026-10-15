import { showPuzzleSelectionAtom, sizeAtom } from '@/app/atoms';
import Button from '@/components/Button';
import { Lang, getTranslation } from '@/language';
import { PexelsImage } from '@/utils/pexelsImage';
import { useAtomValue, useSetAtom } from 'jotai';
import { useState } from 'react';
import { navigate, roomPath, usePathname } from '../navigation';
import ImageCardContainer from './ImageCardContainer';
import SizeButtons from './SizeButtons';
import ConfirmationView from './ConfirmationView';

interface Props {
  image: PexelsImage;
  lang: Lang;
}

export default function ImageCardNewPuzzle({ image, lang }: Props) {
  const t = getTranslation(lang);
  const size = useAtomValue(sizeAtom);
  const pathname = usePathname();
  const setShowPuzzleSelection = useSetAtom(showPuzzleSelectionAtom);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const isInRoom = pathname?.includes('/room/');
  const currentRoomCode = isInRoom ? pathname?.split('/room/')[1]?.split('/')[0] : null;
  const roomCode = currentRoomCode || Math.random().toString().slice(4, 8);

  const handleBeginPuzzle = () => {
    if (isInRoom) {
      setShowConfirmation(true);
    } else {
      navigateToRoom();
    }
  };

  const navigateToRoom = () => {
    setShowPuzzleSelection(false);
    navigate(`${roomPath(lang, roomCode, image.id)}?size=${size}`);
  };

  const confirmNavigate = () => {
    setShowConfirmation(false);
    navigateToRoom();
  };

  return (
    <ImageCardContainer image={image} onMouseLeave={() => setShowConfirmation(false)}>
      {showConfirmation ? (
        <ConfirmationView
          title={t('Are you sure?')}
          message={t('Progress will be lost')}
          onConfirm={confirmNavigate}
          onCancel={() => setShowConfirmation(false)}
          confirmLabel={t('Yes')}
          cancelLabel={t('No')}
        />
      ) : (
        <>
          <h2 className="text-xl drop-shadow-lg">{t('Select size')}</h2>
          <SizeButtons />
          <Button className="text-sm md:text-base" onClick={handleBeginPuzzle}>
            {t('Begin puzzle')}
          </Button>
        </>
      )}
    </ImageCardContainer>
  );
}
