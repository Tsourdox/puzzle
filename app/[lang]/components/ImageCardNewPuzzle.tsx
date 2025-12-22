'use client';
import { showPuzzleSelectionAtom } from '@/app/atoms';
import Button from '@/components/Button';
import { Lang, getTranslation } from '@/language';
import { PexelsImage } from '@/utils/pexels';
import { useSetAtom } from 'jotai';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import ImageCardContainer from './ImageCardContainer';
import SizeButtons from './SizeButtons';
import ConfirmationView from './ConfirmationView';

interface Props {
  image: PexelsImage;
  lang: Lang;
}

export default function ImageCardNewPuzzle({ image, lang }: Props) {
  const t = getTranslation(lang);
  const router = useRouter();
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
    router.push(`/${lang}/room/${roomCode}/${image.id}`);
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
