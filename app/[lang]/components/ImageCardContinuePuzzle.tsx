'use client';

import { Lang, getTranslation } from '@/locales';
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
      <TrashIcon
        width={20}
        height={20}
        className="absolute top-4 right-4 cursor-pointer drop-shadow-lg p-2 box-content"
        onClick={deletePuzzle}
      />
      <h2 className="text-xl drop-shadow-lg">{t('Size')}</h2>
      <section className="flex gap-1 md:gap-2">
        {sizes.map((sizeLabel) => (
          <div
            key={sizeLabel}
            className={twMerge(
              'rounded-full backdrop-blur-lg uppercase px-2 md:px-3 md:py-1 bg-neutral-500/20',
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
    </ImageCardContainer>
  );
}
