'use client';

import { showPuzzleSelectionAtom } from '@/app/atoms';
import Button from '@/components/Button';
import { Lang, getTranslation } from '@/language';
import ClientDB from '@/puzzle/network/clientDB';
import { IPuzzleData } from '@/puzzle/network/types';
import { sizes } from '@/utils/sizes';
import { TrashIcon } from '@heroicons/react/20/solid';
import { useSetAtom } from 'jotai';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import ConfirmationView from './ConfirmationView';
import ImageCardContainer from './ImageCardContainer';

type ConfirmationType = 'none' | 'delete' | 'newPuzzle';

interface Props {
  room: string;
  onDeleted: (room: string) => void;
  lang: Lang;
}

export default function ImageCardContinuePuzzle(props: Props) {
  const t = getTranslation(props.lang);
  const router = useRouter();
  const pathname = usePathname();
  const setShowPuzzleSelection = useSetAtom(showPuzzleSelectionAtom);
  const [puzzleData, setPuzzleData] = useState<IPuzzleData>();
  const [confirmationType, setConfirmationType] = useState<ConfirmationType>('none');

  useEffect(() => {
    (async () => {
      const clientDB = new ClientDB(props.room);
      await clientDB.open();
      const puzzle = await clientDB.loadPuzzle();
      setPuzzleData(puzzle);
      clientDB.close();
    })();
  }, [props.room]);

  const isInRoom = pathname?.includes('/room/');

  const handleContinuePuzzle = () => {
    if (isInRoom) {
      setConfirmationType('newPuzzle');
    } else {
      navigateToRoom();
    }
  };

  const navigateToRoom = () => {
    setShowPuzzleSelection(false);
    router.push(`/${props.lang}/room/${props.room}/${puzzleData?.imageData.id}`);
  };

  const confirmNavigate = () => {
    setConfirmationType('none');
    navigateToRoom();
  };

  const deletePuzzle = async () => {
    const clientDB = new ClientDB(props.room);
    await clientDB.delete();
    props.onDeleted(props.room);
  };

  if (!puzzleData) return null;

  return (
    <ImageCardContainer
      image={puzzleData.imageData}
      onMouseLeave={() => setConfirmationType('none')}
    >
      {confirmationType === 'delete' ? (
        <ConfirmationView
          title={t('Delete puzzle')}
          message={t('Are you sure?')}
          onConfirm={deletePuzzle}
          onCancel={() => setConfirmationType('none')}
          confirmLabel={t('Yes')}
          cancelLabel={t('No')}
        />
      ) : confirmationType === 'newPuzzle' ? (
        <ConfirmationView
          title={t('Are you sure?')}
          message={t('Progress will be lost')}
          onConfirm={confirmNavigate}
          onCancel={() => setConfirmationType('none')}
          confirmLabel={t('Yes')}
          cancelLabel={t('No')}
        />
      ) : (
        <>
          {/* Desktop: trash icon in top right corner of overlay */}
          <TrashIcon
            width={20}
            height={20}
            className="hidden md:block md:absolute md:top-4 md:right-4 cursor-pointer text-white drop-shadow-lg hover:text-zinc-300 active:scale-95 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmationType('delete');
            }}
          />
          {/* Mobile: trash icon next to Size text */}
          <div className="relative w-full flex justify-center px-8">
            <h2 className="text-xl drop-shadow-lg">{t('Size')}</h2>
            <TrashIcon
              width={20}
              height={20}
              className="md:hidden absolute right-6 cursor-pointer text-white drop-shadow-lg hover:text-zinc-300 active:scale-95 transition-transform"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmationType('delete');
              }}
            />
          </div>
          <section className="flex gap-1 md:gap-2">
            {sizes.map((sizeLabel) => (
              <div
                key={sizeLabel}
                className={twMerge(
                  'rounded-full backdrop-blur-lg uppercase px-2 md:px-3 md:py-1 bg-zinc-500/20',
                  puzzleData.size === sizeLabel ? 'bg-purple-800/60' : 'opacity-50',
                )}
              >
                {sizeLabel}
              </div>
            ))}
          </section>
          <Button className="text-sm md:text-base" onClick={handleContinuePuzzle}>
            {t('Continue puzzle')}
          </Button>
        </>
      )}
    </ImageCardContainer>
  );
}
