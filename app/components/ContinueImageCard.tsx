'use client';

import ClientDB from '@/puzzle/network/clientDB';
import { TrashIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Props {
  room: string;
}

export default function ImageCard({ room }: Props) {
  const [image, setImage] = useState<string>();

  useEffect(() => {
    (async () => {
      const clientDB = new ClientDB(room);
      await clientDB.init();
      const puzzle = await clientDB.loadPuzzle();
      setImage(puzzle.image);
      clientDB.close();
    })();
  }, [room]);

  if (!image) return null;

  return (
    <div className="group w-56 md:w-80 relative aspect-square flex-none rounded-3xl overflow-hidden">
      <Image src={image} alt="" width={300} height={300} className="w-full h-full object-cover" />

      <div className="absolute invisible group-hover:visible top-0 left-0 w-full h-full backdrop-blur-sm bg-black/10 flex flex-col justify-center items-center gap-4">
        <TrashIcon
          width={20}
          height={20}
          className="absolute top-6 right-6 cursor-pointer drop-shadow-lg"
        />
        <h2 className="text-xl drop-shadow-lg">Välj storlek</h2>
        {/* <StartPuzzleButton size={size} image={image} /> */}
      </div>
    </div>
  );
}
