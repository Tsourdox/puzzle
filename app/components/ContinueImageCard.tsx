'use client';

import ClientDB from '@/puzzle/network/clientDB';
import { IPuzzleData } from '@/puzzle/network/types';
import { sizes } from '@/utils/sizes';
import { TrashIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import StartPuzzleButton from './StartPuzzleButton';

interface Props {
  room: string;
  onDeleted: (room: string) => void;
}

export default function ContinueImageCard(props: Props) {
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
    <div className="group w-56 md:w-80 relative aspect-square flex-none rounded-3xl overflow-hidden">
      <Image
        src={puzzleData.imageData.src.medium}
        alt={puzzleData.imageData.alt}
        width={300}
        height={300}
        className="w-full h-full object-cover"
      />

      <div className="absolute invisible group-hover:visible top-0 left-0 w-full h-full backdrop-blur-sm bg-black/10 flex flex-col justify-center items-center gap-4">
        <TrashIcon
          width={20}
          height={20}
          className="absolute top-4 right-4 cursor-pointer drop-shadow-lg p-2 box-content"
          onClick={deletePuzzle}
        />
        <h2 className="text-xl drop-shadow-lg">Storlek</h2>
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
        <StartPuzzleButton size={puzzleData.size} image={puzzleData.imageData} room={props.room}>
          Forsätt Pussla
        </StartPuzzleButton>
      </div>
    </div>
  );
}
