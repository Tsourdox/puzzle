'use client';

import ClientDB from '@/puzzle/network/clientDB';
import { useEffect, useState } from 'react';
import ContinueImageCard from './ContinueImageCard';
import ScrollBox from './ScrollBox';

export default function ContinueSlideshowRow() {
  const [rooms, setRooms] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const clientDB = new ClientDB();
      await clientDB.open();
      setRooms(clientDB.getStoredRoomNames);
      clientDB.close();
    })();
  }, []);

  const removeRoom = (room: string) => setRooms((rooms) => rooms.filter((r) => r !== room));

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-3xl capitalize font-semibold text-neutral-200 ml-8 md:ml-20 pl-2 font-sans">
        Forsätt pussla
      </h2>
      {rooms.length ? (
        <ScrollBox>
          {rooms.map((room) => (
            <ContinueImageCard key={room} room={room} onDeleted={removeRoom} />
          ))}
        </ScrollBox>
      ) : (
        <div className="relative flex gap-6 overflow-x-hidden">
          <div className="w-4 md:w-16 aspect-square flex-none" />
          <div className="group w-56 md:w-80 relative aspect-square flex-none rounded-3xl overflow-hidden bg-gray-800/10" />
          <div className="group w-56 md:w-80 relative aspect-square flex-none rounded-3xl overflow-hidden bg-gray-800/10" />
          <div className="group w-56 md:w-80 relative aspect-square flex-none rounded-3xl overflow-hidden bg-gray-800/10" />
          <div className="group w-56 md:w-80 relative aspect-square flex-none rounded-3xl overflow-hidden bg-gray-800/10" />

          <div className="absolute inset-0 p-12">
            <div className="h-full flex flex-col items-center justify-center text-center">
              <span className="text-4xl text-neutral-300 font-sans">
                Du har inga påbörjade pussel
              </span>
              <span className="text-lg font-light text-neutral-400 font-sans">
                När du har påbörjat ett pussel visas det här så att du kan slutföra det senare.
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
