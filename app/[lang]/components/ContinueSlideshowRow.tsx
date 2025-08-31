'use client';

import { getTranslation } from '@/language';
import ClientDB from '@/puzzle/network/clientDB';
import { PropsWithLang } from '@/utils/general';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import ImageCardContinuePuzzle from './ImageCardContinuePuzzle';
import ScrollBox from './ScrollBox';

export default function ContinueSlideshowRow({ lang }: PropsWithLang) {
  const t = getTranslation(lang);
  const [isLoaded, setIsLoaded] = useState(false);
  const [rooms, setRooms] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const clientDB = new ClientDB();
      await clientDB.open();
      setRooms(clientDB.getStoredRoomNames);
      setIsLoaded(true);
      clientDB.close();
    })();
  }, []);

  const removeRoom = (room: string) => setRooms((rooms) => rooms.filter((r) => r !== room));

  return (
    <section className="flex flex-col gap-4">
      <h2
        className={twMerge(
          'invisible text-3xl capitalize font-semibold text-zinc-200 ml-2 sm:ml-8 md:ml-20 pl-2 font-sans',
          rooms.length && 'visible',
        )}
      >
        {t('Continue puzzle')}
      </h2>
      {rooms.length ? (
        <ScrollBox>
          {rooms.map((room) => (
            <ImageCardContinuePuzzle key={room} room={room} onDeleted={removeRoom} lang={lang} />
          ))}
        </ScrollBox>
      ) : (
        <div className="relative flex gap-6 overflow-x-hidden">
          <div className="sm:w-4 md:w-16 aspect-square flex-none" />
          <div className="group w-44 sm:w-56 md:w-80 relative aspect-square flex-none rounded-3xl overflow-hidden bg-gray-800/20" />
          <div className="group w-44 sm:w-56 md:w-80 relative aspect-square flex-none rounded-3xl overflow-hidden bg-gray-800/20" />
          <div className="group w-44 sm:w-56 md:w-80 relative aspect-square flex-none rounded-3xl overflow-hidden bg-gray-800/20" />
          <div className="group w-44 sm:w-56 md:w-80 relative aspect-square flex-none rounded-3xl overflow-hidden bg-gray-800/20" />
          <div className="group w-44 sm:w-56 md:w-80 relative aspect-square flex-none rounded-3xl overflow-hidden bg-gray-800/20" />
          <div className="group w-44 sm:w-56 md:w-80 relative aspect-square flex-none rounded-3xl overflow-hidden bg-gray-800/20" />

          {isLoaded && (
            <div className="absolute inset-0 px-12">
              <div className="h-full flex flex-col items-center justify-center text-center gap-2">
                <span className="text-4xl text-zinc-300 font-sans hidden sm:flex">
                  {t('You have no ongoing puzzles')}
                </span>
                <span className="text-lg font-light text-zinc-400 font-sans">
                  {t(
                    'When you have started a puzzle it will show up here so that you can finish it later.',
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
