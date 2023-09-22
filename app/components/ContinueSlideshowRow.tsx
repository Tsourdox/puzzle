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

  if (!rooms.length) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-3xl capitalize font-semibold text-neutral-200 ml-8 md:ml-20 pl-2 font-sans">
        Forsätt pussla
      </h2>
      <ScrollBox>
        {rooms.map((room) => (
          <ContinueImageCard key={room} room={room} onDeleted={removeRoom} />
        ))}
      </ScrollBox>
    </section>
  );
}
