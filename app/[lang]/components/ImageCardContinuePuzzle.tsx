'use client';

import Button from '@/components/Button';
import { Lang, getTranslation } from '@/language';
import ClientDB from '@/puzzle/network/clientDB';
import { IPuzzleData } from '@/puzzle/network/types';
import { sizes } from '@/utils/sizes';
import { TrashIcon } from '@heroicons/react/20/solid';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import ImageCardContainer from './ImageCardContainer';
import StartPuzzleButton from './StartPuzzleButton';

interface Props {
  room: string;
  onDeleted: (room: string) => void;
  lang: Lang;
}

export default function ImageCardContinuePuzzle(props: Props) {
  const t = getTranslation(props.lang);
  const [puzzleData, setPuzzleData] = useState<IPuzzleData>();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    (async () => {
      const clientDB = new ClientDB(props.room);
      await clientDB.open();
      const puzzle = await clientDB.loadPuzzle();
      setPuzzleData(puzzle);
      clientDB.close();
    })();
  }, [props.room]);

  const deletePuzzle = async () => {
    const clientDB = new ClientDB(props.room);
    await clientDB.delete();
    props.onDeleted(props.room);
  };

  if (!puzzleData) return null;

  return (
    <ImageCardContainer image={puzzleData.imageData}>
      {showDeleteConfirmation ? (
        <>
          <h2 className="text-xl">{t('Delete puzzle')}</h2>
          <p className="mx-4 text-center">{t('Are you sure?')}</p>
          <div className="flex gap-2">
            <Button variant="secondary" className="text-sm md:text-base" onClick={deletePuzzle}>
              {t('Yes')}
            </Button>
            <Button
              className="text-sm md:text-base"
              onClick={() => setShowDeleteConfirmation(false)}
            >
              {t('No')}
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Desktop: trash icon in top right corner of overlay */}
          <TrashIcon
            width={20}
            height={20}
            className="hidden md:block md:absolute md:top-4 md:right-4 cursor-pointer text-white drop-shadow-lg hover:text-zinc-300 active:scale-95 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirmation(true);
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
                setShowDeleteConfirmation(true);
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
          <StartPuzzleButton image={puzzleData.imageData} room={props.room}>
            {t('Continue puzzle')}
          </StartPuzzleButton>
        </>
      )}
    </ImageCardContainer>
  );
}
